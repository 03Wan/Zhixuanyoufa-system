import { onBeforeUnmount, onMounted } from 'vue';

const revealSelector = [
  '.public-section-head',
  '.public-card',
  '.platform-table',
  '.platform-link',
  '.workflow-pipeline button',
  '.workflow-detail',
  '.review-console',
  '.trust-list span',
  '.public-cta',
  '.coverage-console',
  '.matrix-wrap',
  '.plans article',
  '.rules-layout li',
  '.roadmap article',
  '.proof-layout li',
  '.public-legal article',
].join(',');

export function usePublicScrollReveal() {
  let observer: IntersectionObserver | undefined;

  onMounted(() => {
    const root = document.querySelector<HTMLElement>('.public-page');
    if (!root) return;
    const elements = Array.from(root.querySelectorAll<HTMLElement>(revealSelector));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    elements.forEach((element, index) => {
      element.classList.add('reveal-tech');
      element.style.setProperty('--reveal-delay', `${(index % 6) * 70}ms`);
    });

    if (reducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(element => element.classList.add('is-visible'));
      return;
    }

    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer?.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    elements.forEach(element => observer?.observe(element));
  });

  onBeforeUnmount(() => observer?.disconnect());
}
