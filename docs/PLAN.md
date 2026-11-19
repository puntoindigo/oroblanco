# Plan — Oro Blanco Transporte y Logística

**Fecha:** 2026-11-19  
**Estado:** En desarrollo  
**Dominio objetivo:** transporteoroblanco.com.ar (pendiente compra)  
**Repo:** https://github.com/puntoindigo/oroblanco  
**Deploy:** Vercel (auto-deploy desde `main`)

---

## 1. Visión del producto

Sitio institucional + dashboard operativo para **Oro Blanco Transporte y Logística**, empresa de fletes nacionales e interprovinciales con base en **Rosario** y conexión directa con el **Puerto de Rosario** (importación/exportación).

**Dos capas:**
- **Pública:** landing institucional para captar leads (Meta Ads → formulario)
- **Privada:** dashboard para registrar viajes, ver presupuestos y cruzar con facturación

---

## 2. Stack técnico

| Capa | Tecnología | Razón |
|------|-----------|-------|
| Framework | Next.js 15 (App Router) | SSR/SSG, SEO, API routes nativas |
| UI | Tailwind CSS + shadcn/ui | Velocidad + cohesión visual |
| DB | Neon Postgres (Vercel Marketplace) | Sin infra, escala gratis |
| ORM | Prisma | Type-safe, migrations |
| Auth | NextAuth.js v5 (Credentials) | Login simple sin Clerk, single user |
| Email | Resend | Form presupuesto → email |
| Deploy | Vercel | Auto-deploy, preview URLs |
| Imágenes | Unsplash/Pexels (banco público) + Cloudinary opcional |

---

## 3. Paleta y diseño

**"Oro Blanco"** → identidad visual basada en la marca:

| Token | Color | Uso |
|-------|-------|-----|
| `--color-oro` | `#C9A84C` | Acentos, CTAs, íconos |
| `--color-navy` | `#0F1A2E` | Fondos oscuros, header |
| `--color-blanco` | `#F8F8F4` | Fondo principal |
| `--color-acero` | `#4A5568` | Texto secundario |
| `--color-ruta` | `#1E3A5F` | Cards de servicios |

**Tipografía:** Inter (cuerpo) + Barlow Condensed (headings grandes, industrial)  
**Estilo:** sobrio, confiable, industrial moderno — no "startup colorida"  
**UX:** mobile-first, CTA flotante en mobile (WhatsApp + Presupuesto)

---

## 4. Estructura de rutas

```
/                       → Landing institucional
/servicios              → Tipos de carga y servicios
/nosotros               → Historia, flota, certificaciones
/contacto               → Form presupuesto + datos

/admin                  → Dashboard (protegido)
/admin/viajes           → Lista de viajes registrados
/admin/viajes/nuevo     → Alta de viaje
/admin/presupuestos     → Solicitudes del form público
/admin/login            → Login

/api/presupuesto        → POST form público → Neon + email
/api/viajes             → CRUD viajes (autenticado)
```

---

## 5. Secciones del landing (/)

### Hero
- Frase: **"Fletes nacionales que llegan."**
- Subheadline: Base Rosario · Conexión Puerto · Cobertura nacional
- CTA doble: `Pedir presupuesto` (anchor al form) + `WhatsApp` (badge flotante)
- Background: imagen camión en ruta (Unsplash, libre de derechos)

### Servicios de carga (6 cards)
1. **Carga General** — mercadería paletizada, caja cerrada
2. **Carga Refrigerada** — cadena de frío, 0°C a +15°C
3. **Carga a Granel** — cereales, semillas, granelero
4. **Carga Sobredimensionada** — maquinaria pesada, permisos especiales
5. **Carga Peligrosa** — ADR, habilitación especial, residuos industriales
6. **Puerto Rosario** — importación/exportación, FCL/LCL, despacho aduanero

### Por qué Oro Blanco (3 pilares)
- 🛡️ Seguro de carga incluido
- 📍 Rastreo GPS en tiempo real
- 📋 Documentación completa (remito, hoja de ruta, CMR)

### Cobertura
- Mapa visual: Rosario como hub, flechas a Buenos Aires, Córdoba, Mendoza, NOA, NEA, Patagonia
- Destaca Puerto Rosario para operaciones internacionales

### Form de presupuesto
Campos: Nombre · Empresa · Teléfono · Email · Origen · Destino · Tipo de carga · Peso aprox · Fecha · Mensaje  
→ Guarda en BD + envía email a Diego

### Footer
Datos de contacto, CUIT, horarios, redes

---

## 6. Schema de base de datos (Prisma)

```prisma
model Presupuesto {
  id          String   @id @default(cuid())
  nombre      String
  empresa     String?
  telefono    String
  email       String
  origen      String
  destino     String
  tipoCarga   String
  peso        String?
  fechaEstimada DateTime?
  mensaje     String?
  estado      EstadoPresupuesto @default(NUEVO)
  createdAt   DateTime @default(now())
  viaje       Viaje?   @relation(fields: [viajeId], references: [id])
  viajeId     String?
}

model Viaje {
  id            String   @id @default(cuid())
  fecha         DateTime
  origen        String
  destino       String
  tipoCarga     String
  peso          Float?
  cliente       String
  clienteEmail  String?
  clienteTel    String?
  precio        Float
  estado        EstadoViaje @default(PROGRAMADO)
  notas         String?
  nroRemito     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  presupuestos  Presupuesto[]
}

enum EstadoPresupuesto { NUEVO VISTO EN_PROCESO CERRADO }
enum EstadoViaje { PROGRAMADO EN_CURSO ENTREGADO CANCELADO }
```

---

## 7. Dashboard (/admin)

### Funcionalidades Fase 1
- Login con email/password (single user, en env vars)
- **Presupuestos:** lista paginada, filtro por estado, marcar como visto/en proceso/cerrado
- **Viajes:** alta, edición, estado, precio
- **Cruce:** al crear viaje se puede linkear a un presupuesto existente
- **Exportar:** CSV de viajes con fecha, origen, destino, cliente, precio (para cruzar con facturación)

### KPIs en home del dashboard (Fase 2)
- Total facturado por mes
- Presupuestos nuevos sin ver
- Viajes del mes

---

## 8. Competencia analizada

| Empresa | Fortalezas | Debilidades | Oportunidad Oro Blanco |
|---------|-----------|-------------|------------------------|
| **Transgodoy SRL** (Rosario) | 30+ años trayectoria | Sitio web desactualizado, sin form | Form moderno, respuesta rápida |
| **Transporte GEMA** | B2B, FTL/LTL, cross-docking | Solo Rosario-BsAs | Cobertura nacional completa |
| **DHL/Andreani** | Marca global, red grande | Precio alto, sin trato personalizado | Precio competitivo + atención directa |
| Empresas sin sitio | —  | Sin presencia online | Captar con Meta Ads lo que no tiene web |

**Ventaja diferencial a comunicar:**
1. Respuesta de presupuesto en < 2 horas
2. Conexión directa Puerto Rosario (nicho importadores/exportadores)
3. Rastreo GPS + documentación completa incluida
4. Atención WhatsApp directa (no call center)

---

## 9. Estrategia Meta Ads (fase post-lanzamiento)

**Audiencias:**
- Gerentes de logística / dueños PyME en Rosario, Santa Fe, Córdoba, BsAs
- Intereses: logística, importación, comercio exterior, industria
- Remarketing: visitantes del sitio que no completaron el form

**Creativos sugeridos:**
- Video: camión saliendo del puerto de Rosario al amanecer + texto "Tu carga llega"
- Carrusel: 6 tipos de carga con foto + precio referencial
- Lead Ads: form nativo Facebook → Webhook → Neon (mismo endpoint `/api/presupuesto`)

**UTM tracking:** `?utm_source=meta&utm_medium=paid&utm_campaign=fletes-rosario` → guardar en tabla Presupuesto

---

## 10. Roadmap

### Fase 1 — MVP (esta sesión)
- [x] Repo GitHub + Vercel auto-deploy
- [ ] Landing completa con 6 servicios, hero, form
- [ ] Dashboard: login + presupuestos + viajes
- [ ] DB Neon + Prisma migrations
- [ ] Email on submit (Resend)

### Fase 2 — Contenido y conversión
- [ ] Dominio transporteoroblanco.com.ar conectado
- [ ] SEO: metadatos, Open Graph, sitemap.xml
- [ ] Google Analytics / Meta Pixel
- [ ] Galería de fotos de flota real
- [ ] Testimonios/casos de éxito

### Fase 3 — Operativo avanzado
- [ ] Dashboard KPIs: facturación mensual, top clientes
- [ ] Exportar CSV de viajes
- [ ] Webhook Meta Lead Ads → presupuestos automáticos
- [ ] Integración factura electrónica AFIP (si se decide)
- [ ] App mobile (PWA del dashboard)

---

## 11. Variables de entorno requeridas

```env
# Neon Postgres
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Admin credentials (single user)
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=

# Resend (emails)
RESEND_API_KEY=
EMAIL_TO=  # email de Diego donde llegan los presupuestos

# WA (solo link, no API)
WHATSAPP_NUMBER=  # ej: 5493412345678
```

---

## 12. Decisiones de diseño tomadas

- **Sin Clerk/Auth0**: login propio con credentials, más simple, sin costo
- **Sin CMS**: contenido en código, cambios via deploy
- **Sin internacionalización**: solo español
- **Mobile-first**: breakpoints `sm` como baseline, desktop como enhancement
- **Imágenes públicas**: Unsplash embed (no descarga, link directo) para el MVP; reemplazar con fotos reales en Fase 2
- **Sin Turbopack en prod**: solo dev (`--turbopack` en `next dev`)
