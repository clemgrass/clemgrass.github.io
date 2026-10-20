import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Escribe un set de archivos de contenido en un directorio temporal nuevo.
export function crearContenido(archivos) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'contenido-'));
  for (const carpeta of ['experiencia', 'formacion', 'cine']) {
    fs.mkdirSync(path.join(dir, carpeta));
  }
  for (const [ruta, texto] of Object.entries(archivos)) {
    fs.mkdirSync(path.dirname(path.join(dir, ruta)), { recursive: true });
    fs.writeFileSync(path.join(dir, ruta), texto);
  }
  return dir;
}

export const GENERAL = `---
nombre_linea_1: Clemente
nombre_linea_2: Grass Briones
cargo_es: Ingeniero Civil en Computación
cargo_en: Software Engineer
universidad: Universidad de Chile
email: cgrassdev@gmail.com
linkedin: https://www.linkedin.com/in/clemente-grass-briones/
github: https://github.com/clemgrass
modo_gamer: sí
---

## Español
Me interesa la tecnología.

### Contacto
Escríbeme.

## English
I care about technology.

### Contacto
Drop me a line.
`;

export function experiencia({ cargo = 'Product Engineer', empresa = 'JAPS Engineering SpA', inicio = '2026-04', enCurso = 'sí', extra = '' } = {}) {
  return `---
cargo: ${cargo}
empresa: ${empresa}
fecha_es: Abr 2026 — presente
fecha_en: Apr 2026 — present
inicio: ${inicio}
en_curso: ${enCurso}
${extra}---

## Español
Descripción.

## English
Description.
`;
}

export const FORMACION = `---
titulo_es: Ingeniería Civil en Computación
titulo_en: Software Engineering
institucion: Universidad de Chile
fecha: 2021 — 2026
inicio: 2021-03
memoria_tipo: memoria
memoria_es: “Participación lúdica.”
memoria_en: “Ludic Engagement.”
---
`;

export const CINE = `---
titulo_es: Líder de grupo de cine
titulo_en: Film Group Leader
fecha_es: 2023 — actual
fecha_en: 2023 — current
inicio: 2023-01
---

## Español
Organicé proyecciones.

## English
Organized screenings.
`;

// Set mínimo válido: general, 1 trabajo en curso, 1 terminado, 1 formación, 1 cine.
export function contenidoValido() {
  return {
    'general.md': GENERAL,
    'experiencia/2026-japs.md': experiencia(),
    'experiencia/2025-aida.md': experiencia({ cargo: 'Consultoría', empresa: 'AIDA', inicio: '2025-03', enCurso: 'no' }),
    'formacion/2021-uchile.md': FORMACION,
    'cine/2023-lider.md': CINE
  };
}
