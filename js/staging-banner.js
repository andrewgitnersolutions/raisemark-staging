/**
 * RaiseMark Partner Staging Review Banner
 * Automatically displays on staging and local preview environments.
 * Strictly self-terminates on production (raisemarkai.com).
 */
(function () {
    'use strict';

    // 1. Safety check: never execute on production domain
    const hostname = window.location.hostname;
    const isProduction = hostname === 'raisemarkai.com' || hostname === 'www.raisemarkai.com';
    if (isProduction) {
        return;
    }

    // 2. Only run on staging or local environments
    const isStaging = hostname.includes('github.io') || hostname === 'localhost' || hostname === '127.0.0.1';
    if (!isStaging) {
        return;
    }

    // Google Doc discussion link in Website Management Drive Folder
    const PARTNER_DOC_URL = 'https://docs.google.com/document/d/1wSIiooveooBB19nOV8PheYy88YgQ4S8x9sz9SBHQCm4/edit?usp=drivesdk';
    const PARTNER_EMAILS = 'dwight@raisemarkai.com,don@raisemarkai.com,andrew@raisemarkai.com';

    // Determine current page filename for live comparison
    const pathParts = window.location.pathname.split('/');
    let currentPage = pathParts[pathParts.length - 1] || 'index.html';
    if (!currentPage.endsWith('.html') && currentPage !== '') {
        currentPage += '.html';
    }
    const liveCompareUrl = 'https://raisemarkai.com/' + (currentPage === 'index.html' ? '' : currentPage);

    // Email link with current page context
    const emailSubject = encodeURIComponent('RaiseMark Website Review: ' + (document.title || currentPage));
    const emailBody = encodeURIComponent(
        'Hi Dwight and Don,\n\nI am reviewing the staging preview for the website:\n' +
        window.location.href + '\n\n' +
        'Here are my comments/feedback:\n\n'
    );
    const emailUrl = 'mailto:' + PARTNER_EMAILS + '?subject=' + emailSubject + '&body=' + emailBody;

    // Ensure CSS is loaded
    if (!document.querySelector('link[href*="staging-banner.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/staging-banner.css';
        document.head.appendChild(link);
    }

    function createBanner() {
        if (document.getElementById('raisemark-staging-banner')) return;

        const banner = document.createElement('aside');
        banner.id = 'raisemark-staging-banner';
        banner.setAttribute('aria-label', 'Partner Staging Environment Notice');

        banner.innerHTML = `
            <div class="staging-banner__container">
                <div class="staging-banner__left">
                    <span class="staging-banner__badge">
                        <span aria-hidden="true">&#9888;&#65039;</span> PARTNER REVIEW
                    </span>
                    <span class="staging-banner__label">
                        Staging Preview &bull; Changes are not yet public
                    </span>
                </div>
                <div class="staging-banner__actions">
                    <a href="${PARTNER_DOC_URL}" target="_blank" rel="noopener noreferrer" class="staging-banner__btn staging-banner__btn--primary" title="Open Google Doc for discussion notes and approvals">
                        <span aria-hidden="true">&#128172;</span> Discussion Notes
                    </a>
                    <a href="${emailUrl}" class="staging-banner__btn staging-banner__btn--outline" title="Email Dwight, Don, and Andrew with current page notes">
                        <span aria-hidden="true">&#9993;&#65039;</span> Email Partners
                    </a>
                    <a href="${liveCompareUrl}" target="_blank" rel="noopener noreferrer" class="staging-banner__btn staging-banner__btn--outline" title="Compare against live public site">
                        <span aria-hidden="true">&#127760;</span> Compare Live
                    </a>
                    <button type="button" class="staging-banner__btn--close" id="staging-banner-dismiss" aria-label="Dismiss staging banner" title="Hide banner to view clean layout">
                        &times;
                    </button>
                </div>
            </div>
        `;

        const restoreBtn = document.createElement('button');
        restoreBtn.id = 'raisemark-staging-restore-btn';
        restoreBtn.innerHTML = '&#9888;&#65039; Staging Bar';
        restoreBtn.title = 'Restore partner review banner';

        document.body.prepend(banner);
        document.body.appendChild(restoreBtn);

        const dismissBtn = document.getElementById('staging-banner-dismiss');

        function hideBanner() {
            banner.style.display = 'none';
            restoreBtn.style.display = 'block';
            sessionStorage.setItem('raisemark_staging_banner_hidden', 'true');
        }

        function showBanner() {
            banner.style.display = 'block';
            restoreBtn.style.display = 'none';
            sessionStorage.removeItem('raisemark_staging_banner_hidden');
        }

        dismissBtn.addEventListener('click', hideBanner);
        restoreBtn.addEventListener('click', showBanner);

        if (sessionStorage.getItem('raisemark_staging_banner_hidden') === 'true') {
            hideBanner();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createBanner);
    } else {
        createBanner();
    }
})();
