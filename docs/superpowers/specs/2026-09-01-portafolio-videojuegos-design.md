# Portafolio de videojuegos — diseño

**Fecha:** 2026-09-01
**Autor:** Clemente Grass (clemgrass)
**Estado:** aprobado, listo para plan de implementación

## Contexto

Clemente es ingeniero en computación titulado de la Universidad de Chile y ha
trabajado en cinco proyectos de videojuegos entre ramos, trabajo de título,
proyectos personales y consultoría. Hoy esos proyectos solo existen como
repositorios de GitHub, lo que falla por tres razones: dos de los cinco son
privados y no se pueden mostrar, ninguno tiene material visual, y un repositorio
no permite ver ni probar el juego sin clonarlo y compilarlo.

El objetivo es un sitio propio que funcione como vitrina de esos proyectos y que
siga creciendo: agregar un juego nuevo tiene que ser barato y no requerir tocar
código.

## Audiencia y criterio de éxito

La audiencia es **la industria de videojuegos** — reclutadores y leads técnicos
de estudios. El portafolio complementa el título de ingeniero civil en
computación mostrando trabajo real de gamedev.

El tono es de evidencia, no de narrativa: *"mira, hice esto"*. No hay artículos
largos ni casos de estudio. Cada proyecto es una ficha corta y escaneable.

El sitio tiene éxito si alguien que le dedica treinta segundos sale sabiendo, de
cada proyecto: cómo se ve, qué hizo Clemente específicamente en él, con qué
tecnología, y dónde conseguirlo.

## Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Plataforma | Sitio propio | itch.io solo no permite atribuir el rol con claridad y Farolazo (web app) no calza en su modelo |
| Layout | Filas anchas, una por juego | La media grande y el rol se ven sin clicks intermedios; A/B/C evaluadas en maqueta, se eligió filas |
| Idioma | Inglés | Default de la industria incluso en estudios chilenos; no cierra postulaciones internacionales |
| Jugabilidad | Ninguna dentro del sitio | Cada ficha enlaza afuera (itch.io o sitio en vivo); elimina todo el trabajo de exports web |
| Links a código | No hay | Consecuencia: que dos repos sean privados deja de importar |
| Hosting | GitHub Pages | Sin embeds no se necesitan headers COOP/COEP, así que desaparece la razón de usar Cloudflare Pages |
| Stack | Astro | Content collections = una carpeta por juego validada por schema, que es exactamente el requisito de modularidad |

### Por qué no hay nada jugable embebido

Los exports web de Godot 4 requieren headers `COOP/COEP` (cross-origin
isolation) para funcionar. Además, HotPotato usa el renderer Forward+ (que no
corre en web) y multiplayer ENet (que tampoco), y SONAR usa .NET, cuyo export
web es experimental. Al enlazar hacia afuera en vez de embeber, se elimina de
una vez: la restricción de headers, la configuración de exports web en los cinco
proyectos, el porteo de HotPotato a WebSocket + GL Compatibility, y la
dependencia del export .NET de SONAR.

Los builds se suben a itch.io como descargas de escritorio. Si en el futuro
Clemente sube además un build web a itch, itch lo sirve jugable sin que el sitio
cambie en nada.

## Alcance

**Dentro:**

- Home de una sola página con encabezado mínimo, cinco filas de proyecto y pie
  con links de contacto.
- Modelo de contenido validado por schema, con una carpeta por juego.
- Tres estados de enlace por proyecto: itch.io, sitio externo, o ninguno todavía.
- Placeholders de media que se ven presentables mientras no haya clips.
- Diseño responsive (las filas colapsan a una columna en móvil).
- Deploy automático a GitHub Pages en cada push.
- Plantilla documentada para agregar el sexto juego.

**Fuera, a propósito:**

- Páginas de detalle por proyecto (existe el campo, no se construye la vista).
- Devlog o blog.
- Versión en español.
- Cualquier cosa jugable dentro del sitio.
- Links a repositorios.
- Analytics.

Todo lo de la lista de fuera cabe después sin rediseñar el modelo de contenido.

## Arquitectura

### Stack

- **Astro** (sitio estático). Genera HTML sin JavaScript de cliente salvo donde
  se pida explícitamente. El único JS del sitio es un script suelto de pocas
  líneas que arranca los clips cuando entran en viewport; no hay islas ni
  framework de componentes en el cliente.
- **Content collections + Zod** para el modelo de datos y su validación. La
  colección se declara en `src/content.config.ts` con un loader `glob()`; el
  schema vive en `src/content/schema.ts` para poder testearlo fuera de Astro.
- **CSS propio** (custom properties + flexbox/grid). No hay framework de UI: el
  sitio tiene un componente visual real, no justifica la dependencia.
- **GitHub Actions → GitHub Pages** para el deploy.

### Estructura del repositorio

```
PortafolioVG/
├── src/
│   ├── content.config.ts             # declara la colección `games`
│   ├── content/
│   │   ├── schema.ts                 # schema Zod puro (testeable aparte)
│   │   └── games/
│   │       ├── _template/            # plantilla para juegos futuros
│   │       │   └── index.md
│   │       ├── sonar/
│   │       │   ├── index.md
│   │       │   └── media/
│   │       ├── memoria-khachkar/
│   │       ├── farolazo/
│   │       ├── hot-potato/
│   │       └── where-the-cheesecake-go/
│   ├── components/
│   │   ├── GameRow.astro             # la fila ancha; el componente central
│   │   ├── MediaFrame.astro          # clip/imagen, o placeholder si falta
│   │   ├── LinkButton.astro          # despacha según link.kind
│   │   ├── RoleBadge.astro
│   │   └── TagList.astro
│   ├── layouts/
│   │   └── Base.astro                # head, header, footer
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css                # tokens de color, tipografía, espaciado
├── public/
├── docs/superpowers/specs/
├── .github/workflows/deploy.yml
└── astro.config.mjs
```

### Modelo de datos

Cada juego es una carpeta bajo `src/content/games/` con un `index.md`. El
frontmatter son los datos; el cuerpo del markdown no se usa en esta versión y se
deja vacío.

```yaml
---
title: SONAR
year: 2026
status: in-development      # prototype | in-development | demo | released | thesis
role: solo                  # solo | pair | team | consultant
contribution: >
  Frase corta en inglés sobre qué hizo Clemente en este proyecto.
teamSize: 1
context: Personal project   # texto libre corto: "Thesis · U. de Chile", "University course", etc.
engine: Godot 4
tech: [C#, .NET, Godot]
link:
  kind: none                # itch | external | none
  url: null                 # requerido si kind != none
  label: null               # requerido si kind es `external`; ignorado en el resto
media:
  cover: ./media/cover.png  # opcional
  clip: ./media/clip.webm   # opcional
featured: true
order: 1
detail: false               # reservado; no se renderiza vista de detalle en esta versión
---
```

**Reglas de validación (Zod, se aplican en build):**

- `title`, `year`, `status`, `role`, `contribution`, `engine`, `tech`, `link`,
  `order` son obligatorios.
- `status` y `role` son enums cerrados. Un valor fuera del enum falla el build.
- Si `link.kind` es `itch` o `external`, `link.url` es obligatorio y debe ser una
  URL válida. Si `link.kind` es `none`, `link.url` debe ser `null`.
- Si `link.kind` es `external`, `link.label` es obligatorio (el botón necesita
  nombrar el destino: "Visit farolazo.com"). Para `itch` y `none` la etiqueta es
  fija y `link.label` se ignora.
- Si `role` es `team` o `pair`, `teamSize` es obligatorio y debe ser ≥ 2.
- `media.cover` y `media.clip` son opcionales. Si se declaran, el archivo debe
  existir; una referencia a un archivo inexistente falla el build.
- `order` es único dentro de la colección.

El build que falla es intencional: es preferible a publicar una ficha rota.

### Componentes

**`GameRow.astro`** — recibe una entrada de la colección y renderiza la fila
completa: media a un lado, información al otro. Alterna el lado según la
paridad de `order`. Es el único componente que conoce el layout de fila; los
demás son piezas que se le pasan.

**`MediaFrame.astro`** — recibe `cover` y `clip` opcionales y decide qué mostrar,
en este orden: el clip si existe (`<video>` en loop, silenciado,
`preload="metadata"`, y solo se reproduce cuando entra en viewport vía
`IntersectionObserver`); si no, la imagen de portada; si no hay ninguna de las
dos, un placeholder generado con el título y el motor sobre un fondo neutro. El
placeholder es parte del diseño, no un estado de error: permite publicar el
sitio completo antes de tener media e ir reemplazándola de a una.

**`LinkButton.astro`** — recibe `link` y renderiza el botón de salida según
`kind`: `itch` → "Get it on itch.io ↗", `external` → etiqueta explícita del
destino, `none` → un botón apagado, no interactivo, con "Build coming soon".
Los enlaces externos llevan `target="_blank"` y `rel="noopener noreferrer"`.

**`RoleBadge.astro`** — traduce `role` + `teamSize` a un badge visible:
*Solo*, *Pair*, *Team of N*, *Consultant*. Este badge existe porque tres de los
cinco proyectos son colaborativos o de consultoría, y un lector que no puede
distinguir qué escribió Clemente descuenta el proyecto entero.

**`TagList.astro`** — renderiza `engine` + `tech` como chips.

Cada componente es independiente y no conoce el estado de los demás: `GameRow`
los compone, pero se pueden entender y modificar por separado.

## Contenido inicial

Datos verificados leyendo los repositorios el 2026-09-01:

| Slug | Motor / stack real | Visibilidad | Rol | `link.kind` inicial |
|---|---|---|---|---|
| `sonar` | Godot 4 + C#/.NET (4 proyectos C#, tests xUnit) | privado | solo | `none` |
| `memoria-khachkar` | Godot 4.6, GL Compatibility, GDScript | público | solo | `itch` (tras subir build) |
| `farolazo` | TypeScript, PostgreSQL/PLpgSQL, CSS | privado | consultant | `external` → farolazo.com |
| `hot-potato` | Godot 4.2, Forward+, GDScript | público | team | `itch` (tras subir build) |
| `where-the-cheesecake-go` | Godot 3.x, GDScript + Lua | público | pair | `itch` (tras subir build) |

Contexto declarado por el autor: `memoria-khachkar` es su trabajo de título
(Universidad de Chile); `hot-potato` viene de un ramo de desarrollo de
videojuegos multijugador, hecho en grupo; `where-the-cheesecake-go` viene de un
ramo de desarrollo singleplayer, hecho en pareja; en `farolazo` trabajó como
consultor, hizo el scaffolding inicial y las decisiones arquitectónicas, y
diseñó el algoritmo de selección de cartas.

**Campos que solo puede aportar el autor** y que el plan de implementación debe
incluir como tarea explícita suya, no del implementador:

- `contribution` de los cinco proyectos (una o dos frases en inglés).
- `year` real de cada proyecto (la fecha de último push no sirve como año).
- `teamSize` de `hot-potato`.
- Los clips y capturas.
- Las URLs de itch una vez creados los proyectos ahí.

Hasta que lleguen, las fichas se cargan con los datos verificados de la tabla y
`contribution` queda con una frase provisoria marcada en el markdown. El sitio
es publicable en ese estado.

## Layout y comportamiento visual

- Encabezado mínimo: nombre, "Computer Engineer — Universidad de Chile", una
  línea de presentación.
- Cinco filas de proyecto, ordenadas por `order`, alternando el lado de la media.
- Pie con links de contacto (GitHub, LinkedIn, itch, correo).
- Responsive: bajo ~800px las filas colapsan a una columna, media arriba e
  información abajo, sin alternancia.
- Soporte de tema claro y oscuro vía `prefers-color-scheme`, con los colores
  definidos como custom properties en `global.css`.
- Los `<video>` respetan `prefers-reduced-motion`: si está activo, se muestra el
  primer frame estático en vez de reproducir el loop.

## Deploy

- Repositorio en GitHub. El sitio vive en `clemgrass.github.io` (repo con ese
  nombre, sitio en la raíz del dominio) salvo que se compre un dominio propio,
  decisión que puede tomarse después sin afectar nada más.
- `.github/workflows/deploy.yml`: en cada push a la rama principal, instala
  dependencias, corre `astro build` y publica a GitHub Pages.
- Como el build valida el schema, un push con datos inválidos falla el workflow y
  no publica.

## Agregar un juego nuevo

Este es el flujo que el diseño existe para hacer barato:

1. Copiar `src/content/games/_template/` a `src/content/games/<nuevo-juego>/`.
2. Llenar el frontmatter de `index.md`.
3. Dejar `cover.png` y/o `clip.webm` en `media/`.
4. `git push`.

Cuatro pasos, cero cambios de código. Si el frontmatter está mal, el build falla
con un mensaje del schema en vez de publicar algo roto.

## Modo de trabajo: entrega incremental con revisión visual

Requisito explícito del autor. La implementación **no** se entrega como un
sitio terminado al final: se construye en cortes verticales y cada corte se le
muestra corriendo en el navegador para que lo corrija antes de seguir. Un corte
no se da por cerrado hasta que él lo aprueba.

Orden de los cortes:

1. **Shell** — layout base, encabezado, pie, tokens de color y tipografía.
   Revisión: ¿el tono visual es el correcto?
2. **Una fila real** — `GameRow` + `MediaFrame` + `RoleBadge` + `TagList` con un
   solo juego cargado a mano. Es el componente que define todo el sitio.
   Revisión: ¿la fila comunica lo que tiene que comunicar?
3. **Modelo de contenido** — schema Zod, colección, y las cinco fichas cargadas
   con los datos verificados. Revisión: ¿faltan o sobran campos?
4. **Estados de enlace y placeholders** — las tres variantes de `LinkButton` y el
   placeholder de media. Revisión: ¿se ve digno sin media?
5. **Responsive y accesibilidad** — móvil, foco de teclado, contraste,
   `prefers-reduced-motion`.
6. **Deploy** — workflow de GitHub Actions y publicación.
7. **Plantilla y documentación** — `_template/` y un README corto con el flujo de
   agregar un juego.

## Validación

El sitio no lleva suite de tests unitarios: no tiene lógica de negocio. La
validación es:

- **Schema Zod en build** — cubre todos los datos de contenido y es la defensa
  principal.
- **Chequeo de archivos de media referenciados** — parte del schema.
- **Revisión visual por corte** — el mecanismo descrito arriba.
- **Chequeo de enlaces externos**: un script npm (`npm run check:links`) que
  verifica que cada `link.url` responda 200. Se corre a mano antes de publicar,
  no en CI, para no romper el deploy cuando un servicio externo esté caído.

## Riesgos

**El camino crítico no es el sitio, es la media.** El sitio queda publicable en
cuanto se implemente, pero se ve vacío hasta que existan los clips, y capturarlos
depende del autor: hay que abrir cada proyecto en su versión de Godot
correspondiente (incluido uno en Godot 3.x, que requiere un binario distinto de
los demás) y hacerlo correr. Es el trabajo más pesado del proyecto y el que menos
control tiene el implementador.

**Sin links a código, el portafolio no muestra código.** Es una decisión tomada a
conciencia por el autor y a cambio resuelve el problema de los repos privados,
pero conviene dejarla registrada como algo revisable: si en algún momento decide
abrir SONAR o mostrar fragmentos, el modelo de contenido admite un campo nuevo
sin rediseño.
