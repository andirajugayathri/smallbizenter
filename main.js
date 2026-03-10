document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animations
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Stat Counters
    const startCounter = (el) => {
        const target = parseInt(el.getAttribute('data-target'));
        const duration = 2000;
        const start = Date.now();

        const update = () => {
            const now = Date.now();
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const val = Math.floor(progress * target);
            el.innerText = val;

            if (progress < 1) requestAnimationFrame(update);
            else el.innerText = target;
        };
        requestAnimationFrame(update);
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startCounter(entry.target);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.counter').forEach(num => statsObserver.observe(num));

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        if (!trigger) return;
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => {
                i.classList.remove('active');
                const content = i.querySelector('.faq-content');
                const icon = i.querySelector('i');
                if (content) content.style.display = 'none';
                if (icon) icon.setAttribute('data-lucide', 'plus');
            });

            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.faq-content');
                const icon = item.querySelector('i');
                if (content) content.style.display = 'block';
                if (icon) icon.setAttribute('data-lucide', 'minus');
            }

            // Refresh icons for the toggle
            if (window.lucide) lucide.createIcons();
        });
    });

    // Process Timeline Interaction (Additive / Persistent)
    const timelineSection = document.querySelector('.process-section');
    if (timelineSection) {
        const progressLine = timelineSection.querySelector('.timeline-progress');
        const steps = timelineSection.querySelectorAll('.process-step');

        const updateTimeline = (targetIndex) => {
            const isMobile = window.innerWidth <= 968;
            const progressValue = (targetIndex / (steps.length - 1)) * 100;

            if (progressLine) {
                if (isMobile) {
                    progressLine.style.height = `${progressValue}%`;
                    progressLine.style.width = '100%';
                } else {
                    progressLine.style.width = `${progressValue}%`;
                    progressLine.style.height = '100%';
                }
            }

            // Additive Active Classes: All steps up to targetIndex are active
            steps.forEach((step, i) => {
                if (i <= targetIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };

        // Interaction handlers (Click & Hover)
        steps.forEach((step, index) => {
            step.addEventListener('click', () => {
                updateTimeline(index);
            });

            step.addEventListener('mouseenter', () => {
                updateTimeline(index);
            });
        });

        // Initialize first step as active
        updateTimeline(0);

        // Handle window resize for mobile/desktop toggle
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const lastActiveIndex = Array.from(steps).reverse().findIndex(s => s.classList.contains('active'));
                const actualIndex = lastActiveIndex >= 0 ? (steps.length - 1 - lastActiveIndex) : 0;
                updateTimeline(actualIndex);
            }, 100);
        });
    }

    // Mobile Menu Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const body = document.body;

    const toggleMenu = () => {
        const isOpen = navLinks.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        body.classList.toggle('no-scroll');

        const icon = navToggle.querySelector('i');
        if (isOpen) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        if (window.lucide) lucide.createIcons();
    };

    if (navToggle) {
        navToggle.addEventListener('click', toggleMenu);
    }

    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
});
