import Image from "next/image";
import { cn } from "@/components/ui";

/* ===========================================================================
   EL LOGO Y SU ATMÓSFERA — Núcleo de energía

   El reto eran dos fallos opuestos: al difuminar el logo SE PERDÍA, y al
   ponerle borde o marco se veía SOBREPUESTO.

   La solución no está en el borde, está en la LUZ. El arte se queda nítido y
   entero al 100% —sin máscara, sin fundido, sin mezcla— y lo que se construye
   es que la atmósfera EMANE de él: el resplandor sale de su propia paleta y
   decae en anillos concéntricos. Cuando la física de la luz es coherente, el
   ojo acepta el objeto como parte de la escena aunque tenga el canto definido.

   La pieza clave es el REMATE DE LUZ del canto: un filo claro por dentro y una
   sombra por abajo convierten la transición de «imagen contra cielo» en «luz
   contra sombra», que es como se integra un objeto real.

   Sin JavaScript: el pulso usa la animación CSS `animate-led` que ya existe en
   globals.css, así que el componente se renderiza en servidor.
=========================================================================== */

/* Paleta del propio arte + brand system oficial (#CF116D magenta, #523FFF violeta). */
const GLOW_RINGS = [
  { inset: "-inset-4", blur: "blur-xl", magenta: 0.55, violet: 0.44 },
  { inset: "-inset-10", blur: "blur-2xl", magenta: 0.34, violet: 0.27 },
  { inset: "-inset-20", blur: "blur-3xl", magenta: 0.2, violet: 0.16 },
];

export function BannerLogo() {
  return (
    <div className="relative shrink-0">
      {/* Anillos concéntricos: la luz decae desde el núcleo, y eso es lo que
          hace que el aire de alrededor se lea como suyo y no como un fondo
          ajeno sobre el que se ha pegado algo. */}
      {/* IGNICIÓN: los anillos nacen de un punto y se expanden, de dentro a
          fuera. Es el golpe de luz que abre la escena. */}
      {GLOW_RINGS.map((r, i) => (
        <span
          key={r.inset}
          className={cn("animate-ignite pointer-events-none absolute rounded-full", r.inset, r.blur)}
          style={{
            animationDelay: `${i * 110}ms`,
            background: `radial-gradient(circle, rgba(207,17,109,${r.magenta}) 0%, rgba(82,63,255,${r.violet}) 45%, transparent 72%)`,
          }}
          aria-hidden
        />
      ))}

      {/* Anillo de contención: entra con la luz y luego respira muy despacio. */}
      <span
        className="animate-ignite pointer-events-none absolute -inset-6 rounded-full"
        style={{ animationDelay: "330ms" }}
        aria-hidden
      >
        <span className="animate-led absolute inset-0 rounded-full border border-cyan-bright/20" />
      </span>

      {/* El arte, nítido y al 100%. */}
      <div
        className="animate-ignite relative h-40 w-40 overflow-hidden rounded-full sm:h-52 sm:w-52"
        style={{ animationDelay: "120ms" }}
      >
        <Image
          src="/brand/starbiz-logo.png"
          alt="Starbiz Academy"
          width={220}
          height={220}
          priority
          className="h-full w-full scale-[1.05] object-cover"
        />
        {/* Remate de luz: filo claro arriba, sombra abajo. */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 8px 26px -8px rgba(200,240,255,0.55), inset 0 -10px 26px -10px rgba(10,16,32,0.55)",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}
