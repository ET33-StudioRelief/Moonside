import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

// Slider hp testimonial - Home Page
export function initHpTestimonialSwiper(): void {
  const container = document.querySelector('.swiper.is-hp-testimonial') as HTMLElement | null;
  if (!container) return;

  new Swiper(container, {
    modules: [Pagination],
    spaceBetween: 24,
    rewind: true, // ou loop: true si tu préfères l’effet de boucle continue
    // Mobile par défaut : 1 slide / 1 groupe
    slidesPerView: 1,
    slidesPerGroup: 1,
    // À partir de 992px : 2 slides visibles, navigation par 2 → 3 bullets
    breakpoints: {
      992: {
        slidesPerView: 2,
        slidesPerGroup: 2,
      },
    },
    pagination: {
      el: '.swiper-pagination.is-hp-testimonial',
      clickable: true,
    },
  });
}

// Instance et listener pour le slider HP case studies (mobile)
let hpCaseSwiper: Swiper | null = null;
let hpIndustriesSwiper: Swiper | null = null;
let hpIndustriesResizeBound = false;

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
  const sync = () => {
    // Webflow toggles between grid and slider by breakpoint.
    // Initialize when the slider becomes visible; destroy when hidden.
    const sliderRoot = document.querySelector('.hp-industries_slider') as HTMLElement | null;

    if (!sliderRoot) {
      if (hpIndustriesSwiper) {
        hpIndustriesSwiper.destroy(true, true);
        hpIndustriesSwiper = null;
      }
      return;
    }

    const isVisible = window.getComputedStyle(sliderRoot).display !== 'none';
    if (!isVisible) {
      if (hpIndustriesSwiper) {
        hpIndustriesSwiper.destroy(true, true);
        hpIndustriesSwiper = null;
      }
      return;
    }

    // Already initialized and visible
    if (hpIndustriesSwiper) {
      hpIndustriesSwiper.update();
      return;
    }

    // Grab the swiper container and nav arrows (scoped to this slider)
    const container = sliderRoot.querySelector('.swiper.is-hp-industries') as HTMLElement | null;
    const nextEl = sliderRoot.querySelector('.slider-arrow.is-next') as HTMLElement | null;
    const prevEl = sliderRoot.querySelector('.slider-arrow.is-prev') as HTMLElement | null;
    if (!container || !nextEl || !prevEl) return;

    // Target where we display the current industry label
    const titleEl = document.getElementById('industries-slider-title') as HTMLElement | null;

    // Sync the title with the active slide's data-industries
    const updateTitle = (swiper: Swiper) => {
      if (!titleEl) return;
      const activeSlide = swiper.slides[swiper.activeIndex] as HTMLElement | undefined;
      const card = activeSlide?.querySelector('.cc--hp-industries_slide') as HTMLElement | null;
      const key = card?.getAttribute('data-industries');
      if (key) titleEl.textContent = key;
    };

    hpIndustriesSwiper = new Swiper(container, {
      modules: [Navigation],
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      autoHeight: true,
      navigation: {
        nextEl,
        prevEl,
      },
      observer: true,
      observeParents: true,
      on: {
        init(swiper) {
          updateTitle(swiper);
        },
        slideChange(swiper) {
          updateTitle(swiper);
        },
      },
    });
  };

  // Run once now
  sync();

  // Ensure it reacts to viewport resize (Webflow doesn't re-run scripts on resize).
  if (!hpIndustriesResizeBound) {
    hpIndustriesResizeBound = true;
    let raf = 0;
    window.addEventListener(
      'resize',
      () => {
        window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(() => {
          sync();
        });
      },
      { passive: true }
    );
  }
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
// Slider partners
export function initPartnersSwiper(): void {
  const container = document.querySelector('.swiper.is-partners') as HTMLElement | null;
  if (!container) return;

  new Swiper(container, {
    modules: [Autoplay],
    slidesPerView: 3,
    breakpoints: {
      992: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 5,
      },
    },
    spaceBetween: 80,
    loop: true,
    speed: 6000,
    autoplay: {
      // Marquee-like continuous autoplay (no "steps")
      delay: 0,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
  });
}
