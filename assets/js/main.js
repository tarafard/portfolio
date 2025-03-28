// /*===== MENU SHOW =====*/ 
// const showMenu = (toggleId, navId) => {
//     const toggle = document.getElementById(toggleId),
//     nav = document.getElementById(navId)

//     if(toggle && nav){
//         toggle.addEventListener('click', ()=>{
//             nav.classList.toggle('show')
//         })
//     }
// }
// showMenu('nav-toggle','nav-menu')

// /*==================== REMOVE MENU MOBILE ====================*/
// const navLink = document.querySelectorAll('.nav__link')

// function linkAction(){
//     const navMenu = document.getElementById('nav-menu')
//     // When we click on each nav__link, we remove the show-menu class
//     navMenu.classList.remove('show')
// }
// navLink.forEach(n => n.addEventListener('click', linkAction))




/*===== MENU TOGGLE & CLOSE WHEN CLICKING OUTSIDE =====*/
const setupMobileMenu = () => {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');
    
    if (navToggle && navMenu) {
        // Toggle menu when clicking the hamburger button
        navToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('show');
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = navMenu.contains(e.target);
            const isClickOnToggle = navToggle.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });

        // Prevent menu from closing when clicking between links (on menu background)
        navMenu.addEventListener('click', (e) => {
            if (e.target === navMenu) { // Only if clicking directly on menu (not links)
                e.stopPropagation();
            }
        });
    }
};

// Initialize the mobile menu
setupMobileMenu();















/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () => {
    const scrollDown = window.scrollY

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        } else {
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
});

sr.reveal('.home__data',{}); 
sr.reveal('.home__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__img, .contact__input',{interval: 200});

/*===== BACK TO TOP BUTTON =====*/
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('active');
    } else {
        backToTopButton.classList.remove('active');
    }
});

backToTopButton.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

/*===== SMOOTH DARK MODE TOGGLE =====*/
const darkModeToggle = document.querySelector('.dark-mode-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const currentTheme = localStorage.getItem('theme') || 'light';

function applyInitialTheme() {
    document.body.style.transition = 'none';
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    void document.body.offsetHeight;
    document.body.style.transition = '';
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

applyInitialTheme();
darkModeToggle.addEventListener('click', toggleDarkMode);

/*===== DEBOUNCE FUNCTION =====*/
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/*===== SLIDER FUNCTIONALITY =====*/
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sliders for both sections
    initSlider('work');
    initSlider('article');
    
    function initSlider(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;
        
        const sliderContainer = section.querySelector('.slider-container');
        const sliderTrack = section.querySelector('.slider-track');
        const prevBtn = section.querySelector('.prev-arrow');
        const nextBtn = section.querySelector('.next-arrow');
        const filterButtons = section.querySelectorAll('.filter-btn');
        
        let currentSlide = 0;
        let activeFilter = 'all';
        let filteredSlides = [];
        let itemsPerSlide = getItemsPerSlide();
        let isAnimating = false;
        let sliderWidth = 0;
        
        // Touch handling variables
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let animationID = 0;
        
        // Get ALL cards from the original HTML structure
        const originalCards = Array.from(sliderTrack.querySelectorAll('.card'));
        
        // Initial setup
        filterCards();
        
        // Event listeners for filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                activeFilter = this.getAttribute('data-filter');
                currentSlide = 0;
                filterCards();
            });
        });
        
        // Navigation buttons with infinite loop
        prevBtn.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            if (filteredSlides.length <= 1) {
                isAnimating = false;
                return;
            }
            
            currentSlide--;
            
            // If we're at the beginning, jump to the end
            if (currentSlide < 0) {
                // Create a seamless transition by duplicating the last slide at the beginning
                const lastSlide = filteredSlides[filteredSlides.length - 1].cloneNode(true);
                sliderTrack.insertBefore(lastSlide, sliderTrack.firstChild);
                filteredSlides.unshift(lastSlide);
                sliderTrack.style.transition = 'none';
                sliderTrack.style.transform = `translateX(-${100}%)`;
                void sliderTrack.offsetWidth; // Force reflow
                sliderTrack.style.transition = 'transform 0.5s ease';
                currentSlide = 0;
            }
            
            updateSlider();
            setTimeout(() => { isAnimating = false; }, 500);
        });
        
        nextBtn.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;
            
            if (filteredSlides.length <= 1) {
                isAnimating = false;
                return;
            }
            
            currentSlide++;
            
            // If we're at the end, jump to the beginning
            if (currentSlide >= filteredSlides.length) {
                // Create a seamless transition by duplicating the first slide at the end
                const firstSlide = filteredSlides[0].cloneNode(true);
                sliderTrack.appendChild(firstSlide);
                filteredSlides.push(firstSlide);
                updateSlider();
                
                // After animation, reset position and remove the duplicate
                setTimeout(() => {
                    sliderTrack.style.transition = 'none';
                    sliderTrack.removeChild(filteredSlides[0]);
                    filteredSlides.shift();
                    currentSlide--;
                    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
                    void sliderTrack.offsetWidth; // Force reflow
                    sliderTrack.style.transition = 'transform 0.5s ease';
                }, 500);
            }
            
            updateSlider();
            setTimeout(() => { isAnimating = false; }, 500);
        });
        
        // Handle window resize with debounce
        window.addEventListener('resize', debounce(function() {
            const newItemsPerSlide = getItemsPerSlide();
            if (newItemsPerSlide !== itemsPerSlide) {
                itemsPerSlide = newItemsPerSlide;
                currentSlide = 0;
                filterCards();
            }
        }, 250));
        
        // Touch event listeners
        sliderContainer.addEventListener('touchstart', touchStart, { passive: true });
        sliderContainer.addEventListener('touchmove', touchMove, { passive: false });
        sliderContainer.addEventListener('touchend', touchEnd);
        
        function touchStart(e) {
            startPos = e.touches[0].clientX;
            isDragging = true;
            animationID = requestAnimationFrame(animation);
            sliderTrack.style.transition = 'none';
        }
        
        function touchMove(e) {
            if (!isDragging) return;
            const currentPosition = e.touches[0].clientX;
            currentTranslate = prevTranslate + currentPosition - startPos;
            e.preventDefault(); // Prevent scrolling while dragging
        }
        
        function touchEnd() {
            if (!isDragging) return;
            isDragging = false;
            cancelAnimationFrame(animationID);
            
            const movedBy = currentTranslate - prevTranslate;
            
            // Add resistance at edges
            if ((currentSlide === 0 && movedBy > 0) || 
                (currentSlide === filteredSlides.length - 1 && movedBy < 0)) {
                // Elastic bounce effect
                sliderTrack.style.transition = 'transform 0.3s ease-out';
                sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
            } else {
                if (movedBy < -50) nextBtn.click();
                if (movedBy > 50) prevBtn.click();
            }
            
            setTimeout(() => {
                sliderTrack.style.transition = 'transform 0.5s ease';
            }, 300);
        }
        
        function animation() {
            sliderTrack.style.transform = `translateX(calc(-${currentSlide * 100}% + ${currentTranslate}px)`;
            animationID = requestAnimationFrame(animation);
        }
        
        function getItemsPerSlide() {
            const width = window.innerWidth;
            if (width <= 600) return 1;  // 1 item on mobile
            if (width <= 900) return 2;  // 2 items on tablet
            return 3;                    // 3 items on desktop
        }
        
        function filterCards() {
            // Clear existing slides
            sliderTrack.innerHTML = '';
            filteredSlides = [];
            
            // Filter cards based on active filter
            const visibleCards = originalCards.filter(card => 
                activeFilter === 'all' || card.getAttribute('data-category') === activeFilter
            );
            
            // If no cards, show message
            if (visibleCards.length === 0) {
                const noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.textContent = 'No items found for this filter';
                sliderTrack.appendChild(noResults);
                filteredSlides.push(noResults);
                updateSlider();
                return;
            }
            
            // Mobile-specific layout
            if (window.innerWidth <= 600) {
                // Create one slide per card for better mobile touch control
                visibleCards.forEach(card => {
                    const slide = document.createElement('div');
                    slide.className = 'slider-slide';
                    slide.style.display = 'grid';
                    slide.style.gridTemplateColumns = '1fr';
                    slide.style.gap = '1rem';
                    
                    const cardClone = card.cloneNode(true);
                    slide.appendChild(cardClone);
                    sliderTrack.appendChild(slide);
                    filteredSlides.push(slide);
                });
            } else {
                // Original tablet/desktop layout
                const totalSlides = Math.ceil(visibleCards.length / itemsPerSlide);
                
                for (let i = 0; i < totalSlides; i++) {
                    const slide = document.createElement('div');
                    slide.className = 'slider-slide';
                    slide.style.display = 'grid';
                    slide.style.gap = '2rem';
                    slide.style.gridTemplateColumns = `repeat(${itemsPerSlide}, 1fr)`;
                    
                    const startIndex = i * itemsPerSlide;
                    const endIndex = startIndex + itemsPerSlide;
                    const slideCards = visibleCards.slice(startIndex, endIndex);
                    
                    slideCards.forEach(card => {
                        const cardClone = card.cloneNode(true);
                        slide.appendChild(cardClone);
                    });
                    
                    sliderTrack.appendChild(slide);
                    filteredSlides.push(slide);
                }
            }
            
            sliderTrack.style.width = `${filteredSlides.length * 100}%`;
            updateSlider();
        }
        
        function updateSlider() {
            if (filteredSlides.length === 0) return;
            const offset = currentSlide * 100;
            sliderTrack.style.transform = `translateX(-${offset}%)`;
            updateButtonStates();
        }
        
        function updateButtonStates() {
            if (!prevBtn || !nextBtn) return;
            
            // Always enable buttons for infinite slider
            prevBtn.disabled = false;
            nextBtn.disabled = false;
            prevBtn.style.opacity = '1';
            nextBtn.style.opacity = '1';
        }
    }
});

/*===== FILTER FUNCTIONALITY FOR NON-SLIDER SECTIONS =====*/
document.addEventListener('DOMContentLoaded', function() {
    function setupFilter(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const filterButtons = container.parentElement.querySelectorAll('.filter-btn');
        const cards = container.querySelectorAll('.card');

        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filterValue = this.getAttribute('data-filter');
                
                cards.forEach(card => {
                    card.style.display = 'none';
                    card.style.opacity = '0';
                    
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        setTimeout(() => {
                            card.style.display = 'block';
                            setTimeout(() => {
                                card.style.opacity = '1';
                            }, 50);
                        }, 50);
                    }
                });
            });
        });
    }

    // Initialize filters for non-slider sections if needed
});     
