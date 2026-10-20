# clemgrass.github.io

Página personal de Clemente Grass Briones: https://clemgrass.github.io/

**Para editar el contenido lee [COMO-EDITAR.md](COMO-EDITAR.md).** Todo el contenido vive en `contenido/`.

## Cómo está hecha

Sitio estático generado con [Eleventy](https://www.11ty.dev/) (Node 24), con CSS y JavaScript sin dependencias. `lib/` lee y valida `contenido/` (mensajes en español). GitHub Actions valida y construye cada PR, y publica en GitHub Pages al hacer merge a `main`. `main` está protegida: todo entra por pull request.

## Comandos

```bash
npm install       # una vez
npm start         # servidor local en http://localhost:8080
npm run validar   # revisa los archivos de contenido/
npm test          # tests
npm run build     # genera _site/
```
