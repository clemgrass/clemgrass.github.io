import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

// Un texto largo sin espacios (un enlace, una palabra larga) no debe empujar la página hacia el lado en móvil.
test('el texto largo se corta en vez de desbordar', () => {
  const css = fs.readFileSync('src/assets/css/estilos.css', 'utf8');
  const body = css.match(/\nbody\s*\{([^}]*)\}/)[1];
  assert.match(body, /overflow-wrap:\s*anywhere/);
  assert.match(css, /h1,\s*h2,\s*h3[^{]*\{[^}]*hyphens:\s*auto/);
});
