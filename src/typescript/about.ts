export function initAboutInteractions(): void {
  if (typeof document === 'undefined') return;

  const dropdowns = document.querySelectorAll<HTMLElement>('.location_dropdown');
  if (!dropdowns.length) return;

  // Définir l'image par défaut à partir du premier dropdown
  const firstDropdown = dropdowns[0];
  const firstWrapper = firstDropdown.closest('.location_flex') as HTMLElement | null;
  const defaultImageElement =
    (firstWrapper?.querySelector('#location-image') as HTMLImageElement | null) ||
    (document.getElementById('location-image') as HTMLImageElement | null);
  const defaultImageUrl = firstDropdown.getAttribute('data-image') || '';

  if (defaultImageElement && defaultImageUrl) {
    defaultImageElement.src = defaultImageUrl;
  }

  dropdowns.forEach((dropdown) => {
    // Chaque dropdown contrôle uniquement le bloc texte contenu dans sa propre structure
    const container =
      (dropdown.closest('.location_dropdown') as HTMLElement | null) ||
      (dropdown.parentElement as HTMLElement | null);

    const textContent = container?.querySelector('.services_txt-content') as HTMLElement | null;
    if (!container || !textContent) return;

    const locationWrapper = dropdown.closest('.location_flex') as HTMLElement | null;
    const imageElement =
      (locationWrapper?.querySelector('#location-image') as HTMLImageElement | null) ||
      (document.getElementById('location-image') as HTMLImageElement | null);
    const imageUrl = dropdown.getAttribute('data-image') || '';

    const handleEnter = () => {
      const fullHeight = textContent.scrollHeight;
      textContent.style.maxHeight = `${fullHeight}px`;
      textContent.style.opacity = '1';

      if (imageElement && imageUrl) {
        imageElement.src = imageUrl;
      }
    };

    const handleLeave = () => {
      textContent.style.maxHeight = '0px';
      textContent.style.opacity = '0';
    };

    dropdown.addEventListener('mouseenter', handleEnter);
    dropdown.addEventListener('mouseleave', handleLeave);
  });
}
