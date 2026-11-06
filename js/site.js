/* Shared navigation and keyboard support; no animation dependency required. */
(() => {
  const back = document.querySelector('.back-to-top');
  if (back) back.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  const fruitVideo = document.getElementById('fruit-video');
  const videoToggle = document.getElementById('fruit-video-toggle');
  if (fruitVideo && videoToggle) {
    fruitVideo.muted = true;
    const updatePlayback = () => {
      const paused = fruitVideo.paused;
      videoToggle.setAttribute('aria-label', paused ? 'Pornește videoclipul' : 'Pune videoclipul pe pauză');
      videoToggle.innerHTML = paused ? 'Redă <span aria-hidden="true">▷</span>' : 'Pauză <span aria-hidden="true">Ⅱ</span>';
    };
    const playVideo = () => fruitVideo.play().catch(updatePlayback);
    fruitVideo.addEventListener('play', updatePlayback);
    fruitVideo.addEventListener('pause', updatePlayback);
    videoToggle.addEventListener('click', () => {
      if (fruitVideo.paused) playVideo();
      else fruitVideo.pause();
    });
    updatePlayback();
    playVideo();
  }
  // Restore focus after a dialog closes and contain keyboard focus while open.
  const panels = ['cart-sidebar', 'product-modal', 'order-form-overlay', 'img-zoom-overlay']
    .map(id => document.getElementById(id)).filter(Boolean);
  const previousFocus = new Map();
  const visible = panel => panel.id === 'product-modal' || panel.id === 'cart-sidebar'
    ? panel.classList.contains('active') : panel.style.display === 'flex';
  panels.forEach(panel => {
    new MutationObserver(() => {
      if (visible(panel)) {
        previousFocus.set(panel, document.activeElement);
        const target = panel.querySelector('button, input, [href], [tabindex]');
        target?.focus();
      } else if (previousFocus.get(panel)?.isConnected) previousFocus.get(panel).focus();
    }).observe(panel, { attributes: true, attributeFilter: ['class', 'style'] });
  });
  document.addEventListener('keydown', event => {
    const panel = [...panels].reverse().find(visible);
    if (!panel) return;
    if (event.key === 'Escape') {
      panel.classList.remove('active');
      if (panel.id === 'order-form-overlay' || panel.id === 'img-zoom-overlay') panel.style.display = 'none';
    }
    if (event.key !== 'Tab') return;
    const elements = [...panel.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
      .filter(el => !el.disabled && el.getClientRects().length);
    if (!elements.length) return;
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
