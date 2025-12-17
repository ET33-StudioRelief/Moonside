/**
 * Initialise les effets de hover pour la navbar
 */
export function initNavbarHoverEffects(): void {
  initLogoHoverEffect();
  initNavbarScrollHide();
}

/**
 * Initialise les effets des dropdowns de la navbar
 */
export function initNavbarDropdownEffects(): void {
  initMenuDropdownHoverEffect();
  initDropdownVisibility();
  initMobileDropdownLayoutEffects();
  initDisableDropdownHoverOnMobile();
}

/**
 * Effet hover sur .navbar_component pour ajouter 'is-hover' à .navbar_logo-link
 */
function initLogoHoverEffect(): void {
  const navbarComponent = document.querySelector('.navbar_component') as HTMLElement | null;
  const logoLinks = document.querySelectorAll('.navbar_logo-link');
  const heroSection = document.querySelector('.section_hero') as HTMLElement | null;

  if (navbarComponent) {
    const isOverHero = (): boolean => {
      if (!heroSection) return false;
      const heroTop = heroSection.offsetTop;
      const heroBottom = heroTop + heroSection.offsetHeight;
      const navbarHeight = navbarComponent.offsetHeight || 0;
      const currentY = window.scrollY;

      // La navbar (zone [currentY, currentY + navbarHeight]) chevauche la section hero
      return heroBottom > currentY && heroTop < currentY + navbarHeight;
    };

    navbarComponent.addEventListener('mouseenter', () => {
      // Hover uniquement sur desktop (≥ 992px)
      if (window.innerWidth >= 992 && isOverHero()) {
        logoLinks.forEach((logo) => logo.classList.add('is-hover'));
      }
    });

    navbarComponent.addEventListener('mouseleave', () => {
      // Hover uniquement sur desktop (≥ 992px) ET quand la navbar est sur le hero
      // (sinon on laisse l'état géré par la logique de scroll)
      if (window.innerWidth >= 992 && isOverHero()) {
        logoLinks.forEach((logo) => logo.classList.remove('is-hover'));
      }
    });
  }
}

/**
 * Fait remonter la navbar de 5rem quand l'utilisateur scroll vers le bas,
 * et la ramène à sa position initiale quand il remonte.
 * Lorsqu'elle réapparaît (scroll up), son background devient
 * var(--_brand---surface-fill--primary) et sa couleur de texte
 * var(--_brand---text--primary), sauf si elle est au-dessus de .section_hero
 * (dans ce cas on laisse le CSS de base gérer un fond/texte transparents).
 * S'applique à tous les breakpoints (la navbar étant déjà en position: fixed).
 */
function initNavbarScrollHide(): void {
  const navbar = document.querySelector('.navbar_component') as HTMLElement | null;
  const heroSection = document.querySelector('.section_hero') as HTMLElement | null;
  const navbarLogoLink = document.querySelector('.navbar_logo-link') as HTMLElement | null;
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let isHidden = false;

  const applyNavbarVisualState = (currentY: number) => {
    // Gestion du background + couleur + état du logo en fonction de la position
    // par rapport à .section_hero (si elle existe).
    if (heroSection) {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const navbarHeight = navbar.offsetHeight || 0;

      // Si le haut de la fenêtre + navbar est en dessous du bas du hero
      // → on applique le fond + couleur de texte + logo hover.
      if (currentY + navbarHeight >= heroBottom) {
        navbar.style.backgroundColor = 'var(--_brand---surface-fill--primary)';
        navbar.style.color = 'var(--_brand---text--primary)';
        if (navbarLogoLink) {
          navbarLogoLink.classList.add('is-hover');
        }
      } else {
        // Au-dessus / sur le hero : on laisse le style d'origine (transparent),
        // et on retire is-hover (l'effet hover souris peut le remettre).
        navbar.style.backgroundColor = '';
        navbar.style.color = '';
        if (navbarLogoLink) {
          navbarLogoLink.classList.remove('is-hover');
        }
      }
    } else {
      // Pas de section_hero trouvée : on applique toujours le fond + couleur de texte + logo hover
      navbar.style.backgroundColor = 'var(--_brand---surface-fill--primary)';
      navbar.style.color = 'var(--_brand---text--primary)';
      if (navbarLogoLink) {
        navbarLogoLink.classList.add('is-hover');
      }
    }
  };

  const onScroll = () => {
    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    // Ignorer les micro-mouvements pour éviter le jitter
    if (Math.abs(delta) < 2) return;

    if (currentY > lastScrollY && currentY > 0) {
      // Scroll vers le bas → on remonte la navbar de 5rem
      if (!isHidden) {
        navbar.style.transform = 'translateY(-5rem)';
        // En se cachant, on laisse le background géré par le CSS par défaut
        navbar.style.backgroundColor = '';
        navbar.style.color = '';
        if (navbarLogoLink) {
          navbarLogoLink.classList.remove('is-hover');
        }
        isHidden = true;
      }
    } else {
      // Scroll vers le haut → on remet la navbar à sa position initiale
      if (isHidden) {
        navbar.style.transform = 'translateY(0)';
        isHidden = false;
      }

      applyNavbarVisualState(currentY);
    }

    lastScrollY = currentY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Appliquer l'état initial au chargement (ex: refresh déjà "en dessous" du hero)
  applyNavbarVisualState(window.scrollY);
}

/**
 * Effet hover sur .navbar_menu-dropdown pour animer .navbar_btm-line de droite vers gauche
 */
function initMenuDropdownHoverEffect(): void {
  const dropdowns = document.querySelectorAll('.navbar_menu-dropdown');

  dropdowns.forEach((dropdown) => {
    const btmLine = dropdown.querySelector('.navbar_btm-line') as HTMLElement;

    if (btmLine) {
      dropdown.addEventListener('mouseenter', () => {
        btmLine.classList.add('is-visible');
      });

      dropdown.addEventListener('mouseleave', () => {
        btmLine.classList.remove('is-visible');
      });
    }
  });
}

/**
 * Gestion de la visibilité des dropdowns et du lien About sur mobile :
 * - Quand un dropdown est ouvert : cacher les autres dropdowns + le lien About
 * - Quand aucun dropdown n'est ouvert : tout est visible
 * - Sur desktop (≥ 992px) : tout est toujours visible
 */
function initDropdownVisibility(): void {
  const menuCenter = document.querySelector('.navbar_menu-center');
  const dropdowns = menuCenter?.querySelectorAll(
    '.navbar_menu-dropdown'
  ) as NodeListOf<HTMLElement> | null;
  const dropdownToggles = menuCenter?.querySelectorAll(
    '.navbar_dropdown-toggle'
  ) as NodeListOf<HTMLElement> | null;
  const aboutLink = document.getElementById('nav-link-about') as HTMLElement | null;

  if (!menuCenter || !dropdowns || !dropdownToggles) {
    return;
  }

  const updateDropdownVisibility = () => {
    const isMobile = window.innerWidth < 992;

    // Par défaut : tout visible
    dropdowns.forEach((dropdown) => {
      dropdown.style.display = '';
    });
    if (aboutLink) {
      aboutLink.style.display = '';
    }

    // Sur desktop : on ne masque rien
    if (!isMobile) {
      return;
    }

    // Sur mobile : on masque les dropdowns fermés quand un est ouvert
    const openToggle = Array.from(dropdownToggles).find((toggle) =>
      toggle.classList.contains('w--open')
    );

    if (!openToggle) {
      // Aucun dropdown ouvert : tout reste visible
      return;
    }

    // Trouver le dropdown parent du toggle ouvert
    const openDropdown = openToggle.closest('.navbar_menu-dropdown') as HTMLElement | null;

    if (!openDropdown) {
      return;
    }

    // Masquer tous les dropdowns fermés
    dropdowns.forEach((dropdown) => {
      if (dropdown !== openDropdown) {
        dropdown.style.display = 'none';
      }
    });

    // Masquer le lien About
    if (aboutLink) {
      aboutLink.style.display = 'none';
    }
  };

  // Observer les changements de classes sur les dropdown toggles
  const observer = new MutationObserver(updateDropdownVisibility);

  dropdownToggles.forEach((toggle) => {
    observer.observe(toggle, {
      attributes: true,
      attributeFilter: ['class', 'aria-expanded'],
    });
  });

  // Réagir aussi aux changements de breakpoint
  window.addEventListener('resize', updateDropdownVisibility);

  // Vérification initiale
  updateDropdownVisibility();
}

/**
 * Désactive l'ouverture au hover des dropdowns sur mobile / tablette (< 992px).
 * Sur desktop, le comportement Webflow (hover) est conservé.
 */
function initDisableDropdownHoverOnMobile(): void {
  const dropdownToggles = document.querySelectorAll(
    '.navbar_dropdown-toggle'
  ) as NodeListOf<HTMLElement>;

  if (!dropdownToggles.length) {
    return;
  }

  const stopHover = (event: Event) => {
    // On bloque uniquement sur mobile / tablette
    if (window.innerWidth < 992) {
      event.stopImmediatePropagation();
    }
  };

  const updateHoverBehavior = () => {
    const isMobile = window.innerWidth < 992;

    dropdownToggles.forEach((toggle) => {
      if (isMobile) {
        // On intercepte les événements de survol avant Webflow
        toggle.addEventListener('mouseenter', stopHover, true);
        toggle.addEventListener('mouseover', stopHover, true);
      } else {
        // On laisse Webflow gérer le hover sur desktop
        toggle.removeEventListener('mouseenter', stopHover, true);
        toggle.removeEventListener('mouseover', stopHover, true);
      }
    });
  };

  // Comportement initial
  updateHoverBehavior();

  // On réévalue au changement de taille d'écran
  window.addEventListener('resize', updateHoverBehavior);
}

/**
 * Effets de layout mobile quand un dropdown est ouvert :
 * - padding de .navbar_menu (classe dropdown-open)
 * - ajout de is-focus sur :
 *   - le toggle ouvert (.navbar_dropdown-toggle)
 *   - les .navbar_link-column du dropdown ouvert
 *   - .navbar_mobile-back-txt
 *
 * Ne modifie rien sur desktop (≥ 992px).
 */
function initMobileDropdownLayoutEffects(): void {
  const navbarMenu = document.querySelector('.navbar_menu') as HTMLElement | null;
  const dropdownToggles = document.querySelectorAll(
    '.navbar_dropdown-toggle'
  ) as NodeListOf<HTMLElement>;
  const navbarBtnWrap = document.querySelector('.navbar_btn-wrap') as HTMLElement | null;
  const mobileBackTxt = document.querySelector('.navbar_mobile-back-txt') as HTMLElement | null;

  if (!navbarMenu || dropdownToggles.length === 0) {
    return;
  }

  const resetLayout = () => {
    navbarMenu.classList.remove('dropdown-open');
    dropdownToggles.forEach((toggle) => {
      toggle.classList.remove('is-focus');
    });
    const allLeftColumns = document.querySelectorAll(
      '.navbar_link-column'
    ) as NodeListOf<HTMLElement>;
    allLeftColumns.forEach((el) => {
      el.classList.remove('is-focus');
    });
    if (navbarBtnWrap) {
      navbarBtnWrap.style.display = '';
    }
    if (mobileBackTxt) {
      mobileBackTxt.classList.remove('is-focus');
    }
  };

  const applyLayoutForToggle = (toggle: HTMLElement) => {
    const isMobile = window.innerWidth < 992;

    if (!isMobile) {
      // Sur desktop, aucun effet spécifique
      resetLayout();
      return;
    }

    const isOpen =
      toggle.classList.contains('w--open') || toggle.getAttribute('aria-expanded') === 'true';

    if (!isOpen) {
      // Si aucun dropdown n'est ouvert, on nettoie tout
      resetLayout();
      return;
    }

    // On nettoie toujours d'abord avant d'appliquer le nouvel état
    resetLayout();

    // Padding 0 via la classe sur le menu
    navbarMenu.classList.add('dropdown-open');

    // Focus sur le toggle ouvert
    toggle.classList.add('is-focus');

    // Focus sur les contenus de gauche dans le dropdown ouvert
    const openDropdown = toggle.closest('.navbar_menu-dropdown') as HTMLElement | null;
    if (openDropdown) {
      const leftColumns = openDropdown.querySelectorAll(
        '.navbar_link-column'
      ) as NodeListOf<HTMLElement>;
      leftColumns.forEach((el) => {
        el.classList.add('is-focus');
      });
    }

    // Cacher le bouton de droite
    if (navbarBtnWrap) {
      navbarBtnWrap.style.display = 'none';
    }

    // Focus sur le texte de retour mobile
    if (mobileBackTxt) {
      mobileBackTxt.classList.add('is-focus');
    }
  };

  // Utiliser un MutationObserver sur aria-expanded pour suivre l'ouverture/fermeture,
  // y compris quand le dropdown est fermé en cliquant en dehors.
  const observer = new MutationObserver(() => {
    const isMobile = window.innerWidth < 992;

    if (!isMobile) {
      // Sur desktop, on nettoie tout
      resetLayout();
      return;
    }

    const openToggle = Array.from(dropdownToggles).find(
      (toggle) => toggle.getAttribute('aria-expanded') === 'true'
    );

    if (!openToggle) {
      // Aucun dropdown ouvert → reset complet
      resetLayout();
      return;
    }

    applyLayoutForToggle(openToggle);
  });

  dropdownToggles.forEach((toggle) => {
    observer.observe(toggle, {
      attributes: true,
      attributeFilter: ['aria-expanded'],
    });
  });

  // Au changement de breakpoint, on reset et on recalcule l'état
  window.addEventListener('resize', () => {
    resetLayout();
  });

  // État initial
  resetLayout();
}
