// PaiR Website — Script

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const toggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (toggle && navLinks) {
        toggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('nav-open');
            toggle.setAttribute('aria-expanded', isOpen);
        });

        // Close the open mobile menu with Escape and return focus to the toggle
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('nav-open')) {
                navLinks.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.focus();
            }
        });
    }

    // Contact form — submit to Formspree via fetch for inline feedback
    const forms = document.querySelectorAll('#contactForm');
    forms.forEach(form => {
        // Visually-hidden live region so screen readers hear submission results
        const status = document.createElement('p');
        status.className = 'sr-only';
        status.setAttribute('role', 'status');
        form.appendChild(status);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.textContent;
            const data = new FormData(form);
            status.textContent = 'Sending your message.';

            btn.textContent = 'Sending...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            fetch(form.action, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            })
                .then(response => {
                    if (response.ok) {
                        status.textContent = 'Your message was sent successfully.';
                        btn.textContent = '✓  Message Sent';
                        btn.style.background = '#28a745';
                        btn.style.borderColor = '#28a745';
                        btn.style.opacity = '1';
                        form.reset();
                    } else {
                        status.textContent = 'There was an error sending your message. Please try again.';
                        btn.textContent = 'Error — please try again';
                        btn.style.background = '#dc3545';
                        btn.style.borderColor = '#dc3545';
                        btn.style.opacity = '1';
                    }
                    setTimeout(() => {
                        btn.textContent = original;
                        btn.style.background = '';
                        btn.style.borderColor = '';
                        btn.disabled = false;
                    }, 3000);
                })
                .catch(() => {
                    status.textContent = 'There was an error sending your message. Please try again.';
                    btn.textContent = 'Error — please try again';
                    btn.style.background = '#dc3545';
                    btn.style.borderColor = '#dc3545';
                    btn.style.opacity = '1';
                    setTimeout(() => {
                        btn.textContent = original;
                        btn.style.background = '';
                        btn.style.borderColor = '';
                        btn.disabled = false;
                    }, 3000);
                });
        });
    });

    // Partner Staging Review Banner (activates on staging/preview only; never on production)
    const host = window.location.hostname;
    if (host.includes('github.io') || host === 'localhost' || host === '127.0.0.1') {
        const stagingScript = document.createElement('script');
        stagingScript.src = 'js/staging-banner.js';
        stagingScript.defer = true;
        document.head.appendChild(stagingScript);
    }
});
