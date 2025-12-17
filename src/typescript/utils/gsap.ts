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

    // Responsive: ensure the SVG fills its wrapper (avoid letterboxing on non-square containers)
    // "slice" fills the box while preserving aspect ratio (may crop slightly).
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

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
  const paths = svg ? (Array.from(svg.querySelectorAll('path')) as SVGPathElement[]) : [];

  if (!wrapper || !svg || paths.length === 0) {
    return;
  }

  // Pick the longest path (more robust if the embed contains multiple paths)
  let path: SVGPathElement | null = null;
  let maxLen = -1;
  paths.forEach((p) => {
    try {
      const len = p.getTotalLength();
      if (len > maxLen) {
        maxLen = len;
        path = p;
      }
    } catch {
      // ignore invalid paths
    }
  });
  if (!path) return;

  // The Webflow "path" here is often a filled shape that doubles back on itself.
  // To avoid the glow doing a loop/return (your step 3), we only animate on the
  // visible segment: from the top-left-most point to the bottom-right-most point.
  const total = maxLen;
  const samples = 500;
  let startLen = 0;
  let endLen = total;
  let bestStartScore = Number.POSITIVE_INFINITY;
  let bestEndScore = Number.NEGATIVE_INFINITY;

  for (let i = 0; i <= samples; i += 1) {
    const l = (total * i) / samples;
    const pt = (path as unknown as SVGGeometryElement).getPointAtLength(l);
    const startScore = pt.y * 100000 + pt.x; // top-left preference
    if (startScore < bestStartScore) {
      bestStartScore = startScore;
      startLen = l;
    }
    const endScore = pt.y * 100000 + pt.x; // bottom-right preference
    if (endScore > bestEndScore) {
      bestEndScore = endScore;
      endLen = l;
    }
  }

  const startProgress = startLen / total;
  const endProgress = endLen / total;
  // Ensure a valid forward segment (avoid start/end being reversed or identical)
  let mpStart = Number.isFinite(startProgress) ? startProgress : 0;
  let mpEnd = Number.isFinite(endProgress) ? endProgress : 1;
  if (mpEnd < mpStart) {
    [mpStart, mpEnd] = [mpEnd, mpStart];
  }
  // Clamp to [0..1]
  mpStart = Math.min(1, Math.max(0, mpStart));
  mpEnd = Math.min(1, Math.max(0, mpEnd));
  // Fallback if sampling produced a degenerate segment
  if (Math.abs(mpEnd - mpStart) < 0.001) {
    mpStart = 0;
    mpEnd = 1;
  }

  // Reuse the same glow node (avoid duplicates on re-init)
  let glow = wrapper.querySelector('.hero_glow-follow') as HTMLElement | null;
  if (!glow) {
    glow = document.createElement('div');
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
  }

  // Ensure we don't stack multiple tweens/ScrollTriggers controlling the same element
  const triggerId = 'hero-path-glow-follow';
  ScrollTrigger.getById(triggerId)?.kill();
  gsap.killTweensOf(glow);

  // Motion le long du path, synchronisé avec le scroll
  gsap.to(glow, {
    ease: 'none',
    scrollTrigger: {
      id: triggerId,
      trigger: hero,
      // Start when the hero hits the top of the viewport
      start: 'top top',
      // Stop earlier than the hero leaving the viewport (tweak this to match your "step 2").
      // Using "bottom bottom" can produce a 0-length trigger on a 100vh hero.
      end: 'bottom 40%',
      scrub: true,
      invalidateOnRefresh: true,
    },
    motionPath: {
      path,
      align: path,
      alignOrigin: [0.5, 0.5],
      // Reverse direction
      start: mpEnd,
      end: mpStart,
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
