// Revisa la carpeta de contenido y explica en español qué hay que arreglar.
// Uso: npm run validar   (o: node scripts/validar.js otra-carpeta)
import fs from 'node:fs';
import { cargarContenido, formatearError } from '../lib/contenido.js';

const dir = process.argv[2] ?? 'contenido';
const { errores, archivosRevisados } = cargarContenido(dir);
const resumen = process.env.GITHUB_STEP_SUMMARY;

if (errores.length === 0) {
  console.log(`✓ Todo bien: ${archivosRevisados} archivos revisados.`);
  if (resumen) fs.appendFileSync(resumen, `## ✅ Contenido válido\n\n${archivosRevisados} archivos revisados.\n`);
} else {
  for (const e of errores) console.log(`✗ ${formatearError(e)}`);
  console.log(`\nHay ${errores.length} problema(s). Arréglalos y vuelve a guardar; el check se vuelve a revisar solo.`);
  if (resumen) {
    const lista = errores.map(e => `- **${e.archivo}**: ${e.mensaje}`).join('\n');
    fs.appendFileSync(resumen, `## ❌ Hay que arreglar el contenido\n\n${lista}\n`);
  }
  process.exitCode = 1;
}
