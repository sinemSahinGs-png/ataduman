import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const section = document.querySelector('#commission');
if (section) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = section.querySelectorAll('.cta-word');
  const body = section.querySelector('.cta-body');
  const button = section.querySelector('.cta-button');
  const meta = section.querySelector('.cta-meta');
  const extras = [body, button, meta].filter(Boolean);

  if (reduce) {
    gsap.set([...words, ...extras], { clearProps: 'all' });
  } else {
    const mobile = window.matchMedia('(max-width: 720px)').matches;

    gsap.set(words, {
      opacity: 0,
      y: mobile ? 28 : 48,
      filter: `blur(${mobile ? 6 : 10}px)`,
    });
    gsap.set(extras, { opacity: 0, y: 18 });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: section,
        start: 'top 72%',
        end: mobile ? '+=55%' : '+=75%',
        scrub: mobile ? 0.55 : 0.75,
      },
    });

    // One word per scroll beat
    words.forEach((word, i) => {
      tl.to(
        word,
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
        },
        i
      );
    });

    tl.to(
      extras,
      {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.15,
      },
      words.length
    );
  }
}
