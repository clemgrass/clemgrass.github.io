// Lee la carpeta contenido/, revisa cada archivo contra su esquema y devuelve
// los datos listos para la página, o la lista completa de problemas en español.
import fs from 'node:fs';
import path from 'node:path';
import { parsearArchivo } from './parser.js';
import { ESQUEMAS, camposConocidos } from './esquemas.js';

const CARPETAS = ['experiencia', 'formacion', 'cine'];
const IDIOMAS = [
  { clave: 'es', titulo: '## Español', nombre: 'español' },
  { clave: 'en', titulo: '## English', nombre: 'inglés' }
];

export function formatearError(e) {
  return `${e.archivo} → ${e.mensaje}`;
}

function sinTildes(texto) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function distancia(a, b) {
  const fila = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = fila[0];
    fila[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const arriba = fila[j];
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = arriba;
    }
  }
  return fila[b.length];
}

function sugerir(nombre, conocidos) {
  let mejor = null;
  let mejorDistancia = 3;
  for (const c of conocidos) {
    const d = distancia(nombre, c);
    if (d < mejorDistancia) { mejor = c; mejorDistancia = d; }
  }
  return mejor;
}

const colapsar = texto => texto.replace(/\s+/g, ' ').trim();

// Revisa los campos de un archivo; devuelve { datos } con los valores ya normalizados.
function revisarCampos(campos, esquema, error) {
  const valor = n => (campos[n] ?? '').trim();
  const datos = {};
  for (const campo of esquema.campos) {
    const n = campo.nombre;
    if (campo.soloSi && !campo.soloSi(datos)) { datos[n] = null; continue; }
    const v = valor(n);
    const falta = () => error(n, `Falta '${n}'. Agrega una línea así: ${n}: ...`);
    switch (campo.tipo) {
      case 'bilingue': {
        const es = valor(`${n}_es`);
        const en = valor(`${n}_en`);
        if (v && (es || en)) error(n, `Usa '${n}' o bien '${n}_es' y '${n}_en', pero no ambos`);
        else if (v) datos[n] = { es: v, en: v };
        else if (es && en) datos[n] = { es, en };
        else if (es) error(`${n}_en`, `Falta '${n}_en': agrega la versión en inglés`);
        else if (en) error(`${n}_es`, `Falta '${n}_es': agrega la versión en español`);
        else error(n, `Falta '${n}'. Escribe '${n}: ...' si es igual en ambos idiomas, o '${n}_es: ...' y '${n}_en: ...' si cambia`);
        break;
      }
      case 'inicio':
        if (!v) falta();
        else if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) error(n, `'${n}' debe verse así: 2026-04 (año y mes con dos dígitos)`);
        else datos[n] = v;
        break;
      case 'sino': {
        const s = sinTildes(v);
        if (!v) falta();
        else if (s === 'si' || s === 'no') datos[n] = s === 'si';
        else error(n, `'${n}' debe ser sí o no`);
        break;
      }
      case 'opcion': {
        const s = sinTildes(v);
        if (campo.opciones.includes(s)) datos[n] = s;
        else error(n, `'${n}' debe ser ${campo.opciones.filter(Boolean).join(', ')} o quedar vacío`);
        break;
      }
      case 'email':
        if (!v) falta();
        else if (!v.includes('@')) error(n, `'${n}' no parece un correo`);
        else if (/^mailto:/i.test(v) || /\s/.test(v)) error(n, `'${n}' debe ser solo la dirección, sin 'mailto:' ni espacios (ej. nombre@gmail.com)`);
        else datos[n] = v;
        break;
      case 'url':
        if (!v) falta();
        else if (!v.startsWith('https://')) error(n, `'${n}' debe ser un enlace que empiece con https://`);
        else datos[n] = v;
        break;
      default:
        if (!v) falta();
        else datos[n] = v;
    }
  }

  const conocidos = camposConocidos(esquema);
  for (const clave of Object.keys(campos)) {
    if (conocidos.includes(clave)) continue;
    const parecido = sugerir(clave, conocidos);
    error(clave, `El campo '${clave}' no existe` + (parecido ? `. ¿Quisiste decir '${parecido}'?` : ''));
  }
  return datos;
}

// Revisa el texto bajo "## Español" / "## English".
function revisarCuerpo(cuerpo, modo, error) {
  if (modo === 'no') {
    if (cuerpo.es !== null || cuerpo.en !== null) error(null, 'Los estudios no llevan texto debajo de los datos; bórralo');
    return {};
  }
  const resultado = { texto: {}, contacto: {} };
  for (const { clave, titulo, nombre } of IDIOMAS) {
    const texto = cuerpo[clave];
    if (texto === null) { error(null, `Falta el título "${titulo}" con el texto en ${nombre}`); continue; }
    if (texto === '') { error(null, `El texto debajo de "${titulo}" está vacío`); continue; }
    if (modo === 'si') { resultado.texto[clave] = colapsar(texto); continue; }

    const partes = texto.split(/^###\s+contacto\s*$/im);
    if (partes.length < 2) { error(null, `Falta "### Contacto" dentro de "${titulo}"`); continue; }
    const [antes, despues] = partes.map(colapsar);
    if (!antes) error(null, `El texto debajo de "${titulo}" está vacío`);
    if (!despues) error(null, `El texto debajo de "### Contacto" en "${titulo}" está vacío`);
    resultado.texto[clave] = antes;
    resultado.contacto[clave] = despues;
  }
  return resultado;
}

function ordenar(lista) {
  return lista.sort((a, b) => b.inicio.localeCompare(a.inicio) || (a.archivo < b.archivo ? -1 : a.archivo > b.archivo ? 1 : 0));
}

export function cargarContenido(dir) {
  const errores = [];
  let archivosRevisados = 0;

  function leer(relativo, tipo) {
    archivosRevisados++;
    const antes = errores.length;
    const error = (campo, mensaje) => errores.push({ archivo: relativo, campo, mensaje });
    const { campos, cuerpo, problemas } = parsearArchivo(fs.readFileSync(path.join(dir, relativo), 'utf8'));
    for (const p of problemas) error(p.campo, p.mensaje);
    // Si ni siquiera se pudo leer el bloque de datos, no tiene sentido listar cada campo faltante.
    if (problemas.length && Object.keys(campos).length === 0) return null;
    const datos = revisarCampos(campos, ESQUEMAS[tipo], error);
    const textos = revisarCuerpo(cuerpo, ESQUEMAS[tipo].cuerpo, error);
    return errores.length === antes ? { datos, textos } : null;
  }

  let general = null;
  if (fs.existsSync(path.join(dir, 'general.md'))) {
    const r = leer('general.md', 'general');
    if (r) {
      const d = r.datos;
      general = {
        nombre1: d.nombre_linea_1, nombre2: d.nombre_linea_2, cargo: d.cargo, universidad: d.universidad,
        email: d.email, linkedin: d.linkedin, github: d.github, modoGamer: d.modo_gamer,
        pitch: r.textos.texto, contacto: r.textos.contacto
      };
    }
  } else {
    errores.push({ archivo: 'general.md', campo: null, mensaje: 'No se encontró general.md' });
  }

  // Un archivo creado en la carpeta equivocada no debe desaparecer en silencio.
  for (const nombre of fs.existsSync(dir) ? fs.readdirSync(dir).sort() : []) {
    if (nombre === 'general.md' || CARPETAS.includes(nombre) || nombre.startsWith('_') || nombre.startsWith('.')) continue;
    const esCarpeta = fs.statSync(path.join(dir, nombre)).isDirectory();
    errores.push({ archivo: esCarpeta ? `${nombre}/` : nombre, campo: null,
      mensaje: 'Esto no se usa: los trabajos van en experiencia/, los estudios en formacion/ y el cine en cine/. Muévelo o bórralo' });
  }

  const listas = { experiencia: [], formacion: [], cine: [] };
  for (const carpeta of CARPETAS) {
    const ruta = path.join(dir, carpeta);
    if (!fs.existsSync(ruta)) {
      errores.push({ archivo: `${carpeta}/`, campo: null, mensaje: `No se encontró la carpeta ${carpeta}` });
      continue;
    }
    let encontrados = 0;
    for (const nombre of fs.readdirSync(ruta).sort()) {
      if (nombre.startsWith('_') || nombre.startsWith('.')) continue;
      const relativo = `${carpeta}/${nombre}`;
      if (!/\.md$/i.test(nombre) || !fs.statSync(path.join(ruta, nombre)).isFile()) {
        errores.push({ archivo: relativo, campo: null, mensaje: 'Solo se leen archivos .md; cambia el nombre o bórralo' });
        continue;
      }
      encontrados++;
      const r = leer(relativo, carpeta);
      if (!r) continue;
      const d = r.datos;
      if (carpeta === 'experiencia') {
        listas.experiencia.push({ archivo: relativo, cargo: d.cargo, empresa: d.empresa, fecha: d.fecha,
          inicio: d.inicio, enCurso: d.en_curso, descripcion: r.textos.texto });
      } else if (carpeta === 'formacion') {
        listas.formacion.push({ archivo: relativo, titulo: d.titulo, institucion: d.institucion, fecha: d.fecha,
          inicio: d.inicio, memoriaTipo: d.memoria_tipo, memoria: d.memoria });
      } else {
        listas.cine.push({ archivo: relativo, titulo: d.titulo, fecha: d.fecha, inicio: d.inicio, descripcion: r.textos.texto });
      }
    }
    if (carpeta === 'formacion' && encontrados === 0) {
      errores.push({ archivo: 'formacion/', campo: null, mensaje: 'Debe haber al menos un estudio en formacion/' });
    }
  }

  if (errores.length) return { contenido: null, errores, archivosRevisados };
  return {
    contenido: {
      general,
      experiencia: ordenar(listas.experiencia),
      formacion: ordenar(listas.formacion),
      cine: ordenar(listas.cine)
    },
    errores,
    archivosRevisados
  };
}
