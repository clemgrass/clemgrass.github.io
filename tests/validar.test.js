import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { crearContenido, contenidoValido, experiencia } from './ayuda.js';

function validar(dir, conResumen = true) {
  const resumen = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'resumen-')), 'summary.md');
  const env = { ...process.env };
  delete env.GITHUB_STEP_SUMMARY;
  if (conResumen) env.GITHUB_STEP_SUMMARY = resumen;
  const r = spawnSync(process.execPath, ['scripts/validar.js', dir], { env, encoding: 'utf8' });
  return { ...r, resumen: conResumen && fs.existsSync(resumen) ? fs.readFileSync(resumen, 'utf8') : '' };
}

test('contenido válido → exit 0 y mensaje', () => {
  const r = validar(crearContenido(contenidoValido()));
  assert.equal(r.status, 0);
  assert.match(r.stdout, /^✓ Todo bien: 5 archivos revisados\.$/m);
  assert.match(r.resumen, /## ✅ Contenido válido/);
});

test('contenido roto → exit 1, lista y resumen', () => {
  const r = validar(crearContenido({ ...contenidoValido(), 'experiencia/2026-japs.md': experiencia({ inicio: '2026-4' }) }));
  assert.equal(r.status, 1);
  assert.match(r.stdout, /✗ experiencia\/2026-japs\.md → 'inicio' debe verse así/);
  assert.match(r.stdout, /Hay 1 problema\(s\)\. Arréglalos y vuelve a guardar; el check se vuelve a revisar solo\./);
  assert.match(r.resumen, /## ❌ Hay que arreglar el contenido/);
  assert.match(r.resumen, /- \*\*experiencia\/2026-japs\.md\*\*: 'inicio'/);
});

test('sin GITHUB_STEP_SUMMARY no falla', () => {
  const r = validar(crearContenido(contenidoValido()), false);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, '');
});
