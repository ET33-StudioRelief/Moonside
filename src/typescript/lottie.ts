type LottieAnimation = {
  play?: () => void;
  pause?: () => void;
  goToAndPlay?: (value: number, isFrame?: boolean) => void;
  goToAndStop?: (value: number, isFrame?: boolean) => void;
  wrapper?: unknown;
  container?: unknown;
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

const isLottieAnimation = (v: unknown): v is LottieAnimation =>
  isRecord(v) && typeof v.play === 'function';

const getAnimationInstance = (el: HTMLElement): LottieAnimation | null => {
  // Try direct properties (best-effort, depends on Webflow/runtime)
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

/**
 * Keys numbers (desktop): play the Lottie only once when `.keys-number_content`
 * enters the viewport.
 *
 * - Lottie element: #keys-number-desktop-lottie
 * - Trigger element: .keys-number_content
 */
export function initKeysNumberDesktopLottiePlayOnEnter(): void {
  if (typeof document === 'undefined') return;
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const trigger = document.querySelector<HTMLElement>('.keys-number_content');
  if (!trigger) return;

  const lottieEl = document.getElementById('keys-number-desktop-lottie') as HTMLElement | null;
  if (!lottieEl) return;

  freezeAtStart(lottieEl);

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        playFromStartOnce(lottieEl);
        obs.unobserve(trigger); // play only once
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(trigger);
}
