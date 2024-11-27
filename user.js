// ==UserScript==
// @name         Bitbucket Server Build Status Favicon
// @namespace    https://github.com/kellyselden
// @version      8
// @description  Monitor builds using tab icons
// @updateURL    https://raw.githubusercontent.com/kellyselden/bitbucket-server-build-status-favicon/main/meta.js
// @downloadURL  https://raw.githubusercontent.com/kellyselden/bitbucket-server-build-status-favicon/main/user.js
// @author       Kelly Selden
// @license      MIT
// @source       https://github.com/kellyselden/bitbucket-server-build-status-favicon
// @supportURL   https://github.com/kellyselden/bitbucket-server-build-status-favicon/issues/new
// @include      http*://*bitbucket*/projects/*/repos/*/pull-requests/*/*
// ==/UserScript==
'use strict';

const icons = {
  'build-in-progress-icon': '🔵',
  'build-successful-icon': '🟢',
  'build-failed-icon': '🔴',
};

const statusIconClass = '[data-testid="pull-request-builds-summary"] .build-status-icon';

function getFavicon() {
  return document.head.querySelector('link[rel="shortcut icon"]');
}

let originalFavicon = getFavicon();

function replaceFavicon(favicon = getFavicon()) {
  if (favicon) {
    document.head.replaceChild(originalFavicon, favicon);
  }
}

function updateFavicon(statusIcon) {
  let favicon = getFavicon();

  let iconText;

  if (statusIcon) {
    for (let [_class, icon] of Object.entries(icons)) {
      if (statusIcon.classList.contains(_class)) {
        iconText = icon;

        break;
      }
    }

    if (!iconText) {
      iconText = '❓';
    }
  } else {
    iconText = '⚪️';
  }

  if (favicon) {
    document.head.removeChild(favicon);

    favicon = null;
  }

  if (!favicon) {
    favicon = document.createElement('link');

    favicon.rel = 'shortcut icon';

    document.head.appendChild(favicon);
  }

  let svg = document.createElement('svg');

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  let icon = document.createElement('text');

  icon.setAttribute('font-size', '13');
  icon.setAttribute('y', '13');

  icon.textContent = iconText;

  svg.appendChild(icon);

  favicon.href = `data:image/svg+xml,${svg.outerHTML}`;
}

let tabContainer = document.querySelector('.pull-request-tabs [role="tabpanel"]');

let statusIcon = tabContainer.querySelector(statusIconClass);

updateFavicon(statusIcon);

function find(node, query) {
  if (node.matches?.(query)) {
    return node;
  } else {
    return node.querySelector?.(query);
  }
}

let statusIconClassObserver;

new MutationObserver(mutationsList => {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (let node of mutation.removedNodes) {
        let statusIcon = find(node, statusIconClass);

        if (statusIcon) {
          statusIconClassObserver.disconnect();
          statusIconClassObserver = null;

          replaceFavicon();
        }
      }
    }
  }

  if (statusIconClassObserver) {
    return;
  }

  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      for (let node of mutation.addedNodes) {
        let statusIcon = find(node, statusIconClass);

        if (statusIcon) {
          updateFavicon(statusIcon);

          statusIconClassObserver = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                let statusIcon = find(node, statusIconClass);

                if (statusIcon) {
                  updateFavicon(statusIcon);
                }
              }
            }
          });

          statusIconClassObserver.observe(statusIcon.closest('.summary-panel'), {
            subtree: true,
            childList: true,
          });
        }
      }
    }
  }
}).observe(tabContainer, {
  childList: true,
  subtree: true,
});
