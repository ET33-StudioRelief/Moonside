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

    // Met à jour l'état visuel (opacity / z-index / pointer-events)
    flexByKey.forEach((block, k) => {
      if (k === key) {
        block.style.opacity = '1';
        block.style.zIndex = '3';
        block.style.pointerEvents = 'auto';
      } else {
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
  // 1) Dans le parent direct (la colonne texte), on aligne items et SVG par index
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

  // Sur desktop (> 991px), on alimente le conteneur #services-data-embed
  if (window.innerWidth > 991) {
    const flex = item.closest('.services_flex') as HTMLElement | null;
    if (!flex) {
      return;
    }
    const desktopTarget = flex.querySelector('#services-data-embed') as HTMLElement | null;
    if (!desktopTarget) {
      return;
    }
    desktopTarget.innerHTML = '';
    desktopTarget.appendChild(clone);
  } else {
    // Sur mobile (taille strictement < 992), on cible le conteneur #services-mobile-data-embed dans l'item
    const mobileTarget = item.querySelector('#services-mobile-data-embed') as HTMLElement | null;
    if (!mobileTarget) {
      return;
    }
    mobileTarget.innerHTML = '';
    mobileTarget.appendChild(clone);
  }
}

/**
 * -----------------section hp industries--------------
 */
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
