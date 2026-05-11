# closr — Cerrar ventas con IA

Landing page de **closr**, el agente de IA que cierra ventas en WhatsApp para PYMEs chilenas.
Un producto de [ValueData](https://valuedata.cl) — AI Agentic Analytics.

## Stack

Sitio estático puro — sin build step.

- **HTML5** semántico con JSON-LD (Organization, SoftwareApplication, FAQPage, WebSite)
- **CSS3** con custom properties, gradients, animaciones, glassmorphism, dot-grid bg
- **Vanilla JS** — IntersectionObserver para reveal-on-scroll, animated counters, chat demo en vivo, scroll progress bar
- **Plus Jakarta Sans** (Google Fonts)
- **Paleta Value Data**: indigo `#6366F1` + blue `#3B82F6` + slate scale
- **Gemini Nano Banana** (`gemini-2.5-flash-image`) para los visuals — ver `generate_images.py`

## Estructura

```
closr/
├── index.html                  # Landing single-page
├── styles.css                  # Paleta + componentes + animaciones
├── script.js                   # Reveal, counters, chat demo, scroll progress
├── favicon.svg                 # Logo gradient bubble
├── images/                     # PNGs generados con Gemini
│   ├── hero.png
│   ├── section_night.png
│   ├── section_notification.png
│   ├── section_kanban.png
│   ├── pain_lost_lead.png
│   ├── pain_won_lead.png
│   ├── og_image.png
│   └── icons_set.png
├── generate_images.py          # Script para (re)generar imágenes vía Gemini API
├── netlify.toml                # Deploy config (Netlify)
├── BRAND_BRIEF.md              # Brand guidelines + prompts originales
└── NANO_BANANA_PROMPTS.md      # Prompts para imágenes (paleta Value Data)
```

## Desarrollo local

Cualquier server estático funciona. Doble click al `index.html` también:

```bash
# Opción 1 — Python
python -m http.server 5500

# Opción 2 — Node (npx)
npx serve .

# Opción 3 — VS Code Live Server
# Click derecho > "Open with Live Server"
```

## Regenerar imágenes con Gemini

Requiere una API key de Gemini (gratis en [aistudio.google.com/apikey](https://aistudio.google.com/apikey)).

```bash
# 1. Guardar la key en un archivo local (NO se commitea)
echo "TU_API_KEY" > enn.txt

# 2. Instalar dependencias
pip install google-genai certifi

# 3. Regenerar todo
python generate_images.py

# 4. O solo algunas
python generate_images.py hero pain_lost_lead
```

Modelo por defecto: `gemini-2.5-flash-image`. Override con env var:
```bash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image-preview python generate_images.py
```

> ⚠️ El archivo `enn.txt` está en `.gitignore` y NUNCA debe commitearse.

## Deploy en Netlify

### Setup inicial

1. **Conectar el repo** en [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project" → GitHub → `Value-Data-Next-Gen/closr-web`
2. **Build settings** se auto-detectan desde `netlify.toml`:
   - Build command: *(vacío)*
   - Publish directory: `.`
3. **Deploy**. La primera build toma ~30 segundos.

### Dominio custom

En el dashboard de Netlify → Domain management → Add domain → `closr.cl` (o el que sea).
Apuntar DNS según las instrucciones del proveedor (Netlify DNS recomendado para zero-config HTTPS).

### Branch previews

Cada PR genera un deploy preview automático. Cada push a `main` deploya a producción.

## SEO checklist

- ✅ Meta tags completos (title, description, keywords, author)
- ✅ Open Graph + Twitter Card
- ✅ Geo tags (`es-CL`, Santiago)
- ✅ Canonical URL
- ✅ Schema.org: `SoftwareApplication`, `Organization` (con parent `ValueData`), `WebSite`, `FAQPage`
- ✅ Lang `es-CL`
- ✅ Favicon SVG
- ✅ Imagen OG real (`images/og_image.png`)
- ⚠️ Pendiente: `sitemap.xml` + `robots.txt` cuando se decida el dominio definitivo

## Performance

- Sin build step → primera carga directa
- Fuentes con `preconnect`
- Imágenes `loading="lazy"` excepto el hero
- Cache headers de 1 año para assets estáticos (`netlify.toml`)
- HTML siempre revalidado (no se cachea agresivamente)
- HTTPS automático via Netlify
- Strict-Transport-Security, X-Frame-Options, Referrer-Policy

## Contacto

- **closr**: hola@closr.cl
- **ValueData**: [valuedata.cl](https://valuedata.cl) · [LinkedIn](https://www.linkedin.com/company/value-data-ai/)
- Tel: +56 9 3294 2337
