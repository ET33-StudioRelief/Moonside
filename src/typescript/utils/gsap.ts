import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(MorphSVGPlugin, MotionPathPlugin, ScrollTrigger);
/**
 * Init morph SVG for cases cards
 */
export function initCaseSvgMorph(): void {
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
 * Scroll-follow pour la section advantages.
 * Le cercle suit le scroll à l'intérieur de .advantages_animate-col,
 * sur mobile et desktop, de façon responsive.
 */
export function initAdvantagesScrollFollow(): void {
  const container = document.querySelector('.advantages_animate-col') as HTMLElement | null;
  const circle = document.getElementById('advantages-sroll-svg') as HTMLElement | null;

  if (!container || !circle) {
    return;
  }

  const computeY = () => {
    const containerHeight = container.clientHeight;
    const circleHeight = circle.clientHeight;
    const topPx = parseFloat(getComputedStyle(circle).top || '0'); // ex: -2rem
    const bottomPadding = parseFloat(getComputedStyle(container).paddingBottom || '0');

    const effectivePadding = bottomPadding * 0.5;
    const distance = containerHeight - effectivePadding - circleHeight - topPx;
    return distance > 0 ? distance : 0;
  };

  const triggerId = 'advantages-scroll-follow';
  ScrollTrigger.getById(triggerId)?.kill();
  gsap.killTweensOf(circle);

  ScrollTrigger.matchMedia({
    // Mobile
    '(max-width: 767px)': () => {
      gsap.to(circle, {
        y: computeY,
        ease: 'none',
        scrollTrigger: {
          id: triggerId,
          trigger: container,
          // commence très tard : le haut de la colonne arrive à ~90% de la hauteur du viewport
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },

    // Tablet + desktop
    '(min-width: 768px)': () => {
      gsap.to(circle, {
        y: computeY,
        ease: 'none',
        scrollTrigger: {
          id: triggerId,
          trigger: container,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
  });
}

/**
 * Hero path glow
 */
export function initHeroPathGlow(requiredTrigger?: string): void {
  const escapeAttr = (value: string) => {
    const cssObj = (window as unknown as { CSS?: { escape?: (v: string) => string } }).CSS;
    if (typeof cssObj?.escape === 'function') return cssObj.escape(value);
    // Minimal fallback: escape quotes/backslashes for attribute selector usage.
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const selector = requiredTrigger
    ? `.section_hero[trigger="${escapeAttr(requiredTrigger)}"]`
    : '.section_hero';

  const hero = document.querySelector(selector) as HTMLElement | null;
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
 * Hero multi-path glow
 * Use-case: heroes like `trigger="hero-services"` where the SVG contains multiple <path>.
 * Requirement: one glow per path, each traversing 0% -> 100% of its path (no segment sampling).
 */
export function initHeroMultiPathGlow(requiredTrigger: string): void {
  if (typeof document === 'undefined') return;

  const escapeAttr = (value: string) => {
    const cssObj = (window as unknown as { CSS?: { escape?: (v: string) => string } }).CSS;
    if (typeof cssObj?.escape === 'function') return cssObj.escape(value);
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const hero = document.querySelector(
    `.section_hero[trigger="${escapeAttr(requiredTrigger)}"]`
  ) as HTMLElement | null;
  if (!hero) return;

  // Intentionally hardcoded to keep this function minimal.
  const stStart = 'top top';
  const stEnd = 'bottom 60%';

  // Prefer the same wrapper as the home hero; fallback to hero itself if structure differs.
  const wrapper =
    (hero.querySelector('.hero_decorative-wrapper') as HTMLElement | null) ?? (hero as HTMLElement);
  const svg = wrapper.querySelector('svg') as SVGSVGElement | null;
  if (!svg) return;

  const paths = Array.from(svg.querySelectorAll('path')) as SVGPathElement[];
  if (!paths.length) return;

  const glowMarkup = `
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

  paths.forEach((path, i) => {
    // Skip invalid paths defensively
    try {
      if (path.getTotalLength() <= 0) return;
    } catch {
      return;
    }

    const triggerId = `hero-multi-path-glow:${requiredTrigger}:${i}`;
    ScrollTrigger.getById(triggerId)?.kill();

    let glow = wrapper.querySelector(
      `.hero_glow-follow[data-hero-glow-path="${i}"]`
    ) as HTMLElement | null;
    if (!glow) {
      glow = document.createElement('div');
      glow.className = 'hero_glow-follow';
      glow.setAttribute('data-hero-glow-path', String(i));
      glow.innerHTML = glowMarkup;
      wrapper.appendChild(glow);
    }

    gsap.killTweensOf(glow);

    gsap.to(glow, {
      ease: 'none',
      scrollTrigger: {
        id: triggerId,
        trigger: hero,
        start: stStart,
        end: stEnd,
        scrub: true,
        invalidateOnRefresh: true,
      },
      motionPath: {
        path,
        align: path,
        alignOrigin: [0.5, 0.5],
        start: 0,
        end: 1,
      },
    });
  });
}

/**
 * Hero industry: multi-path "dot" glow (radial gradient)
 * Requirement (updated): only generate 3 dots total, each travelling along one LINE (path).
 *
 * This is intentionally simpler than `initHeroPathGlow`:
 * - targets 3 stroked line paths (exclude dashed orbits)
 * - 1 dot per line (3 lines max)
 */
export function initHeroIndustryGlow(requiredTrigger = 'hero-industry'): void {
  if (typeof document === 'undefined') return;

  const escapeAttr = (value: string) => {
    const cssObj = (window as unknown as { CSS?: { escape?: (v: string) => string } }).CSS;
    if (typeof cssObj?.escape === 'function') return cssObj.escape(value);
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const hero = document.querySelector(
    `.section_hero[trigger="${escapeAttr(requiredTrigger)}"]`
  ) as HTMLElement | null;
  if (!hero) return;

  // Intentionally hardcoded to keep this function minimal.
  const stStart = 'top top';
  const stEnd = 'bottom 60%';

  const wrapper =
    (hero.querySelector('.hero_decorative-wrapper') as HTMLElement | null) ?? (hero as HTMLElement);
  const svg = wrapper.querySelector('svg') as SVGSVGElement | null;
  if (!svg) return;

  // Target ONLY "line" paths (your embed has 5), excluding dashed orbits and filled blobs.
  const lineCandidates = Array.from(
    svg.querySelectorAll('path[stroke]:not([stroke-dasharray])')
  ) as SVGPathElement[];
  const lines = lineCandidates.slice(0, 3);
  if (!lines.length) return;

  const buildDotSvg = (suffix: string) => {
    const filterId = `hero_industry_dot_filter_${suffix}`;
    const gradId = `hero_industry_dot_grad_${suffix}`;
    // Matches your example: white -> #F3F4F6 radial, small blur.
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <g filter="url(#${filterId})">
          <circle cx="6" cy="6" r="3" fill="url(#${gradId})"/>
        </g>
        <defs>
          <filter id="${filterId}" x="0" y="0" width="12" height="12" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur"/>
          </filter>
          <radialGradient id="${gradId}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(6 6) rotate(90) scale(3)">
            <stop stop-color="white"/>
            <stop offset="1" stop-color="#F3F4F6"/>
          </radialGradient>
        </defs>
      </svg>
    `;
  };

  // Cleanup previous versions dots/triggers (avoid stacking)
  ScrollTrigger.getAll().forEach((st) => {
    const id = st.vars?.id;
    if (typeof id === 'string' && id.startsWith(`hero-industry-glow:${requiredTrigger}:`)) {
      st.kill();
    }
    if (typeof id === 'string' && id.startsWith(`hero-industry-dot:${requiredTrigger}:`)) {
      st.kill();
    }
  });
  wrapper
    .querySelectorAll<HTMLElement>(
      '.hero_glow-follow[data-hero-industry-path-start], .hero_glow-follow[data-hero-industry-path-end]'
    )
    .forEach((el) => el.remove());
  wrapper
    .querySelectorAll<HTMLElement>('.hero_glow-follow[data-hero-industry-dot]')
    .forEach((el) => el.remove());

  const commonST = {
    trigger: hero,
    start: stStart,
    end: stEnd,
    scrub: true,
    invalidateOnRefresh: true,
  } as const;

  // Create only 3 dots total (1 per line)
  lines.forEach((line, i) => {
    // Skip invalid paths defensively
    try {
      if (line.getTotalLength() <= 0) return;
    } catch {
      return;
    }

    const triggerId = `hero-industry-dot:${requiredTrigger}:${i}`;
    ScrollTrigger.getById(triggerId)?.kill();

    let dot = wrapper.querySelector(
      `.hero_glow-follow[data-hero-industry-dot="${i}"]`
    ) as HTMLElement | null;
    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'hero_glow-follow';
      dot.setAttribute('data-hero-industry-dot', String(i));
      dot.innerHTML = buildDotSvg(`${requiredTrigger}-${i}`);
      dot.style.width = '0.75rem';
      dot.style.height = '0.75rem';
      wrapper.appendChild(dot);
    }

    gsap.killTweensOf(dot);

    gsap.to(dot, {
      ease: 'none',
      scrollTrigger: {
        id: triggerId,
        ...commonST,
      },
      motionPath: {
        path: line,
        align: line,
        alignOrigin: [0.5, 0.5],
        start: 1,
        end: 0,
      },
    });
  });
}

/**
 * Hub hero: move the existing radial-gradient circle (paint0_radial_2504_8291)
 * along the dashed stroke path from left -> right, scrubbed by scroll.
 *
 * Expected SVG structure (Webflow embed):
 * - a dashed path: <path ... stroke-dasharray="3 3" .../>
 * - a glow circle: <circle ... fill="url(#paint0_radial_2504_8291)"/>
 */
export function initHeroHubGlow(requiredTrigger = 'hero-hub'): void {
  if (typeof document === 'undefined') return;

  const escapeAttr = (value: string) => {
    const cssObj = (window as unknown as { CSS?: { escape?: (v: string) => string } }).CSS;
    if (typeof cssObj?.escape === 'function') return cssObj.escape(value);
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  };

  const triggerValue = escapeAttr(requiredTrigger);
  const hero = document.querySelector(
    `.section_hero[trigger="${triggerValue}"], .section_small-hero[trigger="${triggerValue}"]`
  ) as HTMLElement | null;
  if (!hero) return;

  const wrapper =
    (hero.querySelector('.hero_decorative-wrapper') as HTMLElement | null) ??
    (hero.querySelector('.small-hero_decorativ-wrap') as HTMLElement | null) ??
    (hero as HTMLElement);
  const svg = wrapper.querySelector('svg') as SVGSVGElement | null;
  if (!svg) return;

  // The path we want is the dashed stroked one (avoid the blurred filled blob path).
  const path =
    (svg.querySelector('path[stroke-dasharray]') as SVGPathElement | null) ??
    (svg.querySelector('path[stroke]') as SVGPathElement | null);
  if (!path) return;

  // NOTE:
  // The embedded SVG dot is wrapped in a <g filter="..."> with `filterUnits="userSpaceOnUse"`
  // and a fixed {x,y,width,height}. If we move that circle, it often gets clipped (becomes invisible)
  // once it leaves the filter region.
  //
  // To keep the glow visible across the whole path, we animate a DOM glow element on top of the SVG.

  // Ensure wrapper can position children absolutely.
  const wrapperStyle = window.getComputedStyle(wrapper);
  if (wrapperStyle.position === 'static') {
    wrapper.style.position = 'relative';
  }

  // Reuse the same glow node (avoid duplicates on re-init)
  let glow = wrapper.querySelector(
    '.hero_glow-follow[data-hero-hub-glow="1"]'
  ) as HTMLElement | null;
  if (!glow) {
    glow = document.createElement('div');
    glow.className = 'hero_glow-follow';
    glow.setAttribute('data-hero-hub-glow', '1');
    glow.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
        <g filter="url(#hub_glow_filter)">
          <circle cx="14" cy="14" r="10" fill="url(#hub_glow_grad)"/>
        </g>
        <defs>
          <filter id="hub_glow_filter" x="0" y="0" width="28" height="28" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feGaussianBlur stdDeviation="2" result="effect1_foregroundBlur"/>
          </filter>
          <radialGradient id="hub_glow_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(14 14) rotate(90) scale(10)">
            <stop stop-color="white"/>
            <stop offset="1" stop-color="#FFE8B2"/>
          </radialGradient>
        </defs>
      </svg>
    `;
    wrapper.appendChild(glow);
  }

  const triggerId = `hero-hub-glow:${requiredTrigger}`;
  ScrollTrigger.getById(triggerId)?.kill();
  gsap.killTweensOf(glow);

  gsap.to(glow, {
    ease: 'none',
    scrollTrigger: {
      id: triggerId,
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      invalidateOnRefresh: true,
    },
    motionPath: {
      path,
      align: path,
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 1,
    },
  });
}

export function initYellowRadiusGradient(): void {
  const el = document.getElementById('yellow-radius-gradient') as HTMLElement | null;
  if (!el) return;

  const yFrom = () => (window.innerWidth < 768 ? 60 : 160);

  gsap.fromTo(
    el,
    {
      y: yFrom,
      scale: 0.7,
    },
    {
      y: 0,
      scale: 1.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 50%',
        end: 'top 10%',
        scrub: true,
        invalidateOnRefresh: true,
      },
    }
  );
}

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

    // Overlay visibility is handled by CSS on hover / open state.
    // Keeping it out of GSAP avoids inline styles overriding the hover CSS.
    tl.to(
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
        card.classList.add('is-open');
        isOpen = true;
      } else {
        tl.reverse();
        card.classList.remove('is-open');
        isOpen = false;
      }
    });
  });
}
