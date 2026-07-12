import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector('#about');
if (!section) {
  // no-op
} else {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) {
    section.classList.add('is-about-ready');
  } else {
    const mobile = window.matchMedia('(max-width: 720px)').matches;
    const yWord = mobile ? 20 : 38;
    const blurWord = mobile ? 5 : 10;
    const durWord = mobile ? 0.65 : 0.8;
    const yBlock = mobile ? 12 : 16;
    const blurBlock = mobile ? 3 : 5;

    const lines = section.querySelectorAll('.about-title-line');
    const w1 = lines[0]?.querySelectorAll('.hero-word') || [];
    const w2 = lines[1]?.querySelectorAll('.hero-word') || [];
    const w3 = lines[2]?.querySelectorAll('.hero-word') || [];
    const accentWords = section.querySelectorAll('.hero-word--accent, .hero-word--dot');
    const services = section.querySelectorAll('.about-service, .about-services-sep');
    const dropCap = section.querySelector('.drop-cap');
    const blocks = section.querySelectorAll('.about-block');
    const metaList = section.querySelector('.meta-list');
    const rows = [...section.querySelectorAll('.meta-row')];
    const statusDot = section.querySelector('.status-dot');

    if (metaList) metaList.style.setProperty('--line-top', '0');
    rows.forEach((row) => row.style.setProperty('--row-line', '0'));

    const allWords = [...w1, ...w2, ...w3];
    gsap.set(allWords, {
      opacity: 0,
      y: yWord,
      filter: `blur(${blurWord}px)`,
      scale: 0.98,
    });
    gsap.set(services, { opacity: 0, y: 12 });
    gsap.set(dropCap, { opacity: 0, y: 20, scale: 0.92 });
    gsap.set(blocks, {
      opacity: 0,
      y: yBlock,
      filter: `blur(${blurBlock}px)`,
    });
    gsap.set(rows, { opacity: 0, x: 14 });
    gsap.set(statusDot, { opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true,
      },
      onStart: () => section.classList.add('is-about-ready'),
    });

    // 1 — MARKANIZA
    tl.to(w1, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      duration: durWord,
      stagger: 0.1,
    });

    tl.to({}, { duration: 0.08 });

    // 2 — ÖZEL WEB  (+ right column starts here)
    const line2Start = tl.duration();
    tl.to(w2, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      duration: durWord,
      stagger: 0.1,
    });

    // Soft cyan glow on WEB / SİTELERİ when they appear
    tl.to(
      accentWords,
      {
        textShadow: mobile
          ? '0 0 8px rgba(57,231,255,0.15)'
          : '0 0 16px rgba(57,231,255,0.28)',
        duration: 0.35,
      },
      '-=0.45'
    );
    tl.to(accentWords, {
      textShadow: '0 0 0 rgba(57,231,255,0)',
      duration: 0.45,
    });

    tl.to({}, { duration: 0.08 });

    // 3 — SİTELERİ.
    tl.to(w3, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      scale: 1,
      duration: durWord,
      stagger: 0.08,
    });

    // Soft glow again briefly for SİTELERİ line
    tl.to(
      w3,
      {
        textShadow: mobile
          ? '0 0 8px rgba(57,231,255,0.12)'
          : '0 0 14px rgba(57,231,255,0.25)',
        duration: 0.35,
      },
      '-=0.5'
    );
    tl.to(w3, {
      textShadow: '0 0 0 rgba(57,231,255,0)',
      duration: 0.4,
    });

    // Service line after title (~1.6–2s title block)
    tl.to(services, {
      opacity: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.07,
      ease: 'power2.out',
    });

    // ── Right column from second title line
    tl.to(
      dropCap,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out',
      },
      line2Start
    );

    tl.to(
      blocks,
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: mobile ? 0.5 : 0.65,
        stagger: mobile ? 0.1 : 0.14,
        ease: 'power2.out',
      },
      line2Start + 0.18
    );

    tl.to(
      metaList,
      {
        '--line-top': 1,
        duration: 0.65,
        ease: 'power2.inOut',
      },
      line2Start + (mobile ? 0.7 : 0.9)
    );

    rows.forEach((row, i) => {
      const at = line2Start + (mobile ? 0.8 : 1.0) + i * 0.1;
      tl.to(
        row,
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out',
        },
        at
      );
      tl.to(
        row,
        {
          '--row-line': 1,
          duration: 0.65,
          ease: 'power2.inOut',
        },
        at
      );
    });

    const statusAt = line2Start + (mobile ? 0.8 : 1.0) + rows.length * 0.1 + 0.12;
    tl.to(
      statusDot,
      {
        opacity: 1,
        duration: 0.35,
        onComplete: () => {
          if (statusDot) statusDot.classList.add('is-pulsed');
        },
      },
      statusAt
    );
  }
}
