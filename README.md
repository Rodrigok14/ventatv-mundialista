## Mundial TV (Landing + Admin + Mercado Pago)

- Landing mundialista (Selección Argentina) con catálogo de TVs
- Admin en `/admin` para subir imágenes (Vercel Blob) y cambiar precios/stock
- Checkout con Mercado Pago (Checkout Pro) desde “Comprar ahora”
- Botones de compartir: WhatsApp + Web Share + copiar link

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Variables de entorno

Crear `.env.local`:

```bash
# Admin
ADMIN_PASSWORD=rodri123
ADMIN_SESSION_SECRET=change-me-long-random

# Vercel Blob (necesario para subir imágenes + persistir catálogo)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Mercado Pago (Checkout Pro)
MERCADOPAGO_ACCESS_TOKEN=your_mp_access_token

# Opcional pero recomendado (para back_urls correctas en MP)
SITE_URL=http://localhost:3000
```

### Admin

- URL: `http://localhost:3000/admin`
- Usuario: `rodrigo`
- Clave: `ADMIN_PASSWORD` (por defecto `rodri123` si no seteás la env var)

## Deploy en Vercel

- Configurá las env vars en Vercel (Production + Preview) con los mismos nombres.
- Activá Vercel Blob en el proyecto y copiá `BLOB_READ_WRITE_TOKEN`.
