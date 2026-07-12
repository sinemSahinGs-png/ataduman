/**
 * Decorative code environment — scroll parallax, proximity glow, card pulse.
 * Does not touch WebGL hero logic.
 */

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCoarse = window.matchMedia('(pointer: coarse)').matches;
const isNarrow = () => window.innerWidth <= 720;

function setupCodeEnv() {
  const env = document.querySelector('.code-env');
  const field = document.querySelector('.hero-field');
  if (!env) return;

  const fragments = [...env.querySelectorAll('.code-frag')];
  const interactive = fragments.filter((el) => el.dataset.interactive === 'true');
  const worksFrags = fragments.filter((el) => el.dataset.zone === 'works');

  /* Mobile: hide distant / interactive-only frags */
  const syncMobileVisibility = () => {
    const mobile = isNarrow();
    fragments.forEach((el) => {
      if (el.dataset.mobile === 'hide') {
        el.style.display = mobile ? 'none' : '';
      }
    });
  };
  syncMobileVisibility();
  window.addEventListener('resize', syncMobileVisibility);

  if (reduceMotion) {
    env.classList.add('is-static');
    if (field) field.classList.add('is-static');
    return;
  }

  let scrollY = window.scrollY;
  let targetScroll = scrollY;
  let ticking = false;

  const applyScroll = () => {
    ticking = false;
    const y = targetScroll;
    const vh = window.innerHeight;
    const progress = Math.min(1, y / (vh * 0.9));

    env.style.setProperty('--scroll-y', `${y * 0.12}px`);
    env.style.setProperty('--scroll-y-slow', `${y * 0.06}px`);
    env.style.setProperty('--scroll-grid', `${y * 0.03}px`);
    env.style.setProperty('--works-fade', String(Math.min(1, Math.max(0, (y - vh * 0.55) / (vh * 0.5)))));

    if (field) {
      field.style.opacity = String(Math.max(0.15, 1 - progress * 1.15));
    }

    worksFrags.forEach((el) => {
      const base = parseFloat(el.dataset.opacity || '0.07');
      const boost = parseFloat(getComputedStyle(env).getPropertyValue('--works-fade') || '0');
      el.style.setProperty('--frag-opacity', String(base + boost * 0.05));
    });
  };

  window.addEventListener(
    'scroll',
    () => {
      targetScroll = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyScroll);
      }
    },
    { passive: true }
  );

  applyScroll();

  /* Cursor proximity — desktop only */
  if (!isCoarse && interactive.length) {
    let mx = 0;
    let my = 0;
    let proxRaf = 0;

    const updateProx = () => {
      proxRaf = 0;
      interactive.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const near = dist < 160;
        el.classList.toggle('is-near', near);
        if (near) {
          const nx = ((mx - cx) / 160) * 3;
          const ny = ((my - cy) / 160) * 3;
          el.style.setProperty('--prox-x', `${nx}px`);
          el.style.setProperty('--prox-y', `${ny}px`);
        } else {
          el.style.setProperty('--prox-x', '0px');
          el.style.setProperty('--prox-y', '0px');
        }
      });
    };

    window.addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!proxRaf) proxRaf = requestAnimationFrame(updateProx);
      },
      { passive: true }
    );
  }

  /* Project card hover → nearby system pulse */
  const works = document.querySelector('#works');
  if (works && !isCoarse) {
    const pulse = env.querySelector('.code-pulse');
    works.querySelectorAll('.work').forEach((card, i) => {
      card.addEventListener('pointerenter', () => {
        env.classList.add('is-build');
        if (pulse) {
          pulse.textContent = i % 2 === 0 ? '// build complete' : '// view project';
          pulse.classList.add('is-on');
        }
        const target = worksFrags[i % Math.max(worksFrags.length, 1)];
        if (target) target.classList.add('is-lit');
      });
      card.addEventListener('pointerleave', () => {
        env.classList.remove('is-build');
        if (pulse) pulse.classList.remove('is-on');
        worksFrags.forEach((el) => el.classList.remove('is-lit'));
      });
    });
  }
}

setupCodeEnv();
