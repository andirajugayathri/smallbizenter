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
                if (content) content.style.display = 'none';

                // Swap icon back to plus
                const iconNode = i.querySelector('svg.lucide');
                if (iconNode) {
                    const newI = document.createElement('i');
                    newI.className = iconNode.getAttribute('class').replace(/lucide-\S+/g, '').replace('lucide', '').trim();
                    newI.setAttribute('data-lucide', 'plus');
                    iconNode.parentNode.replaceChild(newI, iconNode);
                }
            });

            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.faq-content');
                if (content) content.style.display = 'block';

                // Swap icon to minus
                const iconNode = item.querySelector('i'); // Because we just replaced it above
                if (iconNode) {
                    iconNode.setAttribute('data-lucide', 'minus');
                }
            }

            // Refresh icons for the toggle
            if (window.lucide) lucide.createIcons();
        });
    });

    // Process Timeline Interaction (Additive / Persistent)
    // Support both original and v3 classes
    const setupTimeline = (sectionSelector, stepSelector, progressSelector) => {
        const section = document.querySelector(sectionSelector);
        if (!section) return;

        const progressLine = section.querySelector(progressSelector);
        const steps = section.querySelectorAll(stepSelector);

        const updateTimeline = (targetIndex) => {
            const isMobile = window.innerWidth <= 991; // Updated to 991 to match style2.css
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

            steps.forEach((step, i) => {
                if (i <= targetIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        };

        steps.forEach((step, index) => {
            step.addEventListener('click', () => updateTimeline(index));
            step.addEventListener('mouseenter', () => updateTimeline(index));
        });

        updateTimeline(0);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const lastActiveIndex = Array.from(steps).reverse().findIndex(s => s.classList.contains('active'));
                const actualIndex = lastActiveIndex >= 0 ? (steps.length - 1 - lastActiveIndex) : 0;
                updateTimeline(actualIndex);
            }, 100);
        });
    };

    // Initialize both if they exist
    setupTimeline('.process-section', '.process-step', '.timeline-progress');
    setupTimeline('.process-section-v3', '.process-step-v3', '.timeline-progress-v3');

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

    // Testimonials Carousel
    const carouselContainer = document.querySelector('.testimonial-carousel-v2');
    if (carouselContainer) {
        const track = carouselContainer.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextBtn = carouselContainer.querySelector('.next-btn');
        const prevBtn = carouselContainer.querySelector('.prev-btn');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

        let currentIndex = 0;

        // Create dots
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');

            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        const updateDots = (index) => {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        };

        const goToSlide = (index) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;

            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots(currentIndex);
        };

        nextBtn.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });

        prevBtn.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });

        // Optional: Auto-play
        let autoPlayInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);

        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, 5000);
        });
    }
});
