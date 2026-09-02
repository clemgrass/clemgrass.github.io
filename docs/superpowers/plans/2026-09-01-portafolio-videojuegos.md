# Portafolio de videojuegos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un sitio estático que muestre los cinco proyectos de videojuegos de Clemente como fichas cortas con media, rol y un enlace de salida, y donde agregar un juego nuevo sea crear una carpeta.

**Architecture:** Sitio Astro estático. Cada juego es una carpeta bajo `src/content/games/` con un `index.md` cuyo frontmatter valida un schema Zod en tiempo de build. La home renderiza una fila ancha por juego, alternando el lado de la media. No hay nada jugable dentro del sitio: cada ficha enlaza a itch.io o a un sitio externo. Deploy automático a GitHub Pages.

**Tech Stack:** Astro 7, Zod (vía `astro/zod`), CSS propio con custom properties, Vitest para la lógica pura, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-01-portafolio-videojuegos-design.md`

---

## Nota sobre la API de Astro

El spec fue escrito antes de verificar la versión actual de Astro. **Astro 7 cambió la ubicación y la forma de las content collections** respecto a lo que dice el spec:

- El archivo de configuración es `src/content.config.ts`, **no** `src/content/config.ts`.
- Una colección requiere un `loader` explícito: `glob({ pattern, base })` importado de `astro/loaders`.
- `z` se importa de `astro/zod` y es Zod v4: se escribe `z.url()`, **no** `z.string().url()`.
- Para validar imágenes se usa el helper `image()` que Astro pasa al schema cuando el schema es una función: `schema: ({ image }) => z.object({...})`.

Este plan usa la API verificada. Lo demás del spec se mantiene tal cual.

## Nota sobre testing

El spec establece que el sitio no lleva suite de tests unitarios porque no tiene lógica de negocio. Este plan lo respeta y **aplica TDD solo donde hay lógica real que probar**:

- El schema de contenido y sus reglas cruzadas (Tarea 6).
- La verificación de unicidad de `order` (Tarea 6).
- El extractor de enlaces del verificador (Tarea 9).

Los componentes `.astro` no llevan tests unitarios. Su verificación es doble: `npm run build` tiene que pasar, y el usuario revisa el resultado en el navegador. **No inventes tests para archivos `.astro`.**

## Nota sobre el modo de entrega

Requisito explícito del usuario: el sitio se construye en cortes verticales y **cada corte se le muestra corriendo en el navegador antes de seguir**.

El spec define siete cortes; este plan los cubre con cinco paradas de revisión, porque dos de ellos no necesitan una parada propia:

| Corte del spec | Tarea | ¿Parada de revisión? |
|---|---|---|
| 1. Shell | Tarea 2 | Sí |
| 2. Una fila real | Tarea 5 | Sí |
| 3. Modelo de contenido | Tarea 7 | Sí |
| 4. Estados de enlace y placeholders | Tarea 7 | Se revisa junto con el corte 3: las cinco fichas reales ejercitan los tres estados de enlace y el placeholder a la vez |
| 5. Responsive y accesibilidad | Tarea 8 | Sí |
| 6. Deploy | Tarea 10 | Sí |
| 7. Plantilla y documentación | Tarea 11 | No: no tiene salida visual que revisar |

Las tareas marcadas con 🛑 **REVISIÓN** terminan con una parada obligatoria: levantas el preview, le muestras el resultado, y no avanzas a la tarea siguiente hasta que él lo apruebe. Si pide cambios, se aplican dentro de esa misma tarea.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `package.json` | Dependencias y scripts (`dev`, `build`, `test`, `check:links`) |
| `astro.config.mjs` | `site` para GitHub Pages |
| `tsconfig.json` | Config estricta de TypeScript |
| `.claude/launch.json` | Permite levantar el preview para las revisiones |
| `src/styles/global.css` | Tokens de color/tipografía/espaciado y estilos base |
| `src/layouts/Base.astro` | `<html>`, `<head>`, header y footer |
| `src/components/SiteHeader.astro` | Encabezado: nombre y una línea |
| `src/components/SiteFooter.astro` | Links de contacto |
| `src/components/RoleBadge.astro` | Traduce `role` + `teamSize` a un badge |
| `src/components/TagList.astro` | Chips de `engine` + `tech` |
| `src/components/LinkButton.astro` | Botón de salida según `link.kind` |
| `src/components/MediaFrame.astro` | Clip, portada o placeholder |
| `src/components/GameRow.astro` | Compone la fila ancha completa |
| `src/content/schema.ts` | Schema Zod puro y testeable |
| `src/content/order.ts` | Verificación de unicidad de `order` |
| `src/content.config.ts` | Declara la colección `games` |
| `src/content/games/<slug>/index.md` | Un juego |
| `public/games/<slug>/clip.webm` | Clip de un juego |
| `src/pages/index.astro` | La home |
| `scripts/check-links.mjs` | Verificador de enlaces externos |
| `tests/schema.test.ts` | Tests del schema |
| `tests/order.test.ts` | Tests de unicidad de `order` |
| `tests/check-links.test.ts` | Tests del extractor de enlaces |
| `docs/game-template/index.md` | Plantilla para el sexto juego |
| `.github/workflows/deploy.yml` | Build y deploy a GitHub Pages |

**Dónde vive la media, y por qué está dividida:** las portadas van colocadas junto al `index.md` del juego (`src/content/games/<slug>/cover.png`) porque Astro las optimiza y genera versiones responsive — la portada es la imagen más grande de cada fila y es lo que más gana con eso. Los clips van en `public/games/<slug>/clip.webm` porque Astro no procesa video y `public/` es su lugar natural. El schema valida ambas rutas.

---

### Task 1: Scaffold del proyecto

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `.claude/launch.json`
- Create: `src/pages/index.astro`

Se crean los archivos a mano en vez de usar `npm create astro` porque el generador es interactivo y su salida varía entre versiones.

- [ ] **Step 1: Crear `package.json`**

```json
{
  "name": "portafolio-vg",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "check:links": "node scripts/check-links.mjs"
  },
  "dependencies": {
    "astro": "^7.2.10"
  },
  "devDependencies": {
    "vitest": "^4.1.11"
  }
}
```

- [ ] **Step 2: Crear `astro.config.mjs`**

`site` es la URL final del sitio. No lleva `base` porque el repositorio se llamará `clemgrass.github.io` y el sitio queda en la raíz del dominio.

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://clemgrass.github.io',
});
```

- [ ] **Step 3: Crear `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "allowJs": true
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

`allowJs` es necesario porque `tests/check-links.test.ts` importa `scripts/check-links.mjs`, que es JavaScript.

- [ ] **Step 4: Crear `.claude/launch.json`**

Esto permite levantar el sitio para las revisiones visuales de cada corte.

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "portafolio",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 4321
    }
  ]
}
```

- [ ] **Step 5: Crear una home mínima en `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Clemente Grass</title>
  </head>
  <body>
    <h1>Portfolio scaffold</h1>
  </body>
</html>
```

- [ ] **Step 6: Instalar dependencias**

Ejecutar: `npm install`
Esperado: termina sin errores y crea `node_modules/` y `package-lock.json`.

- [ ] **Step 7: Verificar que el build funciona**

Ejecutar: `npm run build`
Esperado: termina con `Complete!` y crea `dist/index.html`.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .claude/launch.json src/pages/index.astro
git commit -m "chore: scaffold Astro project"
```

---

### Task 2: Tokens de diseño, layout base, header y footer 🛑 **REVISIÓN — corte 1 del spec**

**Files:**
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`

Este corte define el tono visual del sitio entero. Los colores y la tipografía son exactamente lo que el usuario tiene que aprobar acá — todo lo demás se construye encima.

- [ ] **Step 1: Crear `src/styles/global.css`**

Tema oscuro por defecto (es lo natural para un portafolio de gamedev) con override a claro. Todos los colores son custom properties para que cambiarlos en la revisión sea tocar un solo bloque.

```css
:root {
  --bg: #0d0e11;
  --surface: #15171c;
  --border: #262a33;
  --text: #e9ebef;
  --text-dim: #969ca8;
  --accent: #ff5c39;
  --accent-text: #ffffff;

  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-12: 3rem;
  --space-16: 4rem;

  --radius: 10px;
  --measure: 1120px;
}

@media (prefers-color-scheme: light) {
  :root {
    --bg: #fbfbfc;
    --surface: #ffffff;
    --border: #e2e4e9;
    --text: #14161a;
    --text-dim: #5f6673;
    --accent: #d63e1c;
    --accent-text: #ffffff;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

a {
  color: inherit;
}

img,
video {
  max-width: 100%;
  display: block;
}

.wrap {
  max-width: var(--measure);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}
```

- [ ] **Step 2: Crear `src/components/SiteHeader.astro`**

```astro
---
---
<header class="site-header">
  <div class="wrap">
    <h1 class="name">Clemente Grass</h1>
    <p class="tagline">Computer Engineer — Universidad de Chile. I build games.</p>
  </div>
</header>

<style>
  .site-header {
    padding: var(--space-16) 0 var(--space-12);
  }
  .name {
    font-size: clamp(1.9rem, 5vw, 2.6rem);
    line-height: 1.1;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.02em;
  }
  .tagline {
    margin: 0;
    color: var(--text-dim);
    font-size: 1.05rem;
  }
</style>
```

- [ ] **Step 3: Crear `src/components/SiteFooter.astro`**

```astro
---
const links = [
  { label: 'GitHub', href: 'https://github.com/clemgrass' },
  { label: 'Email', href: 'mailto:lementegrass@gmail.com' },
];
---
<footer class="site-footer">
  <div class="wrap">
    <ul class="links">
      {links.map((l) => (
        <li><a href={l.href}>{l.label}</a></li>
      ))}
    </ul>
  </div>
</footer>

<style>
  .site-footer {
    padding: var(--space-12) 0 var(--space-16);
    border-top: 1px solid var(--border);
    margin-top: var(--space-16);
  }
  .links {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    gap: var(--space-6);
    font-size: 0.9rem;
    color: var(--text-dim);
  }
  .links a {
    text-decoration: none;
    border-bottom: 1px solid var(--border);
    padding-bottom: 2px;
  }
  .links a:hover {
    border-bottom-color: var(--accent);
  }
</style>
```

Nota para la revisión: los links de LinkedIn e itch.io se agregan cuando el usuario los aporte. Por ahora van solo los dos que están confirmados.

- [ ] **Step 4: Crear `src/layouts/Base.astro`**

```astro
---
import '../styles/global.css';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={Astro.url.href} />
  </head>
  <body>
    <SiteHeader />
    <main class="wrap">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

- [ ] **Step 5: Usar el layout en `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Clemente Grass — Games"
  description="Games and game systems built by Clemente Grass, computer engineer."
>
  <p>Rows go here.</p>
</Base>
```

- [ ] **Step 6: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`, sin errores de TypeScript.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro src/components/SiteHeader.astro src/components/SiteFooter.astro src/pages/index.astro
git commit -m "feat: add design tokens, base layout, header and footer"
```

- [ ] **Step 8: 🛑 REVISIÓN con el usuario**

Levantar el preview con la configuración `portafolio` de `.claude/launch.json` y mostrarle el resultado.

Preguntarle específicamente: ¿el tono visual va bien? ¿el naranjo de acento funciona o prefiere otro? ¿la línea de presentación dice lo que quiere que diga? ¿qué links van en el pie?

**No avanzar a la Tarea 3 sin su aprobación.** Si pide cambios, aplicarlos, volver a mostrar, y recién ahí seguir.

---

### Task 3: RoleBadge, TagList y LinkButton

**Files:**
- Create: `src/components/RoleBadge.astro`
- Create: `src/components/TagList.astro`
- Create: `src/components/LinkButton.astro`

Los tres componentes chicos de la fila. Son presentacionales puros: reciben props y devuelven markup, sin leer nada del exterior.

- [ ] **Step 1: Crear `src/components/RoleBadge.astro`**

Este badge existe porque tres de los cinco proyectos son colaborativos o de consultoría, y un lector que no puede distinguir qué escribió Clemente descuenta el proyecto entero.

```astro
---
interface Props {
  role: 'solo' | 'pair' | 'team' | 'consultant';
  teamSize?: number;
}

const { role, teamSize } = Astro.props;

const staticLabels = {
  solo: 'Solo',
  pair: 'Pair',
  consultant: 'Consultant',
} as const;

const label = role === 'team' ? `Team of ${teamSize}` : staticLabels[role];
---
<span class="role">{label}</span>

<style>
  .role {
    display: inline-block;
    background: var(--accent);
    color: var(--accent-text);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 0.15rem var(--space-3);
    border-radius: 999px;
  }
</style>
```

- [ ] **Step 2: Crear `src/components/TagList.astro`**

`engine` va primero y se filtra de `tech` para que no salga duplicado si alguien lo escribió en las dos partes.

```astro
---
interface Props {
  engine: string;
  tech: string[];
}

const { engine, tech } = Astro.props;
const all = [engine, ...tech.filter((t) => t !== engine)];
---
<ul class="tags">
  {all.map((t) => <li class="tag">{t}</li>)}
</ul>

<style>
  .tags {
    list-style: none;
    margin: 0 0 var(--space-4);
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .tag {
    font-size: 0.72rem;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: 5px;
    padding: 0.1rem var(--space-2);
  }
</style>
```

- [ ] **Step 3: Crear `src/components/LinkButton.astro`**

Tres estados. `none` renderiza un `<span>` y no un `<a>`, porque un enlace sin destino no debe ser enfocable ni clickeable.

```astro
---
interface Props {
  kind: 'itch' | 'external' | 'none';
  url: string | null;
  label: string | null;
}

const { kind, url, label } = Astro.props;

const text =
  kind === 'itch' ? 'Get it on itch.io' : kind === 'external' ? label : 'Build coming soon';
---
{
  kind === 'none' ? (
    <span class="btn btn--off">{text}</span>
  ) : (
    <a class="btn" href={url} target="_blank" rel="noopener noreferrer">
      {text} <span aria-hidden="true">↗</span>
      <span class="sr-only">(opens in a new tab)</span>
    </a>
  )
}

<style>
  .btn {
    display: inline-block;
    background: var(--accent);
    color: var(--accent-text);
    font-size: 0.88rem;
    font-weight: 600;
    padding: var(--space-2) var(--space-4);
    border-radius: 7px;
    text-decoration: none;
  }
  .btn:hover {
    filter: brightness(1.1);
  }
  .btn--off {
    background: transparent;
    color: var(--text-dim);
    border: 1px dashed var(--border);
    font-weight: 500;
    cursor: default;
  }
</style>
```

- [ ] **Step 4: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`. Los componentes todavía no se usan en ninguna página; esto solo confirma que compilan.

- [ ] **Step 5: Commit**

```bash
git add src/components/RoleBadge.astro src/components/TagList.astro src/components/LinkButton.astro
git commit -m "feat: add role badge, tag list and link button components"
```

---

### Task 4: MediaFrame

**Files:**
- Create: `src/components/MediaFrame.astro`

Decide qué mostrar en este orden: clip si existe, portada si no, placeholder si no hay nada. **El placeholder es parte del diseño, no un estado de error** — es lo que permite publicar el sitio antes de tener media.

- [ ] **Step 1: Crear `src/components/MediaFrame.astro`**

```astro
---
import type { ImageMetadata } from 'astro';
import { Image } from 'astro:assets';

interface Props {
  title: string;
  engine: string;
  cover?: ImageMetadata;
  clip: string | null;
}

const { title, engine, cover, clip } = Astro.props;
---
{
  clip ? (
    <video
      class="media"
      data-play-on-view
      muted
      loop
      playsinline
      preload="metadata"
      poster={cover?.src}
      aria-label={`Gameplay clip of ${title}`}
    >
      <source src={clip} type="video/webm" />
    </video>
  ) : cover ? (
    <Image
      class="media"
      src={cover}
      alt={`Screenshot of ${title}`}
      widths={[480, 800, 1200]}
      sizes="(max-width: 800px) 100vw, 55vw"
    />
  ) : (
    <div class="media media--empty" role="img" aria-label={`No media available yet for ${title}`}>
      <span class="empty-title">{title}</span>
      <span class="empty-engine">{engine}</span>
    </div>
  )
}

<style>
  .media {
    width: 100%;
    aspect-ratio: 16 / 10;
    object-fit: cover;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: var(--surface);
  }
  .media--empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    background:
      repeating-linear-gradient(
        45deg,
        transparent 0 12px,
        color-mix(in srgb, var(--border) 45%, transparent) 12px 13px
      ),
      var(--surface);
  }
  .empty-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .empty-engine {
    font-size: 0.78rem;
    color: var(--text-dim);
  }
</style>

<script>
  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-play-on-view]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (videos.length > 0 && !prefersReducedMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            video.play().catch(() => {
              /* autoplay blocked by the browser; the poster stays visible */
            });
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.25 }
    );

    videos.forEach((video) => observer.observe(video));
  }
</script>
```

Este `<script>` es el único JavaScript de cliente del sitio. Astro lo agrupa una sola vez aunque el componente se use cinco veces. Si el usuario tiene `prefers-reduced-motion` activo, los clips nunca se reproducen y queda visible el póster, que es lo que pide el spec.

- [ ] **Step 2: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`.

- [ ] **Step 3: Commit**

```bash
git add src/components/MediaFrame.astro
git commit -m "feat: add media frame with clip, cover and placeholder states"
```

---

### Task 5: GameRow y la home con un juego 🛑 **REVISIÓN — corte 2 del spec**

**Files:**
- Create: `src/components/GameRow.astro`
- Modify: `src/pages/index.astro`

La fila es el componente que define el sitio entero. Se construye con datos escritos a mano para poder mostrarlo rápido; la Tarea 7 reemplaza esos datos por la colección **sin tocar `GameRow`**.

- [ ] **Step 1: Crear `src/components/GameRow.astro`**

```astro
---
import type { ImageMetadata } from 'astro';
import MediaFrame from './MediaFrame.astro';
import RoleBadge from './RoleBadge.astro';
import TagList from './TagList.astro';
import LinkButton from './LinkButton.astro';

interface Props {
  title: string;
  year: number;
  context: string;
  role: 'solo' | 'pair' | 'team' | 'consultant';
  teamSize?: number;
  contribution: string;
  engine: string;
  tech: string[];
  link: { kind: 'itch' | 'external' | 'none'; url: string | null; label: string | null };
  cover?: ImageMetadata;
  clip: string | null;
  flipped: boolean;
}

const {
  title,
  year,
  context,
  role,
  teamSize,
  contribution,
  engine,
  tech,
  link,
  cover,
  clip,
  flipped,
} = Astro.props;
---
<article class:list={['row', { 'row--flipped': flipped }]}>
  <div class="row-media">
    <MediaFrame title={title} engine={engine} cover={cover} clip={clip} />
  </div>
  <div class="row-info">
    <h2 class="row-title">{title}</h2>
    <div class="row-meta">
      <RoleBadge role={role} teamSize={teamSize} />
      <span class="meta-item">{context}</span>
      <span class="meta-item">{year}</span>
    </div>
    <p class="row-contribution">{contribution}</p>
    <TagList engine={engine} tech={tech} />
    <LinkButton kind={link.kind} url={link.url} label={link.label} />
  </div>
</article>

<style>
  .row {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: var(--space-8);
    align-items: center;
    padding: var(--space-8) 0;
    border-bottom: 1px solid var(--border);
  }
  .row:last-child {
    border-bottom: 0;
  }
  .row--flipped .row-media {
    order: 2;
  }
  .row-title {
    font-size: clamp(1.4rem, 3vw, 1.9rem);
    line-height: 1.15;
    margin: 0 0 var(--space-2);
    letter-spacing: -0.015em;
  }
  .row-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }
  .meta-item {
    font-size: 0.75rem;
    color: var(--text-dim);
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 0.15rem var(--space-3);
  }
  .row-contribution {
    margin: 0 0 var(--space-4);
    color: var(--text);
    max-width: 46ch;
  }
</style>
```

- [ ] **Step 2: Renderizar una fila en `src/pages/index.astro`**

Los datos de Memoria Khachkar son los verificados leyendo el repositorio. `clip` va en `null` a propósito: así la revisión muestra el placeholder, que es el estado real en que va a nacer el sitio.

```astro
---
import Base from '../layouts/Base.astro';
import GameRow from '../components/GameRow.astro';
---
<Base
  title="Clemente Grass — Games"
  description="Games and game systems built by Clemente Grass, computer engineer."
>
  <GameRow
    title="Memoria Khachkar"
    year={2026}
    context="Thesis · Universidad de Chile"
    role="solo"
    contribution="Sole author: design, programming and technical art. Built as my computer engineering thesis project."
    engine="Godot 4.6"
    tech={['GDScript', 'GL Compatibility']}
    link={{ kind: 'none', url: null, label: null }}
    clip={null}
    flipped={false}
  />
</Base>
```

- [ ] **Step 3: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameRow.astro src/pages/index.astro
git commit -m "feat: add game row component and render one game"
```

- [ ] **Step 5: 🛑 REVISIÓN con el usuario**

Levantar el preview y mostrarle la fila.

Preguntarle: ¿la fila comunica lo que tiene que comunicar en treinta segundos? ¿el badge de rol se lee bien? ¿la proporción entre media e información es la correcta? ¿falta o sobra algún dato?

**No avanzar a la Tarea 6 sin su aprobación.**

---

### Task 6: Schema de contenido con tests

**Files:**
- Create: `src/content/schema.ts`
- Create: `src/content/order.ts`
- Create: `src/content.config.ts`
- Create: `tests/schema.test.ts`
- Create: `tests/order.test.ts`
- Create: `vitest.config.ts`

Acá sí hay lógica real: reglas cruzadas entre campos. Se hace con TDD.

El schema se define en `src/content/schema.ts` como una función y no directamente en `src/content.config.ts` por una razón concreta: `content.config.ts` importa de `astro:content`, un módulo virtual que solo existe dentro del build de Astro y que Vitest no puede resolver. Al separarlo, los tests importan el schema puro.

- [ ] **Step 1: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 2: Escribir los tests del schema que fallan**

Crear `tests/schema.test.ts`. El helper `valid()` devuelve una entrada válida mínima y cada test la rompe de una forma distinta, para que quede claro qué regla se está probando.

```ts
import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { makeGameSchema } from '../src/content/schema';

// `image()` only exists inside Astro's build. A string stub is enough here:
// the tests never assert on image processing, only on the cross-field rules.
const schema = makeGameSchema({
  image: () => z.string(),
  fileExists: (path: string) => path === '/games/sonar/clip.webm',
});

function valid(overrides: Record<string, unknown> = {}) {
  return {
    title: 'SONAR',
    year: 2026,
    status: 'in-development',
    role: 'solo',
    contribution: 'Built the whole thing.',
    context: 'Personal project',
    engine: 'Godot 4',
    tech: ['C#'],
    link: { kind: 'none', url: null, label: null },
    media: { clip: null },
    order: 1,
    ...overrides,
  };
}

describe('game schema', () => {
  it('accepts a minimal valid entry', () => {
    expect(schema.safeParse(valid()).success).toBe(true);
  });

  it('rejects a status outside the enum', () => {
    const result = schema.safeParse(valid({ status: 'abandoned' }));
    expect(result.success).toBe(false);
  });

  it('requires a url when the link kind is itch', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'itch', url: null, label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts an itch link that has a url', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'itch', url: 'https://clemgrass.itch.io/sonar', label: null } })
    );
    expect(result.success).toBe(true);
  });

  it('rejects a url when the link kind is none', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'none', url: 'https://example.com', label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('requires a label when the link kind is external', () => {
    const result = schema.safeParse(
      valid({ link: { kind: 'external', url: 'https://farolazo.com', label: null } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts an external link that has a label', () => {
    const result = schema.safeParse(
      valid({
        link: { kind: 'external', url: 'https://farolazo.com', label: 'Visit farolazo.com' },
      })
    );
    expect(result.success).toBe(true);
  });

  it('requires teamSize of at least 2 when the role is team', () => {
    const result = schema.safeParse(valid({ role: 'team' }));
    expect(result.success).toBe(false);
  });

  it('accepts a team role with a teamSize', () => {
    const result = schema.safeParse(valid({ role: 'team', teamSize: 4 }));
    expect(result.success).toBe(true);
  });

  it('rejects a clip that does not exist on disk', () => {
    const result = schema.safeParse(
      valid({ media: { clip: '/games/ghost/clip.webm' } })
    );
    expect(result.success).toBe(false);
  });

  it('accepts a clip that exists on disk', () => {
    const result = schema.safeParse(
      valid({ media: { clip: '/games/sonar/clip.webm' } })
    );
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 3: Correr los tests para verificar que fallan**

Ejecutar: `npm test`
Esperado: FAIL con `Failed to resolve import "../src/content/schema"` — el archivo todavía no existe.

- [ ] **Step 4: Escribir `src/content/schema.ts`**

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';

export const STATUSES = [
  'prototype',
  'in-development',
  'demo',
  'released',
  'thesis',
] as const;

export const ROLES = ['solo', 'pair', 'team', 'consultant'] as const;

export const LINK_KINDS = ['itch', 'external', 'none'] as const;

/** Clips live in `public/`, so their frontmatter path is a site-absolute URL. */
export function publicFileExists(path: string): boolean {
  return existsSync(join(process.cwd(), 'public', path.replace(/^\//, '')));
}

interface SchemaDeps {
  image: () => z.ZodTypeAny;
  fileExists?: (path: string) => boolean;
}

export function makeGameSchema({ image, fileExists = publicFileExists }: SchemaDeps) {
  return z
    .object({
      title: z.string().min(1),
      year: z.number().int().min(2000).max(2100),
      status: z.enum(STATUSES),
      role: z.enum(ROLES),
      contribution: z.string().min(1),
      teamSize: z.number().int().min(1).optional(),
      context: z.string().min(1),
      engine: z.string().min(1),
      tech: z.array(z.string()).min(1),
      link: z.object({
        kind: z.enum(LINK_KINDS),
        url: z.url().nullable().default(null),
        label: z.string().nullable().default(null),
      }),
      media: z
        .object({
          cover: image().optional(),
          clip: z.string().nullable().default(null),
        })
        .default({ clip: null }),
      featured: z.boolean().default(false),
      order: z.number().int().min(1),
      detail: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.link.kind !== 'none' && !data.link.url) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'url'],
          message: `link.url is required when link.kind is "${data.link.kind}"`,
        });
      }

      if (data.link.kind === 'none' && data.link.url) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'url'],
          message: 'link.url must be null when link.kind is "none"',
        });
      }

      if (data.link.kind === 'external' && !data.link.label) {
        ctx.addIssue({
          code: 'custom',
          path: ['link', 'label'],
          message:
            'link.label is required for external links so the button can name the destination',
        });
      }

      if ((data.role === 'team' || data.role === 'pair') && (data.teamSize ?? 0) < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['teamSize'],
          message: `teamSize of at least 2 is required when role is "${data.role}"`,
        });
      }

      if (data.media.clip && !fileExists(data.media.clip)) {
        ctx.addIssue({
          code: 'custom',
          path: ['media', 'clip'],
          message: `clip file not found in public/: ${data.media.clip}`,
        });
      }
    });
}
```

- [ ] **Step 5: Correr los tests para verificar que pasan**

Ejecutar: `npm test`
Esperado: los 11 tests de `tests/schema.test.ts` en PASS.

- [ ] **Step 6: Escribir el test de unicidad de `order` que falla**

Crear `tests/order.test.ts`. La unicidad no se puede validar en un schema por entrada porque una entrada no ve a las demás, así que va aparte.

```ts
import { describe, expect, it } from 'vitest';
import { assertUniqueOrder } from '../src/content/order';

describe('assertUniqueOrder', () => {
  it('passes when every order value is unique', () => {
    expect(() =>
      assertUniqueOrder([
        { id: 'sonar', order: 1 },
        { id: 'farolazo', order: 2 },
      ])
    ).not.toThrow();
  });

  it('throws naming both entries that collide', () => {
    expect(() =>
      assertUniqueOrder([
        { id: 'sonar', order: 1 },
        { id: 'farolazo', order: 1 },
      ])
    ).toThrow(/sonar.*farolazo|farolazo.*sonar/);
  });
});
```

- [ ] **Step 7: Correr el test para verificar que falla**

Ejecutar: `npm test`
Esperado: FAIL con `Failed to resolve import "../src/content/order"`.

- [ ] **Step 8: Escribir `src/content/order.ts`**

```ts
export interface Orderable {
  id: string;
  order: number;
}

/** Throws at build time if two games claim the same position on the page. */
export function assertUniqueOrder(entries: Orderable[]): void {
  const seen = new Map<number, string>();

  for (const entry of entries) {
    const previous = seen.get(entry.order);
    if (previous !== undefined) {
      throw new Error(
        `Duplicate order ${entry.order}: "${previous}" and "${entry.id}" both claim it.`
      );
    }
    seen.set(entry.order, entry.id);
  }
}
```

- [ ] **Step 9: Correr los tests para verificar que pasan**

Ejecutar: `npm test`
Esperado: 13 tests en PASS.

- [ ] **Step 10: Crear `src/content.config.ts`**

`generateId` convierte `sonar/index.md` en el id `sonar`. Sin él los ids quedarían como `sonar/index`.

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { makeGameSchema } from './content/schema';

const games = defineCollection({
  loader: glob({
    pattern: '*/index.md',
    base: './src/content/games',
    generateId: ({ entry }) => entry.replace(/\/index\.md$/, ''),
  }),
  schema: ({ image }) => makeGameSchema({ image }),
});

export const collections = { games };
```

- [ ] **Step 11: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`. La colección está vacía todavía, lo que es válido.

- [ ] **Step 12: Commit**

```bash
git add vitest.config.ts src/content/schema.ts src/content/order.ts src/content.config.ts tests/schema.test.ts tests/order.test.ts package.json
git commit -m "feat: add validated game content schema with tests"
```

---

### Task 7: Los cinco juegos y la home desde la colección 🛑 **REVISIÓN — cortes 3 y 4 del spec**

**Files:**
- Create: `src/content/games/sonar/index.md`
- Create: `src/content/games/memoria-khachkar/index.md`
- Create: `src/content/games/farolazo/index.md`
- Create: `src/content/games/hot-potato/index.md`
- Create: `src/content/games/where-the-cheesecake-go/index.md`
- Modify: `src/pages/index.astro`

Los datos de motor, lenguaje, visibilidad y rol están verificados leyendo los repositorios el 2026-09-01. **Los años y algunas frases de `contribution` son provisorios** y el usuario los corrige en la revisión de esta misma tarea — están marcados con el comentario `# CONFIRMAR` para que sea imposible que pasen inadvertidos.

- [ ] **Step 1: Crear `src/content/games/sonar/index.md`**

```markdown
---
title: SONAR
year: 2026
status: in-development
role: solo
contribution: >
  Sole author. Built the sonar simulation, the enemy AI and the autopilot
  system, with the game logic split into testable C# libraries separate from
  the engine layer.
context: Personal project
engine: Godot 4
tech: [C#, .NET, xUnit]
link:
  kind: none
  url: null
  label: null
media:
  clip: null
featured: true
order: 1
---
```

- [ ] **Step 2: Crear `src/content/games/memoria-khachkar/index.md`**

```markdown
---
title: Memoria Khachkar
year: 2026 # CONFIRMAR con el autor
status: thesis
role: solo
contribution: >
  Sole author: design, programming and technical art. Built as my computer
  engineering thesis at Universidad de Chile.
context: Thesis · Universidad de Chile
engine: Godot 4.6
tech: [GDScript, GL Compatibility]
link:
  kind: none
  url: null
  label: null
media:
  clip: null
featured: true
order: 2
---
```

- [ ] **Step 3: Crear `src/content/games/farolazo/index.md`**

```markdown
---
title: Farolazo
year: 2026 # CONFIRMAR con el autor
status: released
role: consultant
contribution: >
  Joined as a consultant. Set up the initial scaffolding and made the
  architectural decisions, and designed the card selection algorithm that
  drives the game.
context: Consulting work
engine: Web
tech: [TypeScript, PostgreSQL]
link:
  kind: external
  url: https://farolazo.com
  label: Visit farolazo.com
media:
  clip: null
featured: true
order: 3
---
```

- [ ] **Step 4: Crear `src/content/games/hot-potato/index.md`**

```markdown
---
title: Hot Potato
year: 2026 # CONFIRMAR con el autor
status: prototype
role: team
teamSize: 4 # CONFIRMAR con el autor
contribution: >
  PROVISIONAL — el autor tiene que escribir qué hizo él dentro del equipo.
context: University course · multiplayer game development
engine: Godot 4.2
tech: [GDScript, ENet]
link:
  kind: none
  url: null
  label: null
media:
  clip: null
featured: false
order: 4
---
```

- [ ] **Step 5: Crear `src/content/games/where-the-cheesecake-go/index.md`**

```markdown
---
title: Where The Cheesecakes Go
year: 2026 # CONFIRMAR con el autor
status: prototype
role: pair
teamSize: 2
contribution: >
  PROVISIONAL — el autor tiene que escribir qué hizo él dentro de la pareja.
context: University course · singleplayer game development
engine: Godot 3
tech: [GDScript, Lua]
link:
  kind: none
  url: null
  label: null
media:
  clip: null
featured: false
order: 5
---
```

- [ ] **Step 6: Reescribir `src/pages/index.astro` para leer la colección**

`GameRow` no cambia: recibe exactamente las mismas props que en la Tarea 5, ahora desde la colección.

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import GameRow from '../components/GameRow.astro';
import { assertUniqueOrder } from '../content/order';

const games = await getCollection('games');

assertUniqueOrder(games.map((g) => ({ id: g.id, order: g.data.order })));

const ordered = games.sort((a, b) => a.data.order - b.data.order);
---
<Base
  title="Clemente Grass — Games"
  description="Games and game systems built by Clemente Grass, computer engineer."
>
  {
    ordered.map((game, index) => (
      <GameRow
        title={game.data.title}
        year={game.data.year}
        context={game.data.context}
        role={game.data.role}
        teamSize={game.data.teamSize}
        contribution={game.data.contribution}
        engine={game.data.engine}
        tech={game.data.tech}
        link={game.data.link}
        cover={game.data.media.cover}
        clip={game.data.media.clip}
        flipped={index % 2 === 1}
      />
    ))
  }
</Base>
```

- [ ] **Step 7: Verificar que el build pasa con los cinco juegos**

Ejecutar: `npm run build`
Esperado: `Complete!` y `dist/index.html` con las cinco filas.

- [ ] **Step 8: Commit**

```bash
git add src/content/games src/pages/index.astro
git commit -m "feat: add the five game entries and render the home from the collection"
```

- [ ] **Step 9: Verificar que el schema realmente atrapa un error**

Esta comprobación existe porque una validación que nunca se prueba en la práctica es una validación que puede estar rota sin que nadie se entere. Va después del commit porque revierte con `git checkout`, que necesita el archivo ya versionado.

Editar `src/content/games/sonar/index.md` y cambiar `status: in-development` por `status: abandoned`.

Ejecutar: `npm run build`
Esperado: FAIL, con un mensaje que menciona `status` y el archivo `sonar`.

Revertir el cambio: `git checkout src/content/games/sonar/index.md`

Ejecutar: `npm run build`
Esperado: `Complete!`.

- [ ] **Step 10: 🛑 REVISIÓN con el usuario**

Levantar el preview y mostrarle las cinco filas.

Esta revisión tiene una parte obligatoria de datos, no solo visual. Preguntarle explícitamente, campo por campo:

1. El **año** real de cada uno de los cinco proyectos (los marcados `# CONFIRMAR` están puestos como relleno).
2. **Qué hizo él** en Hot Potato y en Where The Cheesecakes Go — nadie más puede escribir esas dos frases.
3. El **tamaño del equipo** de Hot Potato.
4. Si las frases de SONAR, Memoria Khachkar y Farolazo describen bien su trabajo.
5. Si el **orden** de las cinco filas es el que quiere: el primero es el que más se ve.

Aplicar sus correcciones a los `.md`, quitar todos los comentarios `# CONFIRMAR` y las frases `PROVISIONAL`, volver a correr el build, commitear.

**No avanzar a la Tarea 8 sin su aprobación.**

---

### Task 8: Responsive y accesibilidad 🛑 **REVISIÓN — corte 5 del spec**

**Files:**
- Modify: `src/components/GameRow.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Colapsar las filas a una columna en pantallas angostas**

Agregar al bloque `<style>` de `src/components/GameRow.astro`, al final:

```css
  @media (max-width: 800px) {
    .row {
      grid-template-columns: 1fr;
      gap: var(--space-4);
      padding: var(--space-6) 0;
    }
    /* On one column the media always goes first: alternating sides only
       makes sense when there are two columns to alternate between. */
    .row--flipped .row-media {
      order: 0;
    }
    .row-contribution {
      max-width: none;
    }
  }
```

- [ ] **Step 2: Respetar `prefers-reduced-motion` en las transiciones**

Agregar al final de `src/styles/global.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

El pausado de los clips bajo `prefers-reduced-motion` ya quedó resuelto en el script de `MediaFrame.astro` en la Tarea 4.

- [ ] **Step 3: Verificar el build**

Ejecutar: `npm run build`
Esperado: `Complete!`.

- [ ] **Step 4: Commit**

```bash
git add src/components/GameRow.astro src/styles/global.css
git commit -m "feat: collapse rows on narrow screens and honour reduced motion"
```

- [ ] **Step 5: 🛑 REVISIÓN con el usuario**

Levantar el preview y revisar tres cosas concretas:

1. Redimensionar el viewport a 375px de ancho: las filas tienen que quedar en una columna, con la media arriba, y no debe haber scroll horizontal.
2. Navegar la página entera con Tab: cada botón de salida tiene que recibir un anillo de foco visible, y los botones `Build coming soon` **no** deben ser enfocables.
3. Cambiar el tema del sistema a claro y confirmar que el sitio sigue legible.

**No avanzar a la Tarea 9 sin su aprobación.**

---

### Task 9: Verificador de enlaces externos

**Files:**
- Create: `scripts/check-links.mjs`
- Create: `tests/check-links.test.ts`

Corre a mano antes de publicar (`npm run check:links`), **no en CI**: un servicio externo caído no debe romper el deploy. Trabaja sobre `dist/`, así verifica lo que efectivamente se publica.

- [ ] **Step 1: Escribir el test que falla**

Crear `tests/check-links.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { extractExternalLinks } from '../scripts/check-links.mjs';

describe('extractExternalLinks', () => {
  it('finds http and https hrefs', () => {
    const html = `<a href="https://farolazo.com">a</a><a href="http://example.org">b</a>`;
    expect(extractExternalLinks(html)).toEqual([
      'https://farolazo.com',
      'http://example.org',
    ]);
  });

  it('ignores relative and mailto hrefs', () => {
    const html = `<a href="/about">a</a><a href="mailto:x@y.com">b</a>`;
    expect(extractExternalLinks(html)).toEqual([]);
  });

  it('deduplicates repeated hrefs', () => {
    const html = `<a href="https://a.com">1</a><a href="https://a.com">2</a>`;
    expect(extractExternalLinks(html)).toEqual(['https://a.com']);
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Ejecutar: `npm test`
Esperado: FAIL con `Failed to resolve import "../scripts/check-links.mjs"`.

- [ ] **Step 3: Escribir `scripts/check-links.mjs`**

```js
import { readFile } from 'node:fs/promises';

const HREF = /href="(https?:\/\/[^"]+)"/g;

export function extractExternalLinks(html) {
  return [...new Set([...html.matchAll(HREF)].map((match) => match[1]))];
}

async function main() {
  let html;
  try {
    html = await readFile('dist/index.html', 'utf8');
  } catch {
    console.error('dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }

  const links = extractExternalLinks(html);
  if (links.length === 0) {
    console.log('No external links to check.');
    return;
  }

  let failed = 0;

  for (const url of links) {
    try {
      const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      if (response.ok) {
        console.log(`  ok   ${response.status}  ${url}`);
      } else {
        console.log(`  FAIL ${response.status}  ${url}`);
        failed += 1;
      }
    } catch (error) {
      console.log(`  FAIL  ---  ${url}  (${error.message})`);
      failed += 1;
    }
  }

  if (failed > 0) {
    console.error(`\n${failed} link(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${links.length} link(s) ok.`);
}

// Only run the checker when invoked directly, so importing it in tests is safe.
if (import.meta.filename === process.argv[1]) {
  await main();
}
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Ejecutar: `npm test`
Esperado: 16 tests en PASS.

- [ ] **Step 5: Correr el verificador de verdad**

Ejecutar: `npm run build && npm run check:links`
Esperado: reporta `ok 200 https://farolazo.com` y `ok` para los links del footer, y termina con `All N link(s) ok.`

- [ ] **Step 6: Commit**

```bash
git add scripts/check-links.mjs tests/check-links.test.ts
git commit -m "feat: add external link checker"
```

---

### Task 10: Deploy a GitHub Pages 🛑 **REVISIÓN — corte 6 del spec**

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Crear `.github/workflows/deploy.yml`**

Versiones de las actions verificadas contra la documentación oficial de Astro.

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v7
      - name: Install, build and upload the site
        uses: withastro/action@v6

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: deploy to GitHub Pages on push to main"
```

- [ ] **Step 3: 🛑 CONFIRMAR con el usuario antes de crear nada público**

Crear el repositorio publica el sitio en internet bajo su nombre. **Preguntar antes de ejecutar el paso siguiente**, y confirmar dos cosas:

1. Que el repositorio se llame `clemgrass.github.io` (necesario para que el sitio quede en la raíz del dominio; con cualquier otro nombre hay que agregar `base` en `astro.config.mjs`).
2. Que esté de acuerdo con que sea público — GitHub Pages en cuentas gratuitas requiere repositorio público.

- [ ] **Step 4: Crear el repositorio y publicar**

Solo después de su confirmación:

```bash
gh repo create clemgrass.github.io --public --source=. --remote=origin --push
```

- [ ] **Step 5: Activar GitHub Pages con GitHub Actions como origen**

```bash
gh api -X POST repos/clemgrass/clemgrass.github.io/pages -f build_type=workflow
```

Si responde que ya existe, activarlo en su lugar:

```bash
gh api -X PUT repos/clemgrass/clemgrass.github.io/pages -f build_type=workflow
```

- [ ] **Step 6: Verificar que el workflow corrió**

Ejecutar: `gh run list --limit 1`
Esperado: una corrida de `Deploy to GitHub Pages` en estado `completed` / `success`. Si sigue en curso, esperar con `gh run watch`.

- [ ] **Step 7: 🛑 REVISIÓN con el usuario**

Abrir `https://clemgrass.github.io` y confirmar con él que el sitio publicado se ve igual que el preview local.

---

### Task 11: Plantilla y documentación

**Files:**
- Create: `docs/game-template/index.md`
- Create: `README.md`

La plantilla vive fuera de `src/content/games/` a propósito: si estuviera adentro, el loader la tomaría como un juego más y su frontmatter de ejemplo rompería el build.

- [ ] **Step 1: Crear `docs/game-template/index.md`**

```markdown
---
title: Game title
year: 2026
# prototype | in-development | demo | released | thesis
status: prototype
# solo | pair | team | consultant
role: solo
# One or two sentences, in English, about what YOU did on this project.
contribution: >
  What I built on this project.
# Required when role is "pair" or "team". Must be 2 or more.
# teamSize: 3
# Short free text: "Personal project", "University course", "Thesis · Universidad de Chile"
context: Personal project
engine: Godot 4
tech: [GDScript]
link:
  # itch    -> url required, button reads "Get it on itch.io"
  # external-> url AND label required, button reads the label
  # none    -> url must be null, button reads "Build coming soon"
  kind: none
  url: null
  label: null
media:
  # Optional. Put cover.png next to this file and uncomment:
  # cover: ./cover.png
  # Optional. Put the clip in public/games/<slug>/clip.webm and write the
  # site-absolute path here. The build fails if the file is missing.
  clip: null
featured: false
# Position on the page. Must be unique across all games. Lower shows first.
order: 6
---
```

- [ ] **Step 2: Crear `README.md`**

````markdown
# clemgrass.github.io

Portfolio of games and game systems I've built. Astro static site, deployed to
GitHub Pages on every push to `main`.

## Adding a game

1. Copy `docs/game-template/` to `src/content/games/<slug>/`.
2. Fill in the frontmatter of `index.md`. Every field is documented inline.
3. Optional media:
   - Cover image: `src/content/games/<slug>/cover.png`, then set
     `media.cover: ./cover.png`.
   - Gameplay clip: `public/games/<slug>/clip.webm`, then set
     `media.clip: /games/<slug>/clip.webm`.
   - With neither, the row renders a placeholder. That is a supported state.
4. `git push`.

The schema validates the frontmatter during the build. A bad entry fails the
build instead of publishing a broken row.

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build, validates all content
npm test             # schema, ordering and link-extraction tests
npm run check:links  # verify external links resolve (run after build)
```
````

- [ ] **Step 3: Verificar que la plantilla no entró a la colección**

Ejecutar: `npm run build`
Esperado: `Complete!` y el sitio sigue con cinco filas, no seis.

- [ ] **Step 4: Commit**

```bash
git add docs/game-template/index.md README.md
git commit -m "docs: add game template and README"
```

---

## Trabajo que depende del usuario, no del implementador

Estas tareas están fuera del plan porque nadie más que él puede hacerlas, pero son el camino crítico real: **el sitio queda publicable al terminar la Tarea 11, pero se ve vacío hasta que exista la media.**

- [ ] Escribir las frases de `contribution` de Hot Potato y Where The Cheesecakes Go.
- [ ] Confirmar los años de los cinco proyectos y el tamaño del equipo de Hot Potato.
- [ ] Capturar un clip y una portada por proyecto. Requiere abrir cada uno en su versión de Godot: 4.6 para Memoria Khachkar, 4.2 para Hot Potato, **3.x para Where The Cheesecakes Go** (binario distinto de los demás), y la solución .NET para SONAR.
- [ ] Convertir los clips a WebM y dejarlos en `public/games/<slug>/clip.webm`.
- [ ] Crear la cuenta de itch.io, subir los builds y pasar las fichas correspondientes de `link.kind: none` a `itch` con su URL.
- [ ] Aportar los links de LinkedIn e itch.io para el footer.
````

---

## Cambios durante la ejecución

El plan se ejecutó completo el 2026-09-01. Lo que se desvió de lo escrito, y por qué:

**Se eliminó el campo `year`.** Decisión del autor en la revisión del corte 3. Se quitó del schema, de las cinco fichas, de `GameRow` y de la vista. El spec quedó actualizado; las tareas 5, 6 y 7 de este plan todavía lo muestran en su código de ejemplo.

**Los datos de Hot Potato salieron de itch.io, no del autor.** Buscando la URL para el footer apareció que ya existe cuenta (`clementegrass.itch.io`, no `clemgrass`) y que el juego ya está publicado ahí como *Papa Caliente*, con crédito a tres autores. Eso reemplazó tres valores que el plan traía como relleno: `teamSize` pasó de 4 a 3, `link.kind` de `none` a `itch` con URL real, y `status` a `released`. El título quedó en inglés como *Hot Potato* por decisión del autor.

**El placeholder de media muestra solo el motor.** En la revisión del corte 2 se detectó que mostrar el título dentro del recuadro lo duplicaba con el `<h2>` de al lado. Se quitó el título; la etiqueta para lectores de pantalla lo conserva.

**Se corrigió el contraste del acento en tema oscuro.** El plan definía `--accent-text: #ffffff` en ambos temas. Medido en el navegador, blanco sobre `#ff5c39` da 3.07:1, bajo el 4.5:1 que exige WCAG AA a ese tamaño de texto. Se cambió a tinta oscura (`#17100d`) solo en el tema oscuro: 6.13:1, con el naranjo intacto.

**GitHub Pages ya estaba habilitado en modo `legacy`.** El `POST` de la Tarea 10 devolvió 409; se resolvió con el `PUT` que el propio plan tenía previsto como alternativa.

**Pendiente del autor:** la URL de LinkedIn para el footer. Es lo único que quedó sin cerrar de todo lo que dependía de una respuesta suya.
