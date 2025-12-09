import './index.css';

import { initHubFilters } from './typescript/components/filters';
import {
  initContactModal,
  initContactModalSuccessLayout,
  initContactPhoneValidation,
  initHideFirstOptionSelects,
} from './typescript/components/modal';
import { initNavbarDropdownEffects, initNavbarHoverEffects } from './typescript/components/navbar';
import { svgComponent } from './typescript/global';
import {
  initIndustriesToggle,
  initServicesFlexSwitcher,
  initServicesToggle,
} from './typescript/home';
import {
  initAdvantagesScrollFollow,
  initCaseSvgMorph,
  initHeroPathGlow,
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
  initNavbarHoverEffects();
  initNavbarDropdownEffects();
  initServicesToggle();
  initServicesFlexSwitcher();
  initIndustriesToggle();
  initCaseSvgMorph();
  initAdvantagesScrollFollow();
  initHeroPathGlow();
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
