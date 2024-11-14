// ==UserScript==
// @name         Bitbucket Server Build Status Favicon
// @namespace    https://github.com/kellyselden
// @version      4
// @description  Monitor builds using tab icons
// @updateURL    https://raw.githubusercontent.com/kellyselden/bitbucket-server-build-status-favicon/main/meta.js
// @downloadURL  https://raw.githubusercontent.com/kellyselden/bitbucket-server-build-status-favicon/main/user.js
// @author       Kelly Selden
// @license      MIT
// @supportURL   https://github.com/kellyselden/bitbucket-server-build-status-favicon
// @match        http*://*bitbucket*/*
// ==/UserScript==

(() => {
  const icons = {
    'build-in-progress-icon': '🔵',
    'build-successful-icon': '🟢',
    'build-failed-icon': '🔴',
  };

  let originalFavicon = document.head.querySelector('link[rel="shortcut icon"]');

  function updateFavicon() {
    let iconText;

    let status = document.querySelector('[data-testid="pull-request-builds-summary"] .build-status-icon');

    if (status) {
      for (let [_class, icon] of Object.entries(icons)) {
        if (status.classList.contains(_class)) {
          iconText = icon;

          break;
        }
      }

      if (!iconText) {
        iconText = '❓';
      }
    }

    let favicon = document.head.querySelector('link[rel="shortcut icon"]');

    if (!iconText) {
      if (favicon) {
        document.head.replaceChild(originalFavicon, favicon);
      }

      return;
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

  updateFavicon();

  new MutationObserver(updateFavicon).observe(document.body, {
    subtree: true,
    childList: true,
    attributeFilter: Object.keys(icons),
  });
})();
