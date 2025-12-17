import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MorphSVGPlugin, MotionPathPlugin, ScrollTrigger);
/**
 * Init morph SVG for cases cards
 */
export function initCaseSvgMorph(): void {
  if (window.innerWidth <= 991) {
    return;
  }

  const cards = document.querySelectorAll('.cc--case_card') as NodeListOf<HTMLElement>;
  if (!cards.length) return;

  cards.forEach((card) => {
    const svg = card.querySelector('svg[data-morph="case-card"]') as SVGSVGElement | null;
    if (!svg) return;

    const defaultPath = svg.querySelector(
      '[data-morph="case-card-default"]'
    ) as SVGPathElement | null;
    const hoverPath = svg.querySelector('[data-morph="case-card-hover"]') as SVGPathElement | null;
    if (!defaultPath || !hoverPath) return;

    const originalD = defaultPath.getAttribute('d');
    if (!originalD) return;

    // Hover IN : morph vers la forme "hover" avec une courbe plus douce/arrondie
    card.addEventListener('mouseenter', () => {
      gsap.to(defaultPath, {
        duration: 0.6,
        ease: 'power3.inOut',
        morphSVG: hoverPath,
      });
    });

    // Hover OUT : retour à la forme d'origine
    card.addEventListener('mouseleave', () => {
      gsap.to(defaultPath, {
        duration: 0.6,
        ease: 'power3.inOut',
        morphSVG: originalD,
      });
    });
  });
}

/**
 * Init scroll-follow pour la section advantages :
 * l'élément #advantages-sroll-svg suit le scroll à l'intérieur
 * de sa colonne .advantages_animate-col, jusqu'en bas.
 */
export function initAdvantagesScrollFollow(): void {
  const container = document.querySelector('.advantages_animate-col') as HTMLElement | null;
  const circle = document.getElementById('advantages-sroll-svg') as HTMLElement | null;

  if (!container || !circle) {
    return;
  }

  // Animation liée au scroll
  gsap.to(circle, {
    y: () => {
      const containerHeight = container.clientHeight;
      const circleHeight = circle.clientHeight;
      const topPx = parseFloat(getComputedStyle(circle).top || '0'); // ex: -2rem
      const bottomPadding = parseFloat(getComputedStyle(container).paddingBottom || '0');

      // On calcule le déplacement nécessaire pour que le bas du cercle
      // descende légèrement dans la zone de padding-bottom
      // (on laisse la moitié du padding comme marge visuelle).
      const effectivePadding = bottomPadding * 0.5;
      const distance = containerHeight - effectivePadding - circleHeight - topPx;
      return distance > 0 ? distance : 0;
    },
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
    },
  });
}

/**
 * Hero path glow: WIP
 */
export function initHeroPathGlow(): void {
  const hero = document.querySelector('.section_hero') as HTMLElement | null;
  if (!hero) return;

  const wrapper = hero.querySelector('.hero_decorative-wrapper') as HTMLElement | null;
  const svg = wrapper?.querySelector('svg') as SVGSVGElement | null;
  const path = svg?.querySelector('path') as SVGPathElement | null;

  if (!wrapper || !svg || !path) {
    return;
  }

  const glow = document.createElement('div');
  glow.className = 'hero_glow-follow';
  glow.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
      <g filter="url(#filter0_f_2213_2581)">
        <circle cx="18" cy="18" r="10" fill="url(#paint0_radial_2213_2581)"/>
      </g>
      <defs>
        <filter id="filter0_f_2213_2581" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur_2213_2581"/>
        </filter>
        <radialGradient id="paint0_radial_2213_2581" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(18 18) rotate(90) scale(10)">
          <stop stop-color="white"/>
          <stop offset="1" stop-color="#FFE8B2"/>
        </radialGradient>
      </defs>
    </svg>
  `;
  wrapper.appendChild(glow);

  // Motion le long du path, synchronisé avec le scroll
  gsap.to(glow, {
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
    },
    motionPath: {
      path,
      align: path,
      alignOrigin: [0.5, 0.5],
      start: 1.6,
      end: 0.3,
    },
  });
}

/**
 * Animation scrollée pour le bloc #yellow-radius-gradient :
 * - liée au scroll (scrub)
 * - mouvement vers le haut et scale plus prononcé
 */
export function initYellowRadiusGradient(): void {
  const el = document.getElementById('yellow-radius-gradient') as HTMLElement | null;
  if (!el) return;

  gsap.fromTo(
    el,
    {
      y: 160,
      scale: 0.7,
    },
    {
      y: 0,
      scale: 1.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 75%',
        end: 'top 10%',
        scrub: true,
      },
    }
  );
}

/**
 * Accordéon pour les cartes équipe :
 * - clic sur .team_card-svg-wrap (icône dans la carte)
 * - .team_card-overlay : opacity 0 -> 1
 * - .team_card-description-wrap : height 0 -> auto, opacity 0 -> 1
 * - .team_card-more-logo caché, .team_card-less-logo affiché
 */
export function initTeamCardToggle(): void {
  const triggers = document.querySelectorAll<HTMLElement>('.team_card-svg-wrap');
  if (!triggers.length) return;

  triggers.forEach((trigger) => {
    const card = trigger.closest('.team_card') as HTMLElement | null;
    if (!card) return;

    const overlay = card.querySelector('.team_card-overlay') as HTMLElement | null;
    const description = card.querySelector('.team_card-description-wrap') as HTMLElement | null;
    const moreLogo = card.querySelector('.team_card-more-logo') as HTMLElement | null;
    const lessLogo = card.querySelector('.team_card-less-logo') as HTMLElement | null;

    if (!overlay || !description || !moreLogo || !lessLogo) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(
      overlay,
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      },
      0
    ).to(
      description,
      {
        height: 'auto',
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out',
      },
      0
    );

    tl.eventCallback('onStart', () => {
      moreLogo.style.display = 'none';
      lessLogo.style.display = 'block';
    });

    tl.eventCallback('onReverseComplete', () => {
      moreLogo.style.display = '';
      lessLogo.style.display = 'none';
    });

    let isOpen = false;

    trigger.addEventListener('click', () => {
      if (!isOpen) {
        tl.play();
        isOpen = true;
      } else {
        tl.reverse();
        isOpen = false;
      }
    });
  });
}
