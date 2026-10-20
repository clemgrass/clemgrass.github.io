// Lee un archivo de contenido: un bloque de datos "campo: valor" entre líneas ---
// y, debajo, el texto largo bajo "## Español" y "## English".
// No es YAML a propósito: cada línea se parte en el primer ":", así que los
// valores pueden llevar dos puntos, comillas o # sin romper nada.

const TITULO_ES = /^(español|espanol)$/i;
const TITULO_EN = /^(english|inglés|ingles)$/i;
const CLAVE = /^[a-z0-9_]+$/;

function quitarComillas(valor) {
  const primero = valor[0];
  if (valor.length >= 2 && (primero === '"' || primero === "'") && valor.at(-1) === primero) {
    return valor.slice(1, -1);
  }
  return valor;
}

export function parsearArchivo(texto) {
  const lineas = texto.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  const campos = {};
  const cuerpo = { es: null, en: null };
  const problemas = [];

  const inicio = lineas.findIndex(l => l.trim() !== '');
  if (inicio === -1 || lineas[inicio].trim() !== '---') {
    problemas.push({ campo: null, mensaje: 'El archivo debe empezar con una línea que diga solo ---' });
    return { campos, cuerpo, problemas };
  }
  const cierre = lineas.findIndex((l, i) => i > inicio && l.trim() === '---');
  if (cierre === -1) {
    problemas.push({ campo: null, mensaje: 'Falta la línea --- que cierra los datos del principio' });
    return { campos, cuerpo, problemas };
  }

  for (const original of lineas.slice(inicio + 1, cierre)) {
    const linea = original.trim();
    if (linea === '' || linea.startsWith('#')) continue;
    const dosPuntos = linea.indexOf(':');
    const clave = dosPuntos === -1 ? '' : linea.slice(0, dosPuntos).trim().toLowerCase();
    if (!CLAVE.test(clave)) {
      problemas.push({ campo: null, mensaje: `La línea "${linea}" debería verse así: campo: valor` });
      continue;
    }
    if (clave in campos) {
      problemas.push({ campo: clave, mensaje: `El campo '${clave}' aparece dos veces; deja solo uno` });
      continue;
    }
    campos[clave] = quitarComillas(linea.slice(dosPuntos + 1).trim());
  }

  let actual = null; // 'es', 'en', 'otro' o null (antes del primer título)
  const acumulado = { es: [], en: [] };
  let textoSuelto = false;
  for (const linea of lineas.slice(cierre + 1)) {
    const titulo = linea.match(/^##\s+(.*?)\s*$/);
    if (titulo && !linea.startsWith('###')) {
      if (TITULO_ES.test(titulo[1])) actual = 'es';
      else if (TITULO_EN.test(titulo[1])) actual = 'en';
      else {
        actual = 'otro';
        problemas.push({ campo: null, mensaje: `El título "## ${titulo[1]}" no se reconoce: usa "## Español" o "## English"` });
      }
      if (actual !== 'otro') cuerpo[actual] = '';
      continue;
    }
    if (actual === 'es' || actual === 'en') acumulado[actual].push(linea);
    else if (actual === null && linea.trim() !== '') textoSuelto = true;
  }
  if (textoSuelto) {
    problemas.unshift({ campo: null, mensaje: 'Hay texto antes de "## Español" que no se mostrará; muévelo debajo del título correcto' });
  }
  for (const idioma of ['es', 'en']) {
    if (cuerpo[idioma] !== null) cuerpo[idioma] = acumulado[idioma].join('\n').trim();
  }

  return { campos, cuerpo, problemas };
}
