import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

// Slider hp testimonial - Home Page
export function initHpTestimonialSwiper(): void {
  const container = document.querySelector('.swiper.is-hp-testimonial') as HTMLElement | null;
  if (!container) return;

  new Swiper(container, {
    modules: [Pagination],
    loop: true,
    pagination: {
      el: '.swiper-pagination.is-hp-testimonial',
      clickable: true,
    },
  });
}

// Instance et listener pour le slider HP case studies (mobile)
let hpCaseSwiper: Swiper | null = null;

// Slider hp case studies - Home Page [Mobile only]
export function initHpCaseSwiperMobile(): void {
  const container = document.querySelector('.swiper.is-hp-case-studies') as HTMLElement | null;
  if (!container) return;

  // If Webflow re-inits scripts, ensure we don't stack instances
  if (hpCaseSwiper) {
    hpCaseSwiper.destroy(true, true);
    hpCaseSwiper = null;
  }

  hpCaseSwiper = new Swiper(container, {
    slidesPerView: 'auto',
    spaceBetween: 32,
    loop: false,

    // Prevent "dragging past the last slide" feeling (rubber-band resistance).
    // If you still feel overscroll, we can also try `resistance: false`.
    resistanceRatio: 0,

    // If there is only 1 slide (or not enough), disable dragging.
    watchOverflow: true,
  });
}

// Slider hp-industries - Home Page [Mobile only]
export function initHpIndustriesSlider(): void {
  // Mobile only: skip on tablet/desktop
  if (window.innerWidth >= 992) {
    return;
  }

  // Grab the main swiper container and nav arrows
  const container = document.querySelector('.swiper.is-hp-industries') as HTMLElement | null;
  const nextEl = document.querySelector('.slider-arrow.is-next') as HTMLElement | null;
  const prevEl = document.querySelector('.slider-arrow.is-prev') as HTMLElement | null;
  if (!container || !nextEl || !prevEl) return;

  // Target where we display the current industry label
  const titleEl = document.getElementById('industries-slider-title') as HTMLElement | null;

  // Sync the title with the active slide's data-industries
  const updateTitle = (swiper: Swiper) => {
    if (!titleEl) return;
    const activeSlide = swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
    const card = activeSlide?.querySelector('.cc--hp-industries_slide') as HTMLElement | null;
    const key = card?.getAttribute('data-industries');
    if (key) {
      titleEl.textContent = key;
    }
  };

  new Swiper(container, {
    modules: [Navigation],
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    navigation: {
      nextEl,
      prevEl,
    },
    on: {
      init(swiper) {
        updateTitle(swiper);
      },
      slideChange(swiper) {
        updateTitle(swiper);
      },
    },
  });
}

// Slider services
export function initServicesSlider(): void {
  const container = document.querySelector('.swiper.is-services') as HTMLElement | null;
  if (!container) return;

  new Swiper(container, {
    slidesPerView: 'auto',
    spaceBetween: 32,
  });
}
