// Cambio de idioma ES / EN sin recargar la página.
// Se carga en <head> para fijar el idioma antes de que se vea la página.
(function () {
  function idiomaInicial(guardado, idiomaNavegador) {
    if (guardado === 'es' || guardado === 'en') return guardado;
    return String(idiomaNavegador || '').toLowerCase().startsWith('en') ? 'en' : 'es';
  }

  function aplicarIdioma(lang) {
    const html = document.documentElement;
    html.lang = lang;
    const titulo = lang === 'en' ? html.dataset.tituloEn : html.dataset.tituloEs;
    const descripcion = lang === 'en' ? html.dataset.descEn : html.dataset.descEs;
    if (titulo) document.title = titulo;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && descripcion) meta.setAttribute('content', descripcion);
    document.querySelectorAll('[data-idioma]').forEach(boton => {
      boton.setAttribute('aria-pressed', String(boton.dataset.idioma === lang));
    });
  }

  globalThis.idiomaInicial = idiomaInicial;
  globalThis.aplicarIdioma = aplicarIdioma;
  if (typeof document === 'undefined') return;

  document.documentElement.classList.remove('no-js');
  let guardado = null;
  try { guardado = localStorage.getItem('cg-lang'); } catch (e) { /* almacenamiento bloqueado */ }
  aplicarIdioma(idiomaInicial(guardado, navigator.language));

  document.addEventListener('DOMContentLoaded', () => {
    aplicarIdioma(document.documentElement.lang);
    document.querySelectorAll('[data-idioma]').forEach(boton => {
      boton.addEventListener('click', () => {
        const lang = boton.dataset.idioma;
        try { localStorage.setItem('cg-lang', lang); } catch (e) { /* almacenamiento bloqueado */ }
        aplicarIdioma(lang);
      });
    });
  });
})();
