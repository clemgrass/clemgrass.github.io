import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mesYAnio } from '../lib/fechas.js';
import { textosInterfaz } from '../lib/textos.js';
import { prepararSitio } from '../lib/sitio.js';
import { cargarContenido } from '../lib/contenido.js';

test('mesYAnio en zona de Santiago', () => {
  assert.deepEqual(mesYAnio(new Date('2026-10-19T12:00:00Z')), { es: 'Oct 2026', en: 'Oct 2026' });
  assert.deepEqual(mesYAnio(new Date('2026-09-01T02:00:00Z')), { es: 'Ago 2026', en: 'Aug 2026' });
  assert.deepEqual(mesYAnio(new Date('2027-01-15T12:00:00Z')), { es: 'Ene 2027', en: 'Jan 2027' });
});

test('textos gamer y neutros', () => {
  assert.deepEqual(textosInterfaz(true).enCurso, { es: 'Partida en curso', en: 'Currently playing' });
  assert.deepEqual(textosInterfaz(true).completadas, { es: 'Misiones completadas', en: 'Completed quests' });
  assert.deepEqual(textosInterfaz(true).cine, { es: 'Misión secundaria: cine', en: 'Side quest: film' });
  assert.deepEqual(textosInterfaz(true).contacto, { es: '¿Guardamos la partida?', en: 'Save and continue?' });
  assert.deepEqual(textosInterfaz(false).enCurso, { es: 'Actualmente', en: 'Currently' });
  assert.deepEqual(textosInterfaz(false).completadas, { es: 'Experiencia previa', en: 'Previous experience' });
  assert.deepEqual(textosInterfaz(false).cine, { es: 'Cine', en: 'Film' });
  assert.deepEqual(textosInterfaz(false).contacto, { es: 'Contacto', en: 'Contact' });
  assert.deepEqual(textosInterfaz(false).desplazate, { es: 'Desplázate para continuar', en: 'Scroll to continue' });
});

test('prepararSitio separa y desplaza', () => {
  const s = prepararSitio(cargarContenido('contenido').contenido, new Date('2026-10-19T12:00:00Z'));
  assert.equal(s.enCurso.length, 2);
  assert.equal(s.completadas.length, 6);
  assert.equal(s.formacionPrincipal.memoriaTipo, 'memoria');
  assert.equal(s.formacionOtras.length, 2);
  assert.deepEqual(s.cine.map(c => c.desplazamiento), ['0', 'auto', '12%']);
  assert.deepEqual(s.guardado, { es: 'Oct 2026', en: 'Oct 2026' });
  assert.equal(s.anio, '2026');
  assert.deepEqual(s.textos, textosInterfaz(true));
});
