// Las recetas de COMO-EDITAR.md no deben poner en rojo el check del PR:
// se aplican a una copia del proyecto y se corre la suite completa ahí.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const RAIZ = process.cwd();

function copiaDelProyecto() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proyecto-'));
  for (const item of ['lib', 'src', 'tests', 'scripts', 'contenido', 'package.json', 'eleventy.config.js']) {
    fs.cpSync(path.join(RAIZ, item), path.join(dir, item), { recursive: true });
  }
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(dir, 'node_modules'));
  return dir;
}

function cambiar(dir, archivo, de, a) {
  const ruta = path.join(dir, 'contenido', archivo);
  const texto = fs.readFileSync(ruta, 'utf8');
  assert.ok(texto.includes(de), `${archivo} no contiene ${de}`);
  fs.writeFileSync(ruta, texto.replace(de, a));
}

function suiteEn(dir) {
  const pruebas = fs.readdirSync(path.join(dir, 'tests')).filter(f => f.endsWith('.test.js') && f !== 'recetas.test.js');
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT; // si no, el hijo reporta al runner padre y siempre sale con 0
  const r = spawnSync(process.execPath, ['--test', ...pruebas.map(f => `tests/${f}`)], { cwd: dir, env, encoding: 'utf8' });
  const v = spawnSync(process.execPath, ['scripts/validar.js'], { cwd: dir, encoding: 'utf8' });
  return { tests: r.status, salida: r.stdout.split('\n').filter(l => l.startsWith('not ok') || l.includes('✖')).join('\n'), validar: v.status };
}

test('todas las recetas juntas mantienen el check verde', () => {
  const dir = copiaDelProyecto();
  const c = path.join(dir, 'contenido');
  cambiar(dir, 'experiencia/2026-japs.md', 'en_curso: sí', 'en_curso: no');
  cambiar(dir, 'general.md', 'modo_gamer: sí', 'modo_gamer: no');
  cambiar(dir, 'general.md', 'Me interesa', 'Hoy me interesa');
  fs.copyFileSync(path.join(c, 'experiencia/_EJEMPLO.md'), path.join(c, 'experiencia/2027-empresa.md'));
  fs.copyFileSync(path.join(c, 'cine/_EJEMPLO.md'), path.join(c, 'cine/2027-cortometraje.md'));
  fs.copyFileSync(path.join(c, 'formacion/_EJEMPLO.md'), path.join(c, 'formacion/2027-magister.md'));
  fs.rmSync(path.join(c, 'cine/2023-lider-grupo-cine.md'));
  const r = suiteEn(dir);
  assert.equal(r.validar, 0);
  assert.equal(r.tests, 0, r.salida);
});

test('sin trabajos en curso ni cine el check sigue verde', () => {
  const dir = copiaDelProyecto();
  const c = path.join(dir, 'contenido');
  cambiar(dir, 'experiencia/2026-japs.md', 'en_curso: sí', 'en_curso: no');
  cambiar(dir, 'experiencia/2026-ninas-pro.md', 'en_curso: sí', 'en_curso: no');
  for (const f of fs.readdirSync(path.join(c, 'cine'))) if (!f.startsWith('_')) fs.rmSync(path.join(c, 'cine', f));
  const r = suiteEn(dir);
  assert.equal(r.validar, 0);
  assert.equal(r.tests, 0, r.salida);
});
