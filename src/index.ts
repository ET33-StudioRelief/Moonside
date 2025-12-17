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
  initServicesFlexSwitcher,
  initServicesToggle,
} from './typescript/home';
import {
  initAdvantagesScrollFollow,
  initCaseSvgMorph,
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
  initNavbarHoverEffects();
  initNavbarDropdownEffects();
  initServicesToggle();
  initServicesFlexSwitcher();
  initIndustriesToggle();
  initAboutInteractions();
  initCaseSvgMorph();
  initAdvantagesScrollFollow();
  initHeroPathGlow();
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
