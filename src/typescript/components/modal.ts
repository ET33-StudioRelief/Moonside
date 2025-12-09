/**
Show contact modal
 */
export function initContactModal(): void {
  // Trouver tous les boutons qui ouvrent la modal
  const triggerButtons = document.querySelectorAll<HTMLElement>('[data-button="contact-modal"]');

  // Trouver la modal
  const modal = document.getElementById('contact-modal');

  if (!modal || triggerButtons.length === 0) {
    return;
  }

  // Fonction pour ouvrir la modal
  const openModal = (): void => {
    modal.style.display = 'flex';
    // Désactiver le scroll du body sur desktop (>767px)
    if (window.innerWidth > 767) {
      document.body.classList.add('modal-open');
    }
  };

  // Fonction pour fermer la modal
  const closeModal = (): void => {
    modal.style.display = 'none';
    // Réactiver le scroll du body
    document.body.classList.remove('modal-open');
  };

  // Ajouter les écouteurs d'événements sur chaque bouton
  triggerButtons.forEach((button) => {
    // Gérer le clic
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Empêcher la propagation pour éviter les conflits
      openModal();
    });

    // Gérer les interactions clavier pour l'accessibilité (Enter et Espace)
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Empêcher le scroll avec Espace
        e.stopPropagation();
        openModal();
      }
    });
  });

  // Trouver les éléments pour fermer la modal
  const closeButton = document.getElementById('close-modal');
  const successCloseButton = document.getElementById('success-msg-btn');
  const modalWrapper = document.getElementById('modal-wrapper');
  const modalForm = document.getElementById('modal-form');

  // Fermer la modal en cliquant sur le bouton de fermeture
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      closeModal();
    });
  }

  // Fermer la modal en cliquant sur le bouton de succès (par ex. "Close" dans le message de succès)
  if (successCloseButton) {
    successCloseButton.addEventListener('click', () => {
      closeModal();
    });
  }

  // Fermer la modal en cliquant sur modal-wrapper, sauf si le clic est dans modal-form
  // (sauf si c'est sur close-modal qui est géré séparément)
  if (modalWrapper) {
    modalWrapper.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Si le clic est sur close-modal, ne rien faire (déjà géré ci-dessus)
      if (target.id === 'close-modal' || target.closest('#close-modal')) {
        return;
      }

      // Si le clic est dans modal-form (mais pas sur close-modal), ne pas fermer
      if (modalForm && (target === modalForm || modalForm.contains(target))) {
        return;
      }

      // Sinon, fermer la modal (clic sur le wrapper mais pas sur le formulaire)
      closeModal();
    });
  }

  // Fermer la modal avec la touche Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });
}

/**
 * Validation of the phone field (FR format) for input[type="tel"].
 */
export function initContactPhoneValidation(): void {
  const phoneInput = document.querySelector('input[type="tel"]') as HTMLInputElement | null;

  if (!phoneInput) {
    return;
  }

  // Regex pour numéro français
  const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;

  phoneInput.addEventListener('blur', () => {
    const value = phoneInput.value.replace(/\s/g, ''); // Enlève les espaces

    if (value && !phoneRegex.test(value)) {
      phoneInput.setCustomValidity(
        'Veuillez entrer un numéro de téléphone valide (ex: 06 12 34 56 78)'
      );
      phoneInput.reportValidity();
    } else {
      phoneInput.setCustomValidity('');
    }
  });

  // Réinitialiser l'erreur quand l'utilisateur tape
  phoneInput.addEventListener('input', () => {
    phoneInput.setCustomValidity('');
  });
}

/**
 * Hide the first option for selects marked with ms-code="hide-first-option".
 */
export function initHideFirstOptionSelects(): void {
  const selects = document.querySelectorAll(
    'select[ms-code="hide-first-option"]'
  ) as NodeListOf<HTMLSelectElement>;

  selects.forEach((select) => {
    const firstOption = select.options[0];
    if (firstOption) {
      firstOption.hidden = true;
    }
  });
}

/**
 * Hide elements above the form when the success message is visible
 */
export function initContactModalSuccessLayout(): void {
  const modal = document.getElementById('contact-modal') as HTMLElement | null;
  const content = modal?.querySelector('.contact_modal-content') as HTMLElement | null;
  const formWrapper = content?.querySelector('.modal_form-block.w-form') as HTMLElement | null;
  const successWrapper = content?.querySelector(
    '.form_message-success-wrapper.w-form-done'
  ) as HTMLElement | null;

  if (!content || !formWrapper || !successWrapper) {
    return;
  }

  const elementsAbove: HTMLElement[] = [];
  let sibling = formWrapper.previousElementSibling as HTMLElement | null;

  while (sibling) {
    elementsAbove.push(sibling);
    sibling = sibling.previousElementSibling as HTMLElement | null;
  }

  const updateHeaderVisibility = () => {
    const isSuccessVisible = getComputedStyle(successWrapper).display !== 'none';
    elementsAbove.forEach((el) => {
      el.style.display = isSuccessVisible ? 'none' : '';
    });
  };

  // Mise à jour initiale (au cas où le formulaire serait déjà en état succès)
  updateHeaderVisibility();

  const observer = new MutationObserver(updateHeaderVisibility);
  observer.observe(successWrapper, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
}
