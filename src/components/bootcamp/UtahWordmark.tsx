/**
 * UTAH — inscripción celeste sobre la portada del bootcamp.
 *
 * NO es un logotipo pegado encima del cielo. Es un topónimo grabado EN él, como
 * una carta estelar rotula una región: enorme, muy tenue, con el interletrado
 * muy abierto. A primera vista se lee como atmósfera; al mirarlo, brilla.
 *
 * Tres decisiones, y por qué:
 *
 * 1. LA LUZ VIENE DE DENTRO, NO DE UN RESPLANDOR.
 *    La respuesta fácil era blanco en negrita con `text-shadow`. En su lugar el
 *    relleno es un degradado recortado al texto que cae de blanco frío a
 *    transparente — la misma dirección de luz que tiene la nieve de los picos
 *    justo debajo. Así pertenece a la escena en vez de flotar sobre ella.
 *
 * 2. LAS ESTRELLAS SON LAS MISMAS DEL CIELO.
 *    Los destellos usan `star-halo`, la clase que ya puebla toda la portada. No
 *    se inventa un brillo nuevo para esta pieza: literalmente está hecha de las
 *    mismas estrellas. (Y esa animación ya se arregló para animar sólo opacidad
 *    y escala, no `box-shadow`, que obligaba a repintar cada fotograma.)
 *
 * 3. PESADA, NO FINA.
 *    Contraintuitivo pero medido: a opacidad baja una letra fina se pierde
 *    contra un cielo con estrellas. Una pesada aguanta y se lee monumental.
 *    Sora sólo llega a 400 por abajo, así que la elección era obligada y buena.
 *
 * Sin movimiento propio. Lo único que se mueve son los destellos, que ya
 * existían. Es la contención: una sola cosa viva.
 */
export function UtahWordmark() {
  // Posiciones dentro de la caja de la palabra, aproximadas a los trazos de
  // U-T-A-H. En porcentaje para que sigan cuadrando cuando el tamaño cambia
  // con el viewport.
  const destellos: Array<[string, string, number, string, number]> = [
    ["9%", "22%", 3, "rgba(255,255,255,0.95)", 0],
    ["33%", "12%", 2.5, "rgba(34,211,238,0.95)", 1.4],
    ["58%", "30%", 3.5, "rgba(255,255,255,0.9)", 0.7],
    ["71%", "70%", 2, "rgba(34,211,238,0.85)", 2.2],
    ["89%", "18%", 2.5, "rgba(255,255,255,0.9)", 1.9],
  ];

  return (
    <div
      className="
        pointer-events-none absolute inset-x-0 bottom-[27%] flex justify-center
        sm:inset-x-auto sm:bottom-[14%] sm:right-[7%] sm:justify-end
      "
      aria-hidden
    >
      <div className="relative">
        <span
          className="
            block select-none font-display font-extrabold uppercase leading-none
            text-transparent
          "
          style={{
            fontSize: "clamp(4.5rem, 21vw, 13rem)",
            letterSpacing: "0.16em",
            // El interletrado abierto deja un hueco muerto a la derecha de la
            // última letra; se compensa para que el bloque quede centrado.
            marginRight: "-0.16em",
            backgroundImage:
              "linear-gradient(178deg, rgba(255,255,255,0.96) 0%, rgba(233,248,255,0.82) 38%, rgba(190,235,250,0.5) 68%, rgba(34,211,238,0.14) 92%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            // Un filo blanquísimo de medio píxel: es lo que hace que la palabra
            // se lea grabada y no borrosa cuando el degradado se va apagando.
            // Va bajo porque el contorno NO sigue al degradado — al pie de las
            // letras el relleno ya es transparente y sólo queda el filo, que
            // sobre la nieve iluminada se leía como un dibujo vacío.
            WebkitTextStroke: "0.5px rgba(255,255,255,0.45)",
            // Un halo frío detrás, FIJO. Separa la palabra del cielo sin
            // apagarla y no cuesta nada: una sombra estática se pinta una vez.
            textShadow:
              "0 0 34px rgba(34,211,238,0.34), 0 0 90px rgba(10,16,32,0.55)",
          }}
        >
          Utah
        </span>

        {destellos.map(([left, top, size, color, delay], i) => (
          <span
            key={i}
            className="star-halo"
            style={
              {
                left,
                top,
                width: size,
                height: size,
                "--halo-color": color,
                "--halo-delay": `${delay}s`,
                "--halo-period": `${4.5 + i * 0.6}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
