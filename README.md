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

### Dominio custom — closr.cl

Dominio ya adquirido en NIC Chile.

**Setup en Netlify** (una sola vez):
1. Site → **Domain management** → **Add a domain** → `closr.cl` → confirmar propiedad
2. Repetir con `www.closr.cl` (redirect automático a apex)
3. Esperar verificación DNS (5-15 min)
4. **HTTPS** → "Verify DNS configuration" → "Provision certificate" (Let's Encrypt, auto-renueva)

**Configuración DNS en NIC Chile**:

| Tipo  | Nombre | Valor                          | TTL  |
|-------|--------|--------------------------------|------|
| A     | @      | `75.2.60.5`                    | 3600 |
| CNAME | www    | `<site-name>.netlify.app`      | 3600 |

(reemplazar `<site-name>` por el nombre actual del site en Netlify — ej. `closr.netlify.app`)

**Alternativa más fácil** — usar **Netlify DNS**:
- Netlify te da 4 nameservers (`dns1.p01.nsone.net` etc.)
- En NIC Chile → "Nameservers" → reemplazar los actuales por los de Netlify
- Tarda 24-48h en propagar, después Netlify maneja TODO solo (HTTPS, www, redirects)

### Branch previews

Cada PR genera un deploy preview automático. Cada push a `main` deploya a producción.

### Netlify Forms (formulario de leads)

El formulario del CTA (`#ctaForm`, name=`closr-leads`) ya está conectado a **Netlify Forms** — Netlify lo detecta automáticamente al deployar.

**Atributos clave** del form en `index.html`:
- `name="closr-leads"` — identifica el formulario en el dashboard
- `data-netlify="true"` — activa la detección
- `data-netlify-honeypot="bot-field"` — anti-spam (campo oculto que los bots completan; humanos no lo ven)
- `<input type="hidden" name="form-name" value="closr-leads">` — necesario para que el AJAX funcione

El JS (`script.js`) hace **POST AJAX** sin recargar la página y muestra `#ctaSuccess` / `#ctaError` inline.

**Setup en el dashboard de Netlify** (después del primer deploy):

1. **Verificar detección**: Site Settings → Forms → debe aparecer "closr-leads"
2. **Notificaciones por email** (Site configuration → Forms → Form notifications → Add notification):
   - Type: Email notification
   - Event: New form submission
   - Form: `closr-leads`
   - Email: hola@closr.cl (o el que sea)
3. **Anti-spam adicional** (opcional, recomendado):
   - Site Settings → Forms → Spam filters → enable **reCAPTCHA 2** invisible
   - O dejar solo el honeypot (ya está configurado, suele alcanzar)
4. **Webhook a Slack/Zapier/HubSpot** (opcional):
   - Site configuration → Forms → Outgoing webhooks → Add webhook
   - URL del webhook destino → Netlify le pega un POST con cada submission
5. **Ver submissions**: Site → Forms → `closr-leads` → ahí están todos los leads

**Free tier de Netlify Forms**: 100 submissions/mes y 10 MB en uploads. Si crece, plan Pro = $19/mes/site con 1000 submissions.

**Probar local**: Netlify Forms NO funciona en `localhost` (solo cuando está deployado). Para testear, deployá una rama preview y mandá el formulario desde la URL `.netlify.app`.

### Manejo de submissions sin Netlify (alternativa)

Si más adelante querés bypass de Netlify, podés cambiar el `action` del form a un endpoint propio (n8n, AWS Lambda, Formspree, etc.) y borrar los atributos `data-netlify*` del form.

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
