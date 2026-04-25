document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Component Loader
    const loadComponents = async () => {
        const components = [
            { id: 'main-header', url: 'header.html' },
            { id: 'main-footer', url: 'footer.html' }
        ];

        for (const comp of components) {
            const container = document.getElementById(comp.id);
            if (container) {
                try {
                    const response = await fetch(comp.url);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const html = await response.text();
                    container.innerHTML = html;
                } catch (err) {
                    console.error(`Error loading component ${comp.id}:`, err);
                }
            }
        }

        // Initialize elements that depend on injected HTML
        initializeMenu();
        if (window.lucide) {
            setTimeout(() => {
                lucide.createIcons();
            }, 100);
        }
        highlightActiveLink();
    };

    // 2. Initialize Menu (Mobile Toggle)
    const initializeMenu = () => {
        const navToggle = document.querySelector('.mobile-nav-toggle');
        const navLinks = document.querySelector('.nav-v2');
        const mobileOverlay = document.querySelector('.mobile-overlay');
        const body = document.body;

        if (!navToggle || !navLinks || !mobileOverlay) return;

        // Remove existing listeners if any (to prevent double binding)
        const newNavToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newNavToggle, navToggle);

        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            body.classList.toggle('no-scroll');

            const iconNode = newNavToggle.querySelector('i');
            if (iconNode) {
                if (isOpen) {
                    iconNode.setAttribute('data-lucide', 'x');
                } else {
                    iconNode.setAttribute('data-lucide', 'menu');
                }
                if (window.lucide) lucide.createIcons();
            }
        };

        newNavToggle.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);

        // Close menu when clicking links
        document.querySelectorAll('.nav-v2 a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
    };

    // 3. Highlight Active Link
    const highlightActiveLink = () => {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-v2 .nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    // 4. Reveal Animations
    const initReveal = () => {
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
    };

    // 5. Stat Counters
    const initCounters = () => {
        const startCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            if (isNaN(target)) return;
            const duration = 2000;
            const start = Date.now();

            const update = () => {
                const now = Date.now();
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
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
    };

    // 6. FAQ Accordion
    const initFAQ = () => {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            if (!trigger) return;
            trigger.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                faqItems.forEach(i => {
                    i.classList.remove('active');
                    const content = i.querySelector('.faq-content');
                    if (content) content.style.display = 'none';

                    const iconNode = i.querySelector('svg.lucide, i');
                    if (iconNode) {
                        if (iconNode.tagName === 'svg') {
                            const newI = document.createElement('i');
                            newI.setAttribute('data-lucide', 'plus');
                            iconNode.parentNode.replaceChild(newI, iconNode);
                        } else {
                            iconNode.setAttribute('data-lucide', 'plus');
                        }
                    }
                });

                if (!isActive) {
                    item.classList.add('active');
                    const content = item.querySelector('.faq-content');
                    if (content) content.style.display = 'block';

                    const iconNode = item.querySelector('i');
                    if (iconNode) iconNode.setAttribute('data-lucide', 'minus');
                }
                if (window.lucide) lucide.createIcons();
            });
        });
    };

    // 7. Process Timeline
    const initTimeline = () => {
        const setupTimeline = (sectionSelector, stepSelector, progressSelector) => {
            const section = document.querySelector(sectionSelector);
            if (!section) return;

            const progressLine = section.querySelector(progressSelector);
            const steps = section.querySelectorAll(stepSelector);

            const updateTimeline = (targetIndex) => {
                const isMobile = window.innerWidth <= 991;
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
                    if (i <= targetIndex) step.classList.add('active');
                    else step.classList.remove('active');
                });
            };

            steps.forEach((step, index) => {
                step.addEventListener('click', () => updateTimeline(index));
                step.addEventListener('mouseenter', () => updateTimeline(index));
            });

            updateTimeline(0);
            window.addEventListener('resize', () => {
                const activeSteps = Array.from(steps).filter(s => s.classList.contains('active'));
                updateTimeline(activeSteps.length > 0 ? activeSteps.length - 1 : 0);
            });
        };

        setupTimeline('.process-section', '.process-step', '.timeline-progress');
        setupTimeline('.process-section-v3', '.process-step-v3', '.timeline-progress-v3');
    };

    // 8. Testimonials Carousel
    const initCarousel = () => {
        const carouselContainer = document.querySelector('.testimonial-carousel-v2');
        if (!carouselContainer) return;

        const track = carouselContainer.querySelector('.carousel-track');
        const slides = Array.from(track.children);
        const nextBtn = carouselContainer.querySelector('.next-btn');
        const prevBtn = carouselContainer.querySelector('.prev-btn');
        const dotsContainer = carouselContainer.querySelector('.carousel-dots');

        if (!track || !nextBtn || !prevBtn || !dotsContainer) return;

        let currentIndex = 0;

        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = Array.from(dotsContainer.children);

        const updateDots = (index) => {
            dots.forEach(dot => dot.classList.remove('active'));
            if (dots[index]) dots[index].classList.add('active');
        };

        const goToSlide = (index) => {
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            currentIndex = index;
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            updateDots(currentIndex);
        };

        nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));

        let autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
        carouselContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(() => goToSlide(currentIndex + 1), 5000);
        });
    };

    // 9. Contact Form Handling
    const initForms = () => {
        const contactForm = document.getElementById('mainContactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Redirect to thank-you.html
                window.location.href = 'thank-you.html';
            });
        }
    };

    // 10. Industries Slider Logic
    const initIndustriesSlider = () => {
        const sliderContainer = document.getElementById('industry-slider-container');
        const prevBtn = document.getElementById('industry-prev');
        const nextBtn = document.getElementById('industry-next');

        if (!sliderContainer || !prevBtn || !nextBtn) return;

        const scrollAmount = 300; // Adjust based on card width + gap

        const scrollNext = () => {
            const maxScroll = sliderContainer.scrollWidth - sliderContainer.clientWidth;
            if (sliderContainer.scrollLeft >= maxScroll - 5) {
                sliderContainer.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            } else {
                sliderContainer.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        const scrollPrev = () => {
            sliderContainer.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        };

        let autoPlayInterval = setInterval(scrollNext, 2000);

        const resetAutoPlay = () => {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(scrollNext, 2000);
        };

        nextBtn.addEventListener('click', () => {
            scrollNext();
            resetAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            scrollPrev();
            resetAutoPlay();
        });

        sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
        sliderContainer.addEventListener('mouseleave', () => {
            autoPlayInterval = setInterval(scrollNext, 5000);
        });

        // Optional: Hide arrows if at start or end
        const toggleArrows = () => {
            const scrollLeft = sliderContainer.scrollLeft;
            const maxScroll = sliderContainer.scrollWidth - sliderContainer.clientWidth;

            prevBtn.style.opacity = scrollLeft <= 0 ? '0.3' : '1';
            prevBtn.style.pointerEvents = scrollLeft <= 0 ? 'none' : 'auto';

            nextBtn.style.opacity = scrollLeft >= maxScroll - 5 ? '0.3' : '1';
            nextBtn.style.pointerEvents = scrollLeft >= maxScroll - 5 ? 'none' : 'auto';
        };

        sliderContainer.addEventListener('scroll', toggleArrows);
        window.addEventListener('resize', toggleArrows);

        // Initial check
        setTimeout(toggleArrows, 100);
    };

    // Initialize all modules
    try {
        if (window.lucide) lucide.createIcons();
        loadComponents();
        initReveal();
        initCounters();
        initFAQ();
        initTimeline();
        initCarousel();
        initForms();
        initIndustriesSlider();
    } catch (e) {
        console.error('Initialization error:', e);
    }
});
