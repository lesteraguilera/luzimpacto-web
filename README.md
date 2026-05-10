# LUZ Impacto — Sitio web oficial

Sitio web de Fundación LUZ Impacto · [luzimpacto.org](https://luzimpacto.org)

Ministerio cristiano evangélico costarricense que visita colegios con un mensaje de salvación y conecta a los jóvenes con iglesias locales que los discipulen.

---

## 🛠️ Stack

- **Astro 5** — generador de sitio estático
- **CSS custom** — paleta tinto charcoal + amarillo art-deco
- **Google Fonts** — Fraunces (display) + Inter (body)
- **Cloudflare Pages** — hosting
- **GitHub** — versionado

## 🎨 Identidad visual

| Color | Hex | Uso |
|---|---|---|
| Negro charcoal | `#1F2125` | Primario · fondos hero/footer |
| Amarillo art-deco | `#FCD34D` | Acento · logo, CTAs, métricas |
| Off-white cálido | `#FAF7F2` | Fondo principal |

## 📁 Estructura

```
sitio/
├── src/
│   ├── pages/
│   │   └── index.astro          ← homepage
│   ├── layouts/
│   │   └── BaseLayout.astro     ← head, fonts, JS global
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── Metricas.astro
│   │   ├── About.astro
│   │   ├── Pilares.astro
│   │   ├── Aliadas.astro
│   │   ├── Provincias.astro     ← reemplazo temporal del mapa
│   │   ├── Testimonio.astro
│   │   ├── Sumate.astro
│   │   ├── CTAFinal.astro
│   │   └── Footer.astro
│   └── styles/
│       └── global.css           ← variables, tipografía, botones
└── public/
    └── assets/
        └── logos/
            └── luz.png          ← logo oficial
```

## 🚀 Comandos

```bash
npm install      # instalar dependencias (primera vez)
npm run dev      # servidor local en http://localhost:4321
npm run build    # build de producción → dist/
npm run preview  # ver el build localmente
```

## 🌐 Deploy

Auto-deploy desde GitHub → Cloudflare Pages. Cada `git push` a `main` despliega automáticamente.

## ⏳ Pendientes

- [ ] Foto del equipo en hero
- [ ] Foto del Pastor Samuel
- [ ] Testimonios reales
- [ ] Logos de iglesias aliadas (banda)
- [ ] Mapa interactivo de Costa Rica
- [ ] Cuenta del ministerio CR (reemplazar la temporal)
- [ ] Implementar i18n para toggle EN
- [ ] Sección de equipo (Samuel, Lester, Silvia)
- [ ] Próximo evento en home

---

*Proyecto iniciado el 10 de mayo 2026 · Lester Aguilera + Claude*
