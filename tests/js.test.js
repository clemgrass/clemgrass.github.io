import { test } from 'node:test';
import assert from 'node:assert/strict';
import { progresoEntrada, estiloEntrada, estiloSalidaHero, estiloCine, progresoSalidaHero, progresoCine } from '../src/assets/js/animaciones.js';

await import('../src/assets/js/idioma.js');
const { idiomaInicial } = globalThis;

test('idiomaInicial', () => {
  assert.equal(idiomaInicial('en', 'es-CL'), 'en');
  assert.equal(idiomaInicial('es', 'en-US'), 'es');
  assert.equal(idiomaInicial(null, 'en-US'), 'en');
  assert.equal(idiomaInicial(null, 'EN'), 'en');
  assert.equal(idiomaInicial(null, 'es-CL'), 'es');
  assert.equal(idiomaInicial(null, undefined), 'es');
  assert.equal(idiomaInicial('fr', 'en-GB'), 'en');
});

test('progresoEntrada', () => {
  assert.equal(progresoEntrada(1000, 800), 0);
  assert.equal(progresoEntrada(600, 800), 0.5);
  assert.equal(progresoEntrada(100, 800), 1);
});

test('estiloEntrada extremos', () => {
  assert.deepEqual(estiloEntrada(0), { transform: 'perspective(1400px) translate3d(0,120px,-1400px) rotateX(48deg)', opacity: '0', filter: 'blur(12px)' });
  assert.deepEqual(estiloEntrada(1), { transform: '', opacity: '', filter: '' });
});

test('estiloEntrada a mitad', () => {
  // p = 0.5 → e = 0.875, k = 0.125
  assert.deepEqual(estiloEntrada(0.5), { transform: 'perspective(1400px) translate3d(0,15px,-175px) rotateX(6deg)', opacity: '1', filter: 'blur(1.5px)' });
});

test('salida del hero', () => {
  assert.deepEqual(estiloSalidaHero(0), { transform: '', opacity: '1', filter: '' });
  assert.deepEqual(estiloSalidaHero(1), { transform: 'perspective(1400px) translate3d(0,80px,-600px) rotateX(-25deg)', opacity: '0', filter: 'blur(8px)' });
  assert.equal(progresoSalidaHero(0, 800), 0);
  assert.equal(progresoSalidaHero(-300, 800), 0.5);
  assert.equal(progresoSalidaHero(-2000, 800), 1);
});

test('estiloCine', () => {
  assert.equal(estiloCine(0), 'scale(0.7) rotate(-6deg)');
  assert.equal(estiloCine(1), 'scale(1.3) rotate(6deg)');
  assert.equal(progresoCine(100, 3000, 800), 0);
  assert.equal(progresoCine(-1100, 3000, 800), 0.5);
});
