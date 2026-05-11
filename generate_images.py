"""
Generate closr hero/section images via Gemini Nano Banana
(gemini-2.5-flash-image-preview).

Reads API key from enn.txt (one line, raw key).
Saves PNG output to ./images/.
"""
from __future__ import annotations
import os
import sys
import time
from pathlib import Path

# Fix Windows SSL: monkey-patch requests.Session.request to always pass
# verify=<certifi bundle>. Genai SDK uses google.auth.transport.requests
# under the hood, which is a requests.Session subclass.
import certifi
_CA = certifi.where()
os.environ["SSL_CERT_FILE"] = _CA
os.environ["REQUESTS_CA_BUNDLE"] = _CA
import requests
_orig_request = requests.Session.request
def _patched_request(self, method, url, **kwargs):  # noqa: ANN001
    kwargs.setdefault("verify", _CA)
    return _orig_request(self, method, url, **kwargs)
requests.Session.request = _patched_request  # type: ignore[assignment]

from google import genai
from google.genai import types

ROOT = Path(__file__).parent
KEY_FILE = ROOT / "enn.txt"
OUT_DIR = ROOT / "images"
OUT_DIR.mkdir(exist_ok=True)

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")

BRAND_PREAMBLE = (
    "BRAND: closr — premium B2B SaaS by ValueData. AI Agentic Sales for "
    "Chilean SMBs. Aesthetic: Linear / Vercel / Stripe — clean editorial, "
    "premium tech, sober. NOT cute, NOT warm-illustrated, NOT corporate-stiff.\n"
    "PALETTE (use exactly): primary indigo #6366F1, indigo dark #4F46E5, "
    "indigo light #E0E7FF, secondary blue #3B82F6, navy text #0F172A, "
    "slate body #64748B, off-white bg #F8FAFC, white surface #FFFFFF, "
    "success green #22C55E. Gradient: linear 135deg from #6366F1 to #3B82F6 "
    "for accents and CTAs. Plus Jakarta Sans typography.\n"
    "STRICTLY NO: robots, holograms, neural-network lines, glowing brains, "
    "purple/violet/teal/mint, AI clichés, drawn human characters with faces, "
    "stock-photo handshakes, code on screens, tropical illustrations.\n\n"
)

ASPECTS: dict[str, str] = {
    "hero_wide": "16:9",
    "hero_cosmic": "16:9",
}

PROMPTS: dict[str, str] = {
    "hero_cosmic": (
        "CINEMATIC ULTRA-WIDE 16:9 panoramic hero backdrop for a premium "
        "tech SaaS landing page. Inspired by editorial sci-fi space "
        "photography. Atmospheric, immersive, dramatic.\n\n"
        "COMPOSITION (left-to-right narrative, NOT a phone, NOT a device):\n"
        "- Deep navy-black void background (#0A0E1A to #0F172A gradient).\n"
        "- Soft cosmic nebula clouds in INDIGO #6366F1 and BLUE #3B82F6 "
        "tones, swirling like distant galaxies. NO purple, NO violet, NO "
        "magenta.\n"
        "- Floating digital particles / tiny glowing dots scattered "
        "throughout in indigo and white, suggesting data points or "
        "messages flowing through space.\n"
        "- LEFT third: subtle red/orange embers and scattered translucent "
        "white chat-bubble silhouettes (very small, blurred, ghost-like), "
        "suggesting unanswered messages floating in the void (the 'chaos').\n"
        "- CENTER: a bright vertical light beam / portal effect with a "
        "subtle indigo-blue glow, like a singularity where order emerges.\n"
        "- RIGHT third: cleaner, brighter atmosphere with orderly streams "
        "of indigo light flowing horizontally, organized digital flows.\n"
        "- Foreground silhouette suggestion (bottom edge): a subtle "
        "mountain or horizon line silhouette in deep navy, very subtle, "
        "giving depth at the bottom 20% of the image.\n\n"
        "MOOD: cinematic, dramatic, premium. Like an editorial poster "
        "for a sci-fi tech film. Depth, layers, atmosphere. The viewer "
        "should feel 'the chaos ends here'.\n\n"
        "STRICTLY NO: phones, iPhones, iPads, laptops, screens, devices, "
        "humans, faces, hands, text overlays, chat bubbles with text, "
        "logos. Pure abstract atmospheric tech-cinema backdrop.\n\n"
        "ASPECT RATIO: 16:9 WIDE PANORAMIC. Cinematic widescreen."
    ),

    "hero_wide": (
        "CINEMATIC ULTRA-WIDE 16:9 PANORAMIC composition, premium SaaS "
        "hero banner. Editorial product photography fidelity. The "
        "composition reads LEFT → RIGHT, telling the story: chaos of "
        "unanswered customer pain on the left → calm AI resolution on "
        "the right.\n\n"
        "ABSOLUTELY CRITICAL: NO PHONE, NO iPhone, NO smartphone, NO "
        "device frame anywhere in the image. The scene is composed ONLY "
        "of floating chat bubbles arranged in 3D space — like an "
        "abstract editorial illustration. NO humans. NO hands. NO faces.\n\n"
        "LEFT HALF (50% of width) — 'SIN closr':\n"
        "Soft red/pink atmospheric tint, slightly cooler/darker. Multiple "
        "WhatsApp-style chat bubbles floating at varied tilted angles "
        "(5-15 degrees), like a scattered messy pile. All INCOMING WHITE "
        "bubbles (customer messages WITHOUT REPLY). Each bubble shows a "
        "tiny faint timestamp and a single grey tick (sent, unread):\n"
        "  • 'Tienen el rojo talla M?' — 23:14\n"
        "  • 'Sigue ahí?' — 23:38\n"
        "  • 'Llevo 2 horas esperando...' — 01:12\n"
        "  • 'Ya compré en otra tienda 😞' — 09:43\n"
        "  • 'Sin respuesta...' — 11:05\n"
        "Two small floating red tags reading 'VENTA PERDIDA' near "
        "different bubbles. Soft red glow halos around the bubbles. "
        "Background: muted off-white with a faint red/pink radial glow.\n\n"
        "CENTER: a soft transition zone with a vertical gradient beam "
        "going from red-pink to indigo-green. A medium-sized prominent "
        "indigo→blue badge with bold white 'IA' text inside, glowing "
        "softly, marking 'closr arrives'.\n\n"
        "RIGHT HALF (50% of width) — 'CON closr':\n"
        "Clean, bright, brighter atmosphere with a soft GREEN success "
        "halo. Multiple chat bubbles arranged in an ORDERLY stack/flow "
        "(top to bottom, like a real conversation), alternating sides:\n"
        "  • Incoming WHITE: 'Tienen el rojo talla M?' — 23:14\n"
        "  • Outgoing GREEN (#DCF8C6) with small bold indigo 'IA' tag: "
        "'Sí! Queda 1. ¿Lo aparto?' — 23:14\n"
        "  • Incoming WHITE: 'Sí porfa 🙏' — 23:15\n"
        "  • Outgoing GREEN with 'IA' tag: 'Apartado ✓ Te espero mañana "
        "9 AM' — 23:15\n"
        "  • Outgoing GREEN with 'IA' tag and emphasis: 'Reserva $24.990 "
        "confirmada ✅' — 23:16\n"
        "Each outgoing bubble has double-blue-tick (read receipt) ✓✓. A "
        "small floating green tag near the last bubble: 'VENTA CERRADA "
        "✓'. Subtle indigo and blue glow orbs in the background. Off-white "
        "#F8FAFC backdrop.\n\n"
        "OVERALL LIGHTING: cinematic editorial, soft three-point. Storm "
        "to calm left-to-right. The 'IA' badge in the center pops as a "
        "focal point.\n"
        "ABSOLUTELY 16:9 WIDE PANORAMIC — wider than tall. NOT 1:1, NOT "
        "square, NOT vertical. Cinematic widescreen.\n"
        "Text in bubbles must be LEGIBLE and spelled EXACTLY as written. "
        "Latin characters only, no garbled letters."
    ),

    "hero": (
        "PHOTOREALISTIC product render of an iPhone 17 Pro in NATURAL "
        "TITANIUM finish, FRONT VIEW ONLY — viewer sees the SCREEN, not the "
        "back. The phone is hovering vertically, slightly tilted ~7 degrees "
        "to the right (NOT lying flat, NOT laid down). Apple-keynote studio "
        "fidelity.\n\n"
        "DEVICE DETAILS (must be accurate):\n"
        "- Natural-titanium side rails (slightly warm silver, brushed micro "
        "matte), chamfered flat edges. NO chrome, NO plastic look.\n"
        "- Real Dynamic Island: centered black pill at the top of the screen, "
        "approximately 125 wide × 35 tall, with the small front-camera dot "
        "and Face ID sensor visible inside it.\n"
        "- Slim uniform bezels around the screen (Ceramic Shield).\n"
        "- LEFT side (subtle, partially visible due to tilt): small Action "
        "Button on top, then two long volume buttons (up/down).\n"
        "- RIGHT side (subtle): single long power/side button.\n"
        "- ABSOLUTELY NO camera lenses on the front. The camera goes on the "
        "BACK and the back is NOT visible in this shot. Front face only.\n\n"
        "SCREEN CONTENT — render a clean, REALISTIC WhatsApp chat:\n"
        "1) iOS status bar at top: time '23:47' on left in white, signal "
        "bars + Wi-Fi + battery on right in white. Status-bar background "
        "matches WhatsApp dark green #075E54.\n"
        "2) WhatsApp dark-green header bar (#075E54) with: small white "
        "back-arrow, circular avatar with white WhatsApp logo on green, "
        "title 'Ferretería El Tornillo' (white, bold), subtitle 'en línea' "
        "(white, smaller, with a tiny green pulsing dot before it). Two "
        "small white icons on the right (camera + phone).\n"
        "3) Chat body with the AUTHENTIC WhatsApp beige background "
        "(#ECE5DD) and the faint pattern of doodles. A small pill saying "
        "'HOY' in light blue at the top.\n"
        "4) Five chat bubbles, alternating sides, with VERY SHORT and "
        "CLEARLY LEGIBLE Spanish text — render the text crisp, NOT garbled:\n"
        "   • Incoming (left, WHITE bubble, dark text): 'Tienen rodamiento?'\n"
        "   • Outgoing (right, light-green #DCF8C6 bubble, dark text, with "
        "a tiny indigo 'IA' tag inside): 'Sí, queda 1. ¿Lo aparto?'\n"
        "   • Incoming (left, white): 'Sí porfa 🙏'\n"
        "   • Outgoing (right, light-green, with 'IA' tag): 'Listo ✓ "
        "mañana 9 AM'\n"
        "   • Incoming (left, white): 'Gracias!'\n"
        "5) WhatsApp input bar at the bottom: light-grey background with a "
        "rounded white pill saying 'Mensaje', plus a green circular mic "
        "button on the right (#25D366).\n\n"
        "RESERVED: text must be LEGIBLE and spelled EXACTLY as written "
        "above. Use Latin characters only — do not invent or scramble "
        "letters.\n\n"
        "POSE & COMPOSITION: phone vertical, centered, floating in mid-air, "
        "no hand, no desk. Slight 7-degree tilt to the right. Subtle "
        "contact shadow under the phone.\n"
        "LIGHTING: soft three-point studio lighting. Subtle indigo "
        "(#6366F1) rim light on the right edge of the device, gentle blue "
        "(#3B82F6) fill on the left, picking up the brushed titanium.\n"
        "BACKGROUND: clean off-white #F8FAFC seamless studio backdrop. "
        "Two large out-of-focus glowing orbs — indigo top-right at ~35% "
        "opacity, blue bottom-left at ~25% opacity. A subtle dot grid "
        "pattern (40px spacing, indigo at 6% opacity) faded toward the "
        "edges. Nothing else competing for attention.\n\n"
        "DO NOT INCLUDE: NO floating UI cards, NO badges, NO stickers, NO "
        "watermarks, NO text overlays outside the screen. Only the phone "
        "and the soft glow background.\n"
        "DO NOT INCLUDE: NO violet, NO teal, NO mint background. NO "
        "cartoon style. NO drawn humans. NO hand holding the phone.\n\n"
        "FINAL CHECK: must look like a REAL Apple-marketing photograph of "
        "the iPhone 17 Pro, sharp focus, premium product photography. "
        "Square aspect ratio, hi-res."
    ),

    "section_night": (
        "Premium dark-mode SaaS illustration. Dark navy #0F172A panel as the "
        "scene. A small minimal line-art icon of a closed shopfront rolling "
        "shutter with a tiny pulsing green 'AI active' indicator. Stacked "
        "WhatsApp-style chat bubbles alternating: incoming white with navy "
        "text 'tienen rodamiento 6203?'; outgoing in indigo→blue gradient with "
        "white text and 'AI' badge 'sí, te queda 1 en stock. ¿lo dejamos "
        "apartado para mañana?'; incoming 'porfa'. A faint indigo halo behind "
        "the bubbles. Top-right corner: small clock showing 23:47 in slate "
        "#94A3B8 plus a subtle indigo-light moon glow and tiny twinkling "
        "white star dots. Atmosphere: 'business keeps selling at night'. "
        "Aspect ratio 4:3. NO drawn humans, NO buildings — only UI elements "
        "and atmospheric glow. Premium editorial."
    ),

    "section_notification": (
        "Premium SaaS notification card mockup, hero-product-shot style. "
        "Centered: a rounded white card (28px radius) with a subtle indigo "
        "glow shadow. Card content: top row 'phone icon + llamada terminó "
        "hace 2 min' in slate; middle bold 'María — Joyería Andes' with the "
        "name in indigo→blue gradient text fill, navy for the rest; subtitle "
        "'Sugerencia: enviar cotización antes de las 18:00' in slate; bottom "
        "two buttons side by side — left 'Enviar plantilla' as indigo→blue "
        "gradient pill with white text, right 'Agendar tarea' as a white "
        "outlined ghost button. Background: off-white #F8FAFC with translucent "
        "coffee cup illustration at 5% opacity for atmosphere. Soft indigo "
        "radial glow surrounding the card. Subtle dot grid pattern faded at "
        "edges. Aspect ratio 4:3."
    ),

    "section_kanban": (
        "Premium SaaS kanban board UI mockup, slight 3-degree tilt for depth "
        "(NOT full isometric, mostly flat). Four columns on a slate-100 panel "
        "with rounded corners and 1px border. Column headers in uppercase "
        "tracked-out labels: 'NUEVO' (indigo underline), 'CONVERSANDO' "
        "(indigo), 'COTIZANDO' (indigo), 'CERRADO' (green #22C55E underline). "
        "Each column has 2-3 small cards with abstract pill avatars, name, "
        "and amount. CERRADO cards have a soft mint-green tint #DCFCE7. "
        "KEY: one card mid-flight floating between CONVERSANDO and COTIZANDO "
        "— indigo→blue gradient background, white 'AI' badge, three tiny "
        "sparkle stars around it, soft indigo glowing shadow underneath. "
        "Below the kanban: small floating card 'IA: lead respondió 3 veces "
        "en 10 min · ¿cotizar ahora?' with a gradient 'sí, cotizar' button. "
        "Background: off-white #F8FAFC with subtle indigo gradient orbs "
        "in corners. Aspect ratio 16:10."
    ),

    "og_image": (
        "Social share OG image, EXACTLY 1200x630 aspect ratio. Premium "
        "editorial SaaS aesthetic. LEFT 60%: bold headline on off-white "
        "#F8FAFC. Line 1 'Cierra ventas con IA' in navy #0F172A, Plus Jakarta "
        "Sans ExtraBold, ~64px, tight tracking. Line 2 'sin perder ningún "
        "lead' with that whole phrase in indigo→blue gradient text fill. "
        "Line 3 'nunca más.' in navy. Below smaller (~24px) in slate: 'closr "
        "· by ValueData'. RIGHT 40%: a stylized vertical stack of three "
        "rounded chat bubbles slightly rotated and overlapping casually. Top "
        "bubble: solid indigo with white 'AI' badge. Middle: indigo→blue "
        "gradient. Bottom: white with slate border. Each contains a tiny "
        "green checkmark. Behind: soft indigo glow orbs and faint dot grid. "
        "Bottom-right corner: small closr horizontal logo lockup (gradient "
        "bubble + wordmark). NO illustrated humans, pure SaaS editorial."
    ),

    # ============ HERO CAROUSEL — iPhone 17 Pro Max Cosmic Orange ============
    "hero_1_ferreteria": (
        "PHOTOREALISTIC product shot of an iPhone 17 PRO MAX in COSMIC "
        "ORANGE titanium finish (Apple's official 2025 orange — warm "
        "saturated orange-red, slightly metallic, NOT brown, NOT terracotta, "
        "NOT pastel). The Pro Max is the LARGER variant (6.9-inch display). "
        "FRONT VIEW ONLY — viewer sees the screen, NOT the back camera.\n\n"
        "DEVICE DETAILS:\n"
        "- Brushed cosmic-orange titanium side rails with chamfered flat edges\n"
        "- Real Dynamic Island at the top (centered black pill, ~135 wide × "
        "36 tall, with small front-camera dot and Face ID sensor)\n"
        "- Slim uniform bezels around the Ceramic Shield display\n"
        "- Action button (small recessed) + volume up + volume down on the "
        "LEFT side, barely visible due to slight tilt\n"
        "- Power button on the RIGHT side\n"
        "- NO camera lenses visible — front face only\n\n"
        "SCREEN CONTENT (clear, legible WhatsApp chat):\n"
        "- iOS status bar (white text on WhatsApp dark green #075E54): "
        "'23:47' left, '5G ▮▮▮' right\n"
        "- WhatsApp header (#075E54, white text): back arrow, green circular "
        "avatar with white WhatsApp logo, title 'Ferretería El Tornillo', "
        "subtitle 'en línea' with tiny green dot. Camera + phone icons on "
        "the right.\n"
        "- Beige WhatsApp body (#ECE5DD) with faint doodle pattern, 'HOY' "
        "pill at top.\n"
        "- 4 bubbles:\n"
        "  • LEFT (white): 'Tienen rodamiento 6203?'\n"
        "  • RIGHT (light-green #DCF8C6, with tiny indigo 'IA' tag): 'Sí, "
        "queda 1. ¿Lo aparto?'\n"
        "  • LEFT (white): 'Sí porfa 🙏'\n"
        "  • RIGHT (light-green, with 'IA' tag): 'Listo ✓ mañana 9 AM'\n"
        "- WhatsApp input bar at bottom: 'Mensaje' pill + green mic button "
        "(#25D366).\n\n"
        "POSE: phone vertical, tilted ~6 degrees right, hovering, NO hand, "
        "NO desk. Subtle contact shadow.\n"
        "LIGHTING: studio three-point. Subtle indigo rim light (#6366F1) "
        "right edge, blue (#3B82F6) fill left. Cosmic orange titanium "
        "catches highlights warmly.\n"
        "BACKGROUND: clean off-white #F8FAFC studio backdrop. Two large "
        "out-of-focus glowing orbs: indigo top-right (~30% opacity), blue "
        "bottom-left (~25%). Subtle dot grid (40px, indigo 6% opacity) "
        "faded toward edges.\n"
        "Text must be LEGIBLE and spelled exactly. NO floating cards, NO "
        "stickers, NO badges, NO watermarks outside the screen. Apple "
        "marketing fidelity. Tall portrait aspect ratio (9:16 or 3:4)."
    ),

    "hero_2_pasteleria": (
        "Same exact iPhone 17 PRO MAX in COSMIC ORANGE titanium as the "
        "previous reference, same pose, same lighting, same background. "
        "ONLY the screen content changes.\n\n"
        "SCREEN CONTENT (legible WhatsApp chat):\n"
        "- iOS status bar (white on #075E54): '08:13' left, '5G ▮▮▮' right\n"
        "- WhatsApp header (#075E54): back arrow, green WhatsApp avatar, "
        "title 'Pastelería Dulce Andes', subtitle 'en línea' with tiny "
        "green dot.\n"
        "- Beige WhatsApp body #ECE5DD with faint pattern, 'HOY' pill.\n"
        "- 5 bubbles:\n"
        "  • LEFT (white): 'Hola! Tienen torta de chocolate?'\n"
        "  • RIGHT (light-green #DCF8C6 with indigo 'IA' tag): 'Sí! "
        "Tenemos para hoy. ¿Para cuántas personas?'\n"
        "  • LEFT (white): '8 personas, para las 19:00'\n"
        "  • RIGHT (green, 'IA' tag): 'Listo. Torta 1kg chocolate, "
        "$22.900. ¿Retiro o despacho?'\n"
        "  • LEFT (white): 'Despacho porfa'\n"
        "- Bottom input bar with green mic.\n"
        "Same titanium orange, same studio bg, same orbs. Apple fidelity, "
        "tall portrait aspect ratio."
    ),

    "hero_3_ecommerce": (
        "Same exact iPhone 17 PRO MAX in COSMIC ORANGE titanium as the "
        "previous reference, same pose, same lighting, same background. "
        "ONLY the screen content changes.\n\n"
        "SCREEN CONTENT (legible WhatsApp chat):\n"
        "- iOS status bar (white on #075E54): '14:22' left, '5G ▮▮▮' right\n"
        "- WhatsApp header (#075E54): back arrow, green WhatsApp avatar, "
        "title 'Tienda Vélaris', subtitle 'en línea' with tiny green dot.\n"
        "- Beige WhatsApp body #ECE5DD with faint pattern, 'HOY' pill.\n"
        "- 5 bubbles:\n"
        "  • LEFT (white): 'Pedido #4821 ya llegó?'\n"
        "  • RIGHT (light-green #DCF8C6 with indigo 'IA' tag): 'Sí Camila! "
        "Está en reparto, llega entre 15:00 y 17:00 hoy.'\n"
        "  • LEFT (white): 'Genial. Y si no estoy?'\n"
        "  • RIGHT (green, 'IA' tag): 'Te dejamos con conserjería o "
        "reagendamos. ¿Qué prefieres?'\n"
        "  • LEFT (white): 'Conserjería 👍'\n"
        "- Bottom input bar with green mic.\n"
        "Same titanium orange, same studio bg, same orbs. Apple fidelity, "
        "tall portrait aspect ratio."
    ),

    "hero_4_servicios": (
        "Same exact iPhone 17 PRO MAX in COSMIC ORANGE titanium as the "
        "previous reference, same pose, same lighting, same background. "
        "ONLY the screen content changes.\n\n"
        "SCREEN CONTENT (legible WhatsApp chat):\n"
        "- iOS status bar (white on #075E54): '11:08' left, '5G ▮▮▮' right\n"
        "- WhatsApp header (#075E54): back arrow, green WhatsApp avatar, "
        "title 'Estudio Pilates Sur', subtitle 'en línea' with tiny green "
        "dot.\n"
        "- Beige WhatsApp body #ECE5DD with faint pattern, 'HOY' pill.\n"
        "- 5 bubbles:\n"
        "  • LEFT (white): 'Hay cupo viernes en la tarde?'\n"
        "  • RIGHT (light-green #DCF8C6 with indigo 'IA' tag): 'Sí! 16:00 "
        "o 18:30. ¿Cuál te acomoda?'\n"
        "  • LEFT (white): '18:30'\n"
        "  • RIGHT (green, 'IA' tag): 'Reservado ✓ Viernes 18:30 con "
        "Javiera. Te enviamos el recordatorio.'\n"
        "  • LEFT (white): 'Gracias!'\n"
        "- Bottom input bar with green mic.\n"
        "Same titanium orange, same studio bg, same orbs. Apple fidelity, "
        "tall portrait aspect ratio."
    ),

    "pain_lost_lead": (
        "PHOTOREALISTIC iPhone screen-only render (no device frame, just "
        "the screen content cropped tight). A real WhatsApp chat showing a "
        "LOST sale due to slow response. WhatsApp dark-green header reading "
        "'Cliente · última vez ayer'. Beige WhatsApp body with the doodle "
        "pattern. The chat has timestamps showing the night-to-morning gap:\n"
        "- 23:14 — Incoming WHITE bubble: 'Tienen el polerón rojo talla M?'\n"
        "- 23:14 — Tiny double-grey-tick (delivered, NOT read) below it\n"
        "- A clear visual GAP / vertical separator showing 'MAÑANA SIGUIENTE' "
        "as a small grey pill\n"
        "- 09:42 — Outgoing GREEN-tinted bubble (#DCF8C6) from the business: "
        "'Hola! Sí, queda uno. ¿Lo dejo apartado?'\n"
        "- 09:43 — Incoming WHITE bubble: 'Ya compré en otra tienda 😅'\n"
        "- 09:43 — Outgoing GREEN bubble: '😞'\n"
        "Background of chat: the WhatsApp beige with subtle pattern. "
        "OVERLAY a translucent sad/red tint on top, very subtle (not dominant) "
        "to communicate 'lost'. A small floating tag in the top-right corner "
        "of the image (NOT inside the chat) reading 'VENTA PERDIDA' in red "
        "uppercase, small, like a sticker.\n"
        "Style: realistic WhatsApp UI fidelity. Text must be CLEARLY "
        "LEGIBLE and spelled exactly as written.\n"
        "Aspect ratio: tall portrait (3:4). Off-white #F8FAFC studio "
        "background outside the screen content. NO phone bezel, NO hand. "
        "Just the chat content with the red 'venta perdida' sticker."
    ),

    "pain_won_lead": (
        "PHOTOREALISTIC iPhone screen-only render (no device frame, just "
        "the screen content cropped tight, parallel composition to the 'lost' "
        "version). A real WhatsApp chat showing a SAVED sale via instant AI "
        "response. WhatsApp dark-green header reading 'Cliente · en línea'. "
        "Beige WhatsApp body with the doodle pattern. Timestamps all close "
        "together at night, showing speed:\n"
        "- 23:14 — Incoming WHITE bubble: 'Tienen el polerón rojo talla M?'\n"
        "- 23:14 — Outgoing GREEN-tinted bubble (#DCF8C6) with a tiny indigo "
        "'IA' tag at the start: 'Sí! Queda 1. ¿Te lo aparto hasta mañana?'\n"
        "- 23:15 — Incoming WHITE: 'Sí porfa 🙏'\n"
        "- 23:15 — Outgoing GREEN with 'IA' tag: 'Listo ✓ Te espero mañana "
        "9 AM. Pago en local o transferencia?'\n"
        "- 23:16 — Incoming WHITE: 'Transferencia, gracias!'\n"
        "- 23:17 — Outgoing GREEN with 'IA' tag: 'Te enviamos los datos. "
        "Reserva: $24.990 confirmada ✅'\n"
        "Background subtle GREEN tint (very subtle, like a soft success "
        "halo). A small floating tag in the top-right corner (NOT inside "
        "the chat) reading 'VENTA CERRADA' in green uppercase, small, like "
        "a sticker, with a checkmark.\n"
        "Style: realistic WhatsApp UI fidelity. Text must be CLEARLY "
        "LEGIBLE and spelled exactly as written. The 'IA' badges must be "
        "clearly visible inside the green outgoing bubbles.\n"
        "Aspect ratio: tall portrait (3:4). Off-white #F8FAFC studio "
        "background outside the screen content. NO phone bezel, NO hand. "
        "Just the chat content with the green 'venta cerrada' sticker."
    ),

    "icons_set": (
        "Set of 5 SaaS feature icons in a single horizontal row, equal "
        "spacing. Premium tech aesthetic (Linear/Stripe). Each icon ~96x96 "
        "geometric flat illustration in indigo #6366F1 and blue #3B82F6 with "
        "subtle gradient fills. Each sits inside a soft 20px-rounded square "
        "of light indigo #E0E7FF or light blue #DBEAFE alternating. "
        "1) chat bubble with paperclip and smiley face. "
        "2) three horizontal stacked bars (kanban sideways) with one card "
        "mid-flight between two of them. "
        "3) calendar grid with one date highlighted in indigo→blue gradient "
        "plus small clock icon overlapping. "
        "4) stack of three offset rounded message-shaped cards, top one "
        "with a white checkmark on indigo. "
        "5) three vertical bars ascending (slate, indigo, blue) with a small "
        "'+24%' pill badge floating top-right. "
        "NO text labels under icons. Background: transparent or off-white. "
        "Aspect ratio 5:1."
    ),
}


def main(only: list[str] | None = None) -> None:
    if not KEY_FILE.exists():
        sys.exit(f"❌ Falta {KEY_FILE.name} con la API key de Gemini")

    api_key = KEY_FILE.read_text(encoding="utf-8").strip()
    if not api_key:
        sys.exit(f"❌ {KEY_FILE.name} está vacío")

    client = genai.Client(api_key=api_key)

    targets = {k: v for k, v in PROMPTS.items() if not only or k in only}
    print(f"→ Generando {len(targets)} imagen(es) con {MODEL}\n")

    for name, body in targets.items():
        prompt = BRAND_PREAMBLE + body
        out_path = OUT_DIR / f"{name}.png"
        print(f"  · {name} → {out_path.name} ", end="", flush=True)
        t0 = time.time()
        cfg_kwargs = {"response_modalities": ["IMAGE"]}
        aspect = ASPECTS.get(name)
        if aspect:
            try:
                cfg_kwargs["image_config"] = types.ImageConfig(aspect_ratio=aspect)
            except Exception:
                pass  # SDK may not support image_config for this model
        try:
            resp = client.models.generate_content(
                model=MODEL,
                contents=[prompt],
                config=types.GenerateContentConfig(**cfg_kwargs),
            )
        except Exception as exc:
            print(f"\n    ❌ {exc!r}")
            continue

        saved = False
        for part in resp.candidates[0].content.parts or []:
            inline = getattr(part, "inline_data", None)
            if inline and inline.data:
                out_path.write_bytes(inline.data)
                saved = True
                break

        dt = time.time() - t0
        print(f"({dt:.1f}s)" if saved else f"⚠ sin imagen ({dt:.1f}s)")


if __name__ == "__main__":
    args = sys.argv[1:]
    main(only=args or None)
