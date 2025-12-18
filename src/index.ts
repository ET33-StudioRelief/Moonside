import './index.css';

import { initAboutInteractions } from './typescript/about';
import { initHubFilters } from './typescript/components/filters';
import {
  initContactModal,
  initContactModalSuccessLayout,
  initContactPhoneValidation,
  initHideFirstOptionSelects,
} from './typescript/components/modal';
import { initNavbarDropdownEffects, initNavbarHoverEffects } from './typescript/components/navbar';
import { initSectionRevealOnScroll, svgComponent } from './typescript/global';
import {
  initIndustriesToggle,
  initPromisesLottiePlayOnEnter,
  initServicesFlexSwitcher,
  initServicesToggle,
} from './typescript/home';
import {
  initAdvantagesScrollFollow,
  initCaseSvgMorph,
  initHeroIndustryGlow,
  initHeroMultiPathGlow,
  initHeroPathGlow,
  initTeamCardToggle,
  initYellowRadiusGradient,
} from './typescript/utils/gsap';
import {
  initHpCaseSwiperMobile,
  initHpIndustriesSlider,
  initHpTestimonialSwiper,
  initServicesSlider,
} from './typescript/utils/swiper';
window.Webflow ||= [];
window.Webflow.push(() => {
  svgComponent();
  initSectionRevealOnScroll();
  initPromisesLottiePlayOnEnter();
  initNavbarHoverEffects();
  initNavbarDropdownEffects();
  initServicesToggle();
  initServicesFlexSwitcher();
  initIndustriesToggle();
  initAboutInteractions();
  initCaseSvgMorph();
  initAdvantagesScrollFollow();
  // Runs only if a matching hero exists (the function returns early otherwise).
  initHeroPathGlow('hero-home');
  initHeroMultiPathGlow('hero-services');
  initHeroIndustryGlow('hero-industry');
  initYellowRadiusGradient();
  initTeamCardToggle();
  initHpTestimonialSwiper();
  initHpCaseSwiperMobile();
  initHpIndustriesSlider();
  initContactModal();
  initContactPhoneValidation();
  initHideFirstOptionSelects();
  initContactModalSuccessLayout();
  initServicesSlider();
  initHubFilters();
});
