# Cómo editar la página

Todo lo que se ve en la página sale de la carpeta **`contenido/`**. No hace falta tocar nada más.
Todo se hace desde la web de GitHub: no necesitas instalar nada.

```
contenido/
  general.md      ← tu nombre, cargo, texto "Sobre mí", contacto
  experiencia/    ← un archivo por trabajo
  formacion/      ← un archivo por estudio
  cine/           ← un archivo por proyecto de cine
```

## Reglas de oro

1. **No borres las líneas `---`.** Encierran los datos de arriba del archivo.
2. **Una cosa por línea, siempre así:** `campo: valor` (por ejemplo `empresa: Niñas Pro`).
3. **Las líneas que empiezan con `#` son notas.** No se muestran en la página.
4. **Los archivos que empiezan con `_` no se publican.** Por eso `_EJEMPLO.md` sirve de molde.
5. **Si algo está mal, GitHub te avisa antes de publicar** y te dice qué arreglar. No puedes romper la página.

## Cómo se guarda un cambio (sirve para todas las recetas)

Cuando termines de escribir, al final de la página de edición:

1. Aprieta el botón verde **"Commit changes…"**.
2. Elige **"Create a new branch for this commit and start a pull request"**.
3. Aprieta **"Propose changes"**.
4. En la pantalla siguiente aprieta **"Create pull request"**.
5. Espera 1 o 2 minutos. Abajo aparece la revisión automática:
   - ✅ **verde**: está todo bien. Aprieta **"Merge pull request"** y luego **"Confirm merge"**.
   - ❌ **roja**: hay algo que arreglar. Mira [Si la revisión sale en rojo](#si-la-revisión-sale-en-rojo).
6. Después del merge, la página se actualiza sola en unos 2 minutos en **https://clemgrass.github.io/**.

---

## Agregar un trabajo nuevo

1. Entra a la carpeta **`contenido/experiencia/`** y abre **`_EJEMPLO.md`**.
2. Copia todo su contenido (el ícono de copiar, arriba a la derecha del archivo).
3. Vuelve a la carpeta `experiencia` y aprieta **"Add file" → "Create new file"**.
4. Ponle nombre, por ejemplo `2027-empresa.md` (año + nombre corto, sin espacios, terminado en `.md`).
5. Pega el contenido y cambia los textos. Lee las notas `#`: explican cada campo.
6. Si el trabajo sigue en curso deja `en_curso: sí`. Saldrá como tarjeta grande arriba.
7. Guarda el cambio (ver [Cómo se guarda un cambio](#cómo-se-guarda-un-cambio-sirve-para-todas-las-recetas)).

El orden es automático: lo más nuevo (según `inicio`) sale primero.

## Agregar un estudio o un proyecto de cine

Igual que un trabajo, pero en la carpeta **`contenido/formacion/`** o **`contenido/cine/`**, usando el `_EJEMPLO.md` de esa carpeta.

En formación, el estudio más reciente es el que se muestra en grande.

## Marcar un trabajo como terminado

1. Abre el archivo del trabajo en `contenido/experiencia/`.
2. Aprieta el **lápiz** (✏️ "Edit this file").
3. Cambia `en_curso: sí` por `en_curso: no`.
4. Si quieres, actualiza la fecha (por ejemplo `fecha_es: Abr 2026 — Mar 2027`).
5. Guarda el cambio.

Pasará de las tarjetas grandes a la lista "Misiones completadas".

## Borrar algo

Abre el archivo, aprieta los **tres puntos (…)** arriba a la derecha → **"Delete file"**, y guarda el cambio igual que siempre.

## Cambiar el texto "Sobre mí" o el de contacto

1. Abre **`contenido/general.md`** y aprieta el **lápiz**.
2. El texto "Sobre mí" está debajo de `## Español` y de `## English`.
3. El texto de contacto está debajo de `### Contacto`, dentro de cada idioma.
4. Guarda el cambio.

## Cambiar a títulos neutros (sin estilo videojuego)

En **`contenido/general.md`** cambia `modo_gamer: sí` por `modo_gamer: no`.

| Con `modo_gamer: sí` | Con `modo_gamer: no` |
|---|---|
| Partida en curso | Actualmente |
| Misiones completadas | Experiencia previa |
| Misión secundaria: cine | Cine |
| ¿Guardamos la partida? | Contacto |

## Si la revisión sale en rojo

1. En el pull request, aprieta **"Details"** al lado de la revisión roja (o la pestaña **"Checks"**).
2. Arriba verás **"❌ Hay que arreglar el contenido"** con una lista. Cada línea dice el archivo y qué arreglar, por ejemplo:
   - `experiencia/2027-empresa.md`: 'inicio' debe verse así: 2026-04 (año y mes con dos dígitos)
3. Vuelve a la pestaña **"Files changed"** del pull request, abre ese archivo con los **tres puntos (…) → "Edit file"**, arréglalo y aprieta **"Commit changes"** (queda en el mismo pull request).
4. La revisión corre sola otra vez. Cuando esté ✅ verde, haz el merge.

## Ver la página

- Publicada: **https://clemgrass.github.io/**, unos 2 minutos después de cada merge.
- Para ver el avance de la publicación: pestaña **"Actions"** del repositorio.

---

## Para curiosos: ver la página en tu computador

Necesitas [Node.js](https://nodejs.org) 24 o más nuevo.

```bash
npm install
npm start
```

Abre http://localhost:8080. Cada vez que guardes un archivo de `contenido/`, la página se recarga sola.
Para revisar el contenido sin abrir la página: `npm run validar`.
