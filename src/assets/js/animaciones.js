// Animaciones ligadas al scroll, iguales al diseño: el contenido "viene desde atrás".
// Las funciones de cálculo son puras (se prueban en tests/js.test.js).

const n = x => String(+x.toFixed(3));
const limitar = x => Math.min(1, Math.max(0, x));
const SIN_ESTILO = { transform: '', opacity: '', filter: '' };

export const progresoEntrada = (top, vh) => limitar((vh - top) / (vh * 0.5));

export function estiloEntrada(p) {
  const e = 1 - Math.pow(1 - p, 3);
  const k = 1 - e;
  if (k <= 0.001) return SIN_ESTILO;
  return {
    transform: `perspective(1400px) translate3d(0,${n(k * 120)}px,${n(-k * 1400)}px) rotateX(${n(k * 48)}deg)`,
    opacity: n(Math.min(1, e * 1.4)),
    filter: `blur(${n(k * 12)}px)`
  };
}

export const progresoSalidaHero = (top, alto) => limitar(-top / (alto * 0.75));

export function estiloSalidaHero(p) {
  if (!p) return { transform: '', opacity: '1', filter: '' };
  return {
    transform: `perspective(1400px) translate3d(0,${n(p * 80)}px,${n(-p * 600)}px) rotateX(${n(-p * 25)}deg)`,
    opacity: n(1 - p),
    filter: `blur(${n(p * 8)}px)`
  };
}

export const progresoCine = (top, alto, vh) => limitar(-top / Math.max(1, alto - vh));

export const estiloCine = p => `scale(${n(0.7 + p * 0.6)}) rotate(${n(-6 + p * 12)}deg)`;

function aplicar(el, estilo) {
  el.style.transform = estilo.transform;
  el.style.opacity = estilo.opacity;
  el.style.filter = estilo.filter;
  el.style.willChange = estilo.transform ? 'transform' : '';
}

function iniciar() {
  const entradas = [...document.querySelectorAll('[data-z="in"]')];
  const hero = document.querySelector('[data-z="out"]');
  const parallax = [...document.querySelectorAll('[data-par]')];
  const crecer = [...document.querySelectorAll('[data-grow]')];
  entradas.forEach(el => { el.style.transformOrigin = '50% 100%'; });
  if (hero) hero.style.transformOrigin = '50% 0%';

  function tick() {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    for (const el of entradas) aplicar(el, estiloEntrada(progresoEntrada(el.getBoundingClientRect().top, vh)));
    if (hero) {
      const r = hero.getBoundingClientRect();
      aplicar(hero, estiloSalidaHero(progresoSalidaHero(r.top, r.height)));
    }
    for (const el of parallax) {
      const r = el.parentElement.getBoundingClientRect();
      const d = r.top + r.height / 2 - vh / 2;
      el.style.transform = `translate3d(${n(d * parseFloat(el.dataset.par) - vw * 0.1)}px,0,0)`;
    }
    for (const el of crecer) {
      const r = el.parentElement.parentElement.getBoundingClientRect();
      el.style.transform = estiloCine(progresoCine(r.top, r.height, vh));
    }
  }

  let pendiente = 0;
  const pedir = () => {
    if (!pendiente) pendiente = requestAnimationFrame(() => { pendiente = 0; tick(); });
  };
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  tick();

  document.querySelectorAll('[data-intro]').forEach(el => {
    el.style.transformOrigin = '50% 100%';
    el.animate([
      { opacity: 0, transform: 'perspective(1400px) translate3d(0,80px,-1400px) rotateX(48deg)', filter: 'blur(14px)' },
      { opacity: 1, transform: 'perspective(1400px) translate3d(0,0,0) rotateX(0deg)', filter: 'blur(0)' }
    ], { duration: 1600, delay: 150 + Number(el.dataset.intro) * 160, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
  });
}

if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  iniciar();
}
