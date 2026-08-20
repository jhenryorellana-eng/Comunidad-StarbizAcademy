import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Guarda la reserva ANTES de mandar a pagar.
 *
 * El bootcamp se vende solo: alguien llega desde un anuncio, rellena y compra,
 * sin cuenta de por medio. Por eso esta ruta es pública.
 *
 * SE GUARDA PRIMERO Y SE COBRA DESPUÉS, y no al revés. Si la fila naciera en el
 * webhook, todo el que rellena el formulario y no llega a pagar se perdería —
 * y ése es precisamente el contacto que hay que llamar: ya dio el nombre de su
 * hijo, su correo y dónde vive. La inscripción arranca en PENDING y el pago la
 * mueve a PAID.
 *
 * Se pide FECHA DE NACIMIENTO, no edad. La carta de invitación y el consulado
 * usan la del pasaporte, y una edad guardada caduca sola en unos meses.
 */
const Reserva = z.object({
  participantName: z.string().trim().min(3).max(120),
  participantBirthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documentId: z.string().trim().min(4).max(40),
  nationality: z.string().trim().min(2).max(60),
  address: z.string().trim().min(5).max(200),
  residence: z.string().trim().min(2).max(120),
  academicLevel: z.enum(["PRIMARIA", "SECUNDARIA"]),
  email: z.string().trim().email().max(160),
  payerName: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(6).max(30).optional().or(z.literal("")),
  companionName: z.string().trim().min(3).max(120).optional().or(z.literal("")),
});

/** Edad cumplida a partir de la fecha de nacimiento. */
function edadDe(fecha: Date): number {
  const hoy = new Date();
  let a = hoy.getUTCFullYear() - fecha.getUTCFullYear();
  const m = hoy.getUTCMonth() - fecha.getUTCMonth();
  if (m < 0 || (m === 0 && hoy.getUTCDate() < fecha.getUTCDate())) a--;
  return a;
}

export async function POST(req: Request) {
  const parsed = Reserva.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Faltan datos o alguno no es válido.", detalle: parsed.error.issues[0]?.path },
      { status: 400 },
    );
  }
  const d = parsed.data;

  const nacimiento = new Date(`${d.participantBirthdate}T00:00:00Z`);
  if (Number.isNaN(nacimiento.getTime())) {
    return NextResponse.json({ error: "Fecha de nacimiento no válida." }, { status: 400 });
  }

  // El bootcamp es para adolescentes. El tope se valida en el servidor porque
  // una fecha mal tecleada aquí acaba en una carta que el consulado rechaza.
  const edad = edadDe(nacimiento);
  if (edad < 10 || edad > 19) {
    return NextResponse.json(
      { error: `Según esa fecha tendría ${edad} años. El bootcamp es para adolescentes.` },
      { status: 400 },
    );
  }

  // Si quien reserva resulta estar dentro de la plataforma, se ata. Pero no se
  // exige: el 90% llegará desde un anuncio, sin sesión.
  const session = await getSession().catch(() => null);

  const reserva = await prisma.bootcampRegistration.create({
    data: {
      status: "PENDING",
      participantName: d.participantName,
      participantBirthdate: nacimiento,
      documentId: d.documentId,
      nationality: d.nationality,
      address: d.address,
      residence: d.residence,
      academicLevel: d.academicLevel,
      email: d.email.toLowerCase(),
      payerName: d.payerName,
      phone: d.phone || null,
      companionName: d.companionName || null,
      parentId: session?.sub ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ id: reserva.id }, { status: 201 });
}
