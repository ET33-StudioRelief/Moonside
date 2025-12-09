// Gestion des filtres Finsweet pour la page Hub :
// - Affiche/masque le bouton #hub-clear-filter en fonction des filtres sélectionnés
// - Met à jour les compteurs de tags pour services / industries / countries

type CounterIds = {
  services: string;
  industries: string;
  countries: string;
};

const FIELD_KEYS = ['services', 'industries', 'countries'] as const;
type FieldKey = (typeof FIELD_KEYS)[number];

const COUNTER_IDS: CounterIds = {
  services: 'services-tag-filters',
  industries: 'industries-tag-filters',
  countries: 'countries-tag-filters',
};

function getFilterInputs(): HTMLInputElement[] {
  // On cible les inputs de filtres marqués avec fs-list-field
  const selector = 'input[type="checkbox"][fs-list-field], input[type="radio"][fs-list-field]';
  return Array.from(document.querySelectorAll<HTMLInputElement>(selector));
}

function updateHubFilterUI(): void {
  const inputs = getFilterInputs();
  const clearButton = document.getElementById('hub-clear-filter');

  const counts: Record<FieldKey, number> = {
    services: 0,
    industries: 0,
    countries: 0,
  };

  let anyChecked = false;

  inputs.forEach((input) => {
    if (!input.checked) return;
    anyChecked = true;

    const field = (input.getAttribute('fs-list-field') || '').trim() as FieldKey;
    if (FIELD_KEYS.includes(field)) {
      counts[field] += 1;
    }
  });

  if (clearButton) {
    clearButton.style.display = anyChecked ? '' : 'none';
  }

  FIELD_KEYS.forEach((key) => {
    const el = document.getElementById(COUNTER_IDS[key]);
    if (!el) return;

    const value = counts[key];
    // Si aucun filtre pour ce groupe, on laisse vide plutôt que "0"
    el.textContent = value > 0 ? String(value) : '';
  });
}

export function initHubFilters(): void {
  if (typeof document === 'undefined') return;

  const inputs = getFilterInputs();
  if (!inputs.length) {
    return;
  }

  // Première mise à jour à l'initialisation
  updateHubFilterUI();

  // Mise à jour à chaque changement de filtre
  inputs.forEach((input) => {
    input.addEventListener('change', () => {
      updateHubFilterUI();
    });
  });
}
