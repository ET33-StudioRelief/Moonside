/**<p> = svg*/
export function svgComponent(): void {
  document.querySelectorAll('[svg="component"]').forEach((element) => {
    const svgCode = element.textContent;
    if (svgCode !== null) {
      element.innerHTML = svgCode;
    }
  });
}

/**
 * Révèle les sections au scroll pour les éléments marqués avec
 * section-animation="reveal-up-scroll" / "fade-in-scroll"
 * ou data-animation="reveal-up-scroll" / "fade-in-scroll".
 * Ajoute la classe .is-revealed lorsque l'élément entre dans le viewport.
 */
export function initSectionRevealOnScroll(): void {
  if (typeof document === 'undefined') return;
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll<HTMLElement>(
    [
      '[section-animation="reveal-up-scroll"]',
      '[data-animation="reveal-up-scroll"]',
      '[section-animation="fade-in-scroll"]',
      '[data-animation="fade-in-scroll"]',
    ].join(', ')
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add('is-revealed');
        obs.unobserve(el);
      });
    },
    {
      threshold: 0.2,
    }
  );

  targets.forEach((el) => observer.observe(el));
}
