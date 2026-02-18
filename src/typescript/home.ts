/**
 * -----------------section services--------------
 */
/*Dropdown Services*/
export function initServicesToggle(): void {
  const titleElements = document.querySelectorAll('.services_title') as NodeListOf<HTMLElement>;
  const allItems = document.querySelectorAll('.services_item') as NodeListOf<HTMLElement>;

  if (!titleElements.length || !allItems.length) {
    return;
  }

  titleElements.forEach((title) => {
    // On remonte au conteneur principal du bloc service
    const item = title.closest('.services_item') as HTMLElement | null;
    if (!item) {
      return;
    }

    title.addEventListener('click', () => {
      const isCurrentlyOpen = item.classList.contains('is-open');

      // Fermer tous les items
      allItems.forEach((other) => {
        other.classList.remove('is-open');
      });

      if (!isCurrentlyOpen) {
        // Ouvrir l'item cliqué
        item.classList.add('is-open');
        // Mettre à jour le SVG associé dans #services-data-embed
        updateServicesSvgForItem(item);
      }
    });
  });

  // Sur mobile / tablette (< 992px), on ouvre le premier dropdown par défaut
  if (window.innerWidth < 992) {
    const mobileWrap = document.querySelector(
      '.services_list-wrap.is-mobile'
    ) as HTMLElement | null;
    if (mobileWrap) {
      const firstMobileItem = mobileWrap.querySelector('.services_item') as HTMLElement | null;
      if (firstMobileItem) {
        firstMobileItem.classList.add('is-open');
        updateServicesSvgForItem(firstMobileItem);
      }
    }
  }
}

/* Switch between services blocks */
export function initServicesFlexSwitcher(): void {
  // Actif uniquement sur desktop (largeur strictement > 991px)
  if (window.innerWidth <= 991) {
    return;
  }

  // On cible uniquement la version desktop
  const desktopWrap = document.querySelector(
    '.services_list-wrap.is-desktop'
  ) as HTMLElement | null;
  if (!desktopWrap) {
    return;
  }

  const navItems = desktopWrap.querySelectorAll('.services_nav-item') as NodeListOf<HTMLElement>;
  const flexBlocks = desktopWrap.querySelectorAll('.services_flex') as NodeListOf<HTMLElement>;

  if (!navItems.length || !flexBlocks.length) {
    return;
  }

  // Indexer les blocs par data-services
  const flexByKey = new Map<string, HTMLElement>();
  flexBlocks.forEach((block) => {
    const key = block.getAttribute('data-services');
    if (key) {
      flexByKey.set(key, block);
    }
  });

  if (!flexByKey.size) {
    return;
  }

  // Déterminer le bloc actif par défaut :
  // priorité à celui qui a déjà une opacity != 0 (ou la classe is-index3),
  // sinon on prend le premier.
  let activeKey: string | null = null;

  flexByKey.forEach((block, key) => {
    const style = window.getComputedStyle(block);
    const opacity = parseFloat(style.opacity || '1');
    if (activeKey === null && opacity > 0.5) {
      activeKey = key;
    }
  });

  if (activeKey === null) {
    activeKey = flexByKey.keys().next().value ?? null;
  }

  const setActive = (key: string) => {
    const targetFlex = flexByKey.get(key);
    if (!targetFlex) return;

    activeKey = key;

    // Met à jour l'état actif des nav-items
    navItems.forEach((item) => {
      const itemKey = item.getAttribute('data-services');
      if (itemKey === key) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    // Met à jour l'état visuel (opacity / z-index / pointer-events)
    // IMPORTANT:
    // Webflow stacks `.services_flex` with absolute positioning (except the initial one).
    // If the active block stays `position:absolute`, opening dropdowns won't affect the parent's height
    // and content will overflow. Force the active block into the flow.
    flexByKey.forEach((block, k) => {
      if (k === key) {
        block.style.position = 'relative';
        block.style.opacity = '1';
        block.style.zIndex = '3';
        block.style.pointerEvents = 'auto';
      } else {
        block.style.position = 'absolute';
        block.style.opacity = '0';
        block.style.zIndex = '1';
        block.style.pointerEvents = 'none';
      }
    });

    // Assure qu'un SVG est toujours présent dans le bloc actif :
    // on prend le premier .services_item de ce .services_flex
    const firstItem = targetFlex.querySelector('.services_item') as HTMLElement | null;
    if (firstItem) {
      updateServicesSvgForItem(firstItem);
    }
  };

  // Initialisation de l'état actif
  if (activeKey) {
    setActive(activeKey);
  }

  // Clic sur les nav-items
  navItems.forEach((item) => {
    const key = item.getAttribute('data-services');
    if (!key) return;

    item.addEventListener('click', () => {
      if (key === activeKey) {
        return; // déjà actif
      }
      setActive(key);
    });
  });
}

/* Update SVG by Services Item */
function updateServicesSvgForItem(item: HTMLElement): void {
  const parent = item.parentElement as HTMLElement | null;
  if (!parent) {
    return;
  }

  const itemsInParent = parent.querySelectorAll('.services_item') as NodeListOf<HTMLElement>;
  const svgBlocks = parent.querySelectorAll('.services_svg-src') as NodeListOf<HTMLElement>;

  const index = Array.prototype.indexOf.call(itemsInParent, item);
  if (index === -1) {
    return;
  }

  const svgSrc = svgBlocks[index];
  if (!svgSrc) {
    return;
  }

  const svgElement = svgSrc.querySelector('svg');
  if (!svgElement) {
    return;
  }

  const clone = svgElement.cloneNode(true) as SVGElement;

  // Désormais, on insère toujours le SVG cloné dans l'élément
  // portant l'attribut input-logo="services", que ce soit mobile ou desktop.
  // - Sur mobile, il se trouve dans l'item.
  // - Sur desktop, il est dans la colonne image du même .services_flex.
  const flex = item.closest('.services_flex') as HTMLElement | null;
  const target =
    (flex?.querySelector('[input-logo="services"]') as HTMLElement | null) ||
    (item.querySelector('[input-logo="services"]') as HTMLElement | null);
  if (!target) {
    return;
  }

  target.innerHTML = '';
  target.appendChild(clone);
}

export function initIndustriesToggle(): void {
  // Actif uniquement sur desktop (largeur strictement > 991px)
  if (window.innerWidth <= 991) {
    return;
  }

  const cats = document.querySelectorAll('.hp-industries_cat') as NodeListOf<HTMLElement>;
  const texts = document.querySelectorAll('.hp-industries_txt-content') as NodeListOf<HTMLElement>;
  const imgWrap = document.getElementById('hp-industries-img') as HTMLElement | null;
  const imgEl = imgWrap?.querySelector('img') as HTMLImageElement | null;

  if (!cats.length || !texts.length) {
    return;
  }

  const setActive = (key: string) => {
    // Catégories (colonne de droite)
    let activeCatForImage: HTMLElement | null = null;

    cats.forEach((cat) => {
      const catKey = cat.getAttribute('data-industries');
      if (catKey === key) {
        cat.classList.add('is-active');
        activeCatForImage = cat;
      } else {
        cat.classList.remove('is-active');
      }
    });

    // Textes (colonne de gauche) : on se base sur la classe .is-active,
    // le CSS gère opacity / z-index.
    texts.forEach((txt) => {
      const txtKey = txt.getAttribute('data-industries');
      if (txtKey === key) {
        txt.classList.add('is-active');
      } else {
        txt.classList.remove('is-active');
      }
    });

    // Image centrale : on récupère data-photo de la catégorie active
    if (imgEl && activeCatForImage) {
      const photoUrl = (activeCatForImage as HTMLElement).getAttribute('data-photo');
      if (photoUrl) {
        imgEl.src = photoUrl;
      }
    }
  };

  // État initial : private equity actif par défaut
  setActive('private-equity');

  // Clic sur les catégories
  cats.forEach((cat) => {
    cat.addEventListener('click', () => {
      const key = cat.getAttribute('data-industries');
      if (!key) return;
      setActive(key);
    });
  });
}

export function initPromisesLottiePlayOnEnter(): void {
  if (typeof document === 'undefined') return;
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const sections = document.querySelectorAll<HTMLElement>('.section_promises');
  if (!sections.length) return;

  type LottieAnimation = {
    play?: () => void;
    pause?: () => void;
    goToAndPlay?: (value: number, isFrame?: boolean) => void;
    goToAndStop?: (value: number, isFrame?: boolean) => void;
    wrapper?: unknown;
    container?: unknown;
  };

  const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null;

  const isLottieAnimation = (v: unknown): v is LottieAnimation =>
    isRecord(v) && typeof v.play === 'function';

  const getAnimationInstance = (el: HTMLElement): LottieAnimation | null => {
    const elRec = el as unknown as Record<string, unknown>;
    const directCandidates: unknown[] = [
      elRec.__lottie,
      elRec._lottie,
      elRec.lottie,
      elRec.lottieInstance,
      elRec.animation,
      elRec.anim,
    ];
    for (const c of directCandidates) {
      if (isLottieAnimation(c)) return c;
    }

    // Try Webflow's lottie module registry (best-effort)
    try {
      const wf = (window as unknown as { Webflow?: unknown }).Webflow;
      const wfRec = isRecord(wf) ? wf : null;
      const requireFn = wfRec?.require;
      const mod =
        typeof requireFn === 'function' ? (requireFn as (name: string) => unknown)('lottie') : null;
      const modRec = isRecord(mod) ? mod : null;
      const lottie = modRec?.lottie ?? modRec?.default ?? mod;
      const lottieRec = isRecord(lottie) ? lottie : null;
      const list =
        typeof lottieRec?.getRegisteredAnimations === 'function'
          ? (lottieRec.getRegisteredAnimations as () => unknown)()
          : null;
      if (Array.isArray(list)) {
        const match = list.find((a) => {
          if (!isLottieAnimation(a)) return false;
          return a.wrapper === el || a.container === el;
        });
        if (isLottieAnimation(match)) return match;
      }
    } catch {
      // ignore
    }

    // Fallback to global lottie/bodymovin if present
    const w = window as unknown as { lottie?: unknown; bodymovin?: unknown };
    const globalLottie = w.lottie ?? w.bodymovin;
    const globalRec = isRecord(globalLottie) ? globalLottie : null;
    const list =
      typeof globalRec?.getRegisteredAnimations === 'function'
        ? (globalRec.getRegisteredAnimations as () => unknown)()
        : null;
    if (Array.isArray(list)) {
      const match = list.find((a) => {
        if (!isLottieAnimation(a)) return false;
        return a.wrapper === el || a.container === el;
      });
      if (isLottieAnimation(match)) return match;
    }

    return null;
  };

  const withAnimation = (el: HTMLElement, cb: (anim: LottieAnimation) => void, tries = 60) => {
    const anim = getAnimationInstance(el);
    if (anim) {
      cb(anim);
      return;
    }
    if (tries <= 0) return;
    window.requestAnimationFrame(() => withAnimation(el, cb, tries - 1));
  };

  const freezeAtStart = (lottieEl: HTMLElement) => {
    if (lottieEl.dataset.playOnEnterFrozen === '1') return;
    lottieEl.dataset.playOnEnterFrozen = '1';

    // Prevent future inits from auto-playing if Webflow re-reads attributes
    lottieEl.setAttribute('data-autoplay', '0');

    withAnimation(lottieEl, (anim) => {
      try {
        if (typeof anim.goToAndStop === 'function') anim.goToAndStop(0, true);
        if (typeof anim.pause === 'function') anim.pause();
      } catch {
        // ignore
      }
    });
  };

  const playFromStartOnce = (lottieEl: HTMLElement) => {
    if (lottieEl.dataset.playOnEnterPlayed === '1') return;
    lottieEl.dataset.playOnEnterPlayed = '1';

    withAnimation(lottieEl, (anim) => {
      try {
        if (typeof anim.goToAndPlay === 'function') anim.goToAndPlay(0, true);
        else if (typeof anim.play === 'function') anim.play();
      } catch {
        // ignore
      }
    });
  };

  // Freeze all promises lotties ASAP
  sections.forEach((section) => {
    section
      .querySelectorAll<HTMLElement>('.promises_lottie[data-animation-type="lottie"]')
      .forEach(freezeAtStart);
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const section = entry.target as HTMLElement;
        section
          .querySelectorAll<HTMLElement>('.promises_lottie[data-animation-type="lottie"]')
          .forEach(playFromStartOnce);
        obs.unobserve(section); // play only once
      });
    },
    {
      threshold: 0.25,
    }
  );

  sections.forEach((s) => observer.observe(s));
}

/**
 * Sync `padding-left` of hero elements with the width of a reference element.
 */
export function initHeroPaddingSync(): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const refSelector = '.hero_span-ref-padding';
  const headingSelector = '.hero_span-heading';
  const subtitleSelector = '.hero_subtitle';
  const BREAKPOINT = 991;

  const sync = () => {
    const headingSpan = document.querySelector<HTMLElement>(headingSelector);
    const subtitle = document.querySelector<HTMLElement>(subtitleSelector);

    // Si l'écran est <= 991px, toujours supprimer le padding
    if (window.innerWidth <= BREAKPOINT) {
      if (headingSpan) headingSpan.style.paddingLeft = '';
      if (subtitle) subtitle.style.paddingLeft = '';
      return;
    }

    // Sinon, appliquer le padding synchronisé
    const refElement = document.querySelector<HTMLElement>(refSelector);
    if (!refElement) return;
    if (!headingSpan && !subtitle) return;

    const refWidth = refElement.offsetWidth;

    if (headingSpan) headingSpan.style.paddingLeft = `${refWidth}px`;
    if (subtitle) subtitle.style.paddingLeft = `${refWidth}px`;
  };

  // Avoid stacking resize listeners if Webflow re-inits scripts
  const boundKey = 'heroPaddingSyncBound';
  const docEl = document.documentElement as HTMLElement & { dataset: DOMStringMap };
  if (docEl.dataset[boundKey] === '1') return;
  docEl.dataset[boundKey] = '1';

  // Run once now
  sync();

  // Recalculate on resize (debounced)
  let resizeTimeout: number | null = null;
  window.addEventListener(
    'resize',
    () => {
      if (resizeTimeout !== null) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        sync();
      }, 100);
    },
    { passive: true }
  );
}
