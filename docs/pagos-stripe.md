# Pagos con Stripe — Bootcamp Utah 2027

Inscripción de **$250 USD**. Cubre el cupo y **dos** cartas de invitación
(participante + un acompañante).

---

## Cómo está montado

**Checkout alojado**, no Elements. Los datos de la tarjeta nunca tocan este
servidor: no hay carga de cumplimiento PCI, y Stripe se encarga de 3D Secure y
de los métodos de pago locales de cada país. Un formulario propio no aportaría
nada aquí y multiplicaría el riesgo.

```
[Reservar mi cupo]
      │
      ├─ POST /api/bootcamp/checkout  → crea la sesión (el importe se fija AQUÍ)
      │
      ├─ redirección a checkout.stripe.com
      │
      ├─ paga ──┬─→ POST /api/stripe/webhook   ← FUENTE DE VERDAD
      │         │      guarda la inscripción pase lo que pase
      │         │
      │         └─→ /bootcamp/confirmacion?session_id=…
      │                verifica contra Stripe · red de seguridad si el webhook
      │                aún no llegó · muestra los pasos + formulario de cartas
      │
      └─ cancela ──→ /bootcamp?pago=cancelado
```

### Por qué el webhook y no sólo la página de vuelta

El comprador puede cerrar el navegador justo después de pagar y no volver
nunca. El webhook llega igual. La página de confirmación hace el mismo `upsert`
sobre `stripeSessionId` (único), así que los dos caminos convergen sin duplicar.

### Por qué los datos de las cartas van DESPUÉS del pago

Stripe admite como mucho tres campos personalizados, y sobre todo: cada campo
extra antes de pagar pierde gente. Una vez pagado, la familia rellena el
formulario con calma — y puede volver a corregirlo.

---

## Puesta en marcha (modo prueba)

### 1. Las claves

Dashboard → arriba a la derecha activa **Modo de prueba** → Desarrolladores →
Claves de API. Pégalas en `.env` (está en `.gitignore`):

```
STRIPE_SECRET_KEY="sk_test_…"
STRIPE_PUBLISHABLE_KEY="pk_test_…"
```

> Mientras `STRIPE_SECRET_KEY` esté vacío el botón de pago no aparece y el CTA
> cae al enlace de WhatsApp. Nada se rompe.

### 2. El webhook en local

Stripe no puede llamar a `localhost`, así que hace falta el túnel de su CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Imprime un `whsec_…`. A `.env`:

```
STRIPE_WEBHOOK_SECRET="whsec_…"
```

Reinicia `npm run dev` — las variables se leen al arrancar.

### 3. Probar

Tarjetas de prueba (cualquier fecha futura, cualquier CVC, cualquier código postal):

| Caso | Número |
|---|---|
| Pago correcto | `4242 4242 4242 4242` |
| Pide 3D Secure | `4000 0025 0000 3155` |
| Rechazada | `4000 0000 0000 9995` |

Qué comprobar:

1. El botón lleva a `checkout.stripe.com`.
2. Tras pagar vuelves a `/bootcamp/confirmacion` con los cuatro pasos.
3. En la terminal de `stripe listen` aparece `checkout.session.completed`.
4. La fila existe: `SELECT * FROM "BootcampRegistration" ORDER BY "createdAt" DESC LIMIT 1;`
5. Envías el formulario → `profileComplete = true` y los nombres guardados.
6. Cancelar en Stripe devuelve a `/bootcamp?pago=cancelado` con el aviso ámbar.

---

### Probar el webhook sin clave y sin CLI

```bash
npm run stripe:verificar
```

`constructEvent` es criptografía local: no llama a la API de Stripe. Así que el
manejador se puede verificar entero sin ninguna clave real. El script firma
eventos con `generateTestHeaderString` y comprueba seis cosas — firma válida,
inscripción guardada, idempotencia, firma manipulada, firma ausente y reembolso —
y borra sus propias filas al terminar.

Necesita el servidor levantado y un `STRIPE_WEBHOOK_SECRET` cualquiera en `.env`
(el que quieras: sólo tiene que coincidir consigo mismo).

> Lo que esto **no** cubre: la entrega real desde Stripe. Eso lo verifica
> `stripe listen` en local y el endpoint del dashboard en producción.

---

## Pasar a producción

En este orden, no antes:

- [ ] El flujo entero validado en prueba, incluido el webhook.
- [ ] **Rotar la clave `sk_live_` actual** — se expuso en un chat, hay que darla
      por comprometida. Dashboard → Desarrolladores → Claves de API → Rotar.
- [ ] `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` de producción en las
      variables de entorno del hosting (nunca en un archivo del repo).
- [ ] `NEXT_PUBLIC_SITE_URL="https://comunidad.starbizacademy.com"` — sin esto las URLs de vuelta apuntan
      a `localhost`.
- [ ] Endpoint de webhook real: Dashboard → Desarrolladores → Webhooks →
      *Añadir endpoint* → `https://comunidad.starbizacademy.com/api/stripe/webhook`.
      Eventos: `checkout.session.completed` y `charge.refunded`.
      Copia su `whsec_…` a la variable de producción (es **distinto** del de local).
- [ ] Un pago real de $250 con tarjeta propia y su reembolso, para ver los dos
      caminos de punta a punta.

Al arrancar con una clave `sk_live_`, la consola avisa en grande. Es a propósito.

---

## Decisiones que conviene no deshacer sin pensarlo

**El importe se fija en el servidor** (`BOOTCAMP_PRICE_CENTS` en
`src/lib/stripe.ts`). El cliente no envía precio en ningún momento; si lo
hiciera, cualquiera podría pagar 1 céntimo editando la petición.

**El webhook verifica la firma contra el cuerpo CRUDO** (`req.text()`). Si se
parsea a JSON antes, la firma deja de cuadrar. Sin esa verificación, cualquiera
que conozca la URL podría inyectar un "pago completado" falso.

**`/api/bootcamp/registro` consulta a Stripe**, no se fía del `sessionId` que
manda el navegador. Sin esa consulta, un `sessionId` inventado crearía
inscripciones falsas.

**El precio va como `price_data` en línea**, no apuntando a un Price creado en
la cuenta: el mismo código funciona en prueba y en producción sin provisionar
nada. Cuando el flujo esté rodado se puede promover a un Product/Price de verdad
para tener mejores informes en el dashboard.

---

## Archivos

| Archivo | Qué hace |
|---|---|
| `src/lib/stripe.ts` | Cliente, precio, `siteUrl()`, aviso de modo producción |
| `src/app/api/bootcamp/checkout/route.ts` | Crea la sesión de pago |
| `src/app/api/stripe/webhook/route.ts` | Fuente de verdad del pago |
| `src/app/api/bootcamp/registro/route.ts` | Guarda los datos de las cartas |
| `src/app/bootcamp/confirmacion/page.tsx` | Vuelta del pago + siguientes pasos |
| `src/components/bootcamp/CheckoutButton.tsx` | Botón de pago |
| `src/components/bootcamp/LetterForm.tsx` | Formulario post-pago |
| `prisma/schema.prisma` → `BootcampRegistration` | Tabla de inscripciones |
