# Imágenes del Bootcamp Utah 2027

Todo se configura en `src/lib/bootcamp.ts`:

- Días → campos `art` y `photo` de cada entrada de `BOOTCAMP_DAYS`
- Portada y cierre → objeto `BOOTCAMP_MEDIA`

**Las ilustraciones ya están puestas en el código.** Sólo faltan los archivos en
`public/bootcamp/`. Las fotos con personas se añaden después, en `photo`.

```ts
// Cada día admite las dos capas a la vez
art:   { src: "/bootcamp/dia-1-campus.jpg", alt: "Campus universitario nevado al atardecer" },
photo: { src: "/bootcamp/dia-1-foto.jpg",   alt: "Adolescentes recorriendo un campus con un guía" },
```

Cómo se comportan:

| Estado | Qué se ve |
|---|---|
| Sólo `art` | La ilustración es la imagen de la tarjeta |
| `art` + `photo` | La **foto manda**; la ilustración pasa al fondo al 7% dando ambiente |
| Ninguna | La tarjeta se ve como antes, sin hueco |

---

## El principio que manda

**Un padre no compra un viaje: compra la imagen mental de su hijo allí.**

Por eso las cuatro fotos de los días tienen que llevar **personas de la edad de
su hijo**, no edificios bonitos ni paisajes vacíos. Un campus desierto informa;
un grupo de adolescentes caminando ese campus hace que el padre proyecte.

Eso reparte el trabajo en dos capas:

| Capa | Qué va | Campo | Dónde |
|---|---|---|---|
| **Documental** — personas | Adolescentes viviendo la escena | `photo` | Los 4 días |
| **Atmosférica** — decorado | Ilustración de marca | `art` · `BOOTCAMP_MEDIA` | Los 4 días, portada y cierre |

Las ilustraciones **no se sustituyen**: cuando llega la foto, la ilustración se
retira al fondo de la tarjeta al 7% y sigue dando ambiente. En portada y cierre
mandan siempre ellas, al 45% y al 35% bajo velos navy.

---

## Prioridad 1 · Vuestras propias fotos

Antes de licenciar nada: **¿hay fotos de la Cohorte Provo?** Talleres,
mentorías, chicos presentando sus proyectos, la sesión de StarEmpresa
analizando Tesla.

Eso es oro y no lo compra nadie:

- Son **vuestros** chicos, con vuestro ambiente
- El padre reconoce que el programa existe y ya está funcionando
- Cero riesgo de que la misma foto aparezca en la web de un competidor

Aunque no sean de Utah, funcionan: la del Día 3 —la ceremonia GÉNESIS i7— puede
ser perfectamente una foto de una sesión real de mentoría. Es el mismo
contenido, en otro sitio.

**Requisito legal**: si aparecen menores identificables necesitas
**autorización firmada del padre o tutor** para uso en web y redes. Guárdalas.

---

## Prioridad 2 · Banco de imágenes con adolescentes

Para lo que no tengáis. Busca chicos de **14 a 18 años**, luz natural, gesto
espontáneo — huye de lo que parezca catálogo corporativo.

| Día | Qué buscar | Términos |
|---|---|---|
| **1 · Universidades** | Grupo de adolescentes recorriendo un campus con un guía | `campus tour students`, `high school students university visit`, `college campus tour group winter` |
| **2 · Silicon Slopes** | Chicos en una oficina tecnológica, viendo pantallas o escuchando | `students tech company tour`, `teens visiting office`, `student group technology workshop` |
| **3 · Ceremonia** | Joven recibiendo un premio o presentando en escenario | `student award ceremony`, `teen pitching on stage`, `young entrepreneur presentation` |
| **4 · Invierno** | Grupo de adolescentes en la nieve, ambiente de montaña | `teenagers snow mountain town`, `students winter trip`, `group snowy main street` |

**Dónde**: Unsplash y Pexels (gratis, revisa licencia); Adobe Stock y Getty (de
pago, más variedad con menores y con derechos de imagen ya resueltos).

### La regla de honestidad

Una foto de banco **evoca la experiencia**; no documenta la vuestra.

- ✅ Foto de chicos en un campus, sin pie de foto
- ❌ Foto de banco con el pie *"nuestros estudiantes en BYU"*
- ❌ Cualquier montaje que dé a entender que ese grupo es una edición pasada

En cuanto tengas fotos de enero de 2027, **sustitúyelas todas**. A partir de ahí
lo real siempre gana.

---

## Lo que NO debe generarse con IA

**Personas.** Adolescentes fotorrealistas generados por IA para vender un
programa a padres es justo el tipo de imagen que destruye la confianza si
alguien lo nota — y hoy se nota.

**Lugares e instituciones reales.** BYU, Adobe, el Capitolio, Park City: foto
real o licenciada. Hay edificios y marcas reconocibles de por medio.

La IA se queda en la **capa atmosférica**: paisaje, textura, cielo. Ahí no
afirma nada sobre nadie.

---

## Especificaciones

Formato: **JPG calidad 82** o WebP. Next genera AVIF/WebP y los tamaños
responsivos solo — sube el original grande, no versiones pequeñas.

| Hueco | Archivo | Tamaño | Proporción | Peso máx. | Capa |
|---|---|---|---|---|---|
| Portada · escritorio | `hero-utah.jpg` | 2560 × 1200 | 2,13:1 | 350 KB | Atmósfera ✅ |
| Portada · móvil | `hero-utah-movil.jpg` | 1080 × 1440 | 3:4 | 300 KB | Atmósfera ✅ |
| Día 1 · ilustración | `dia-1-campus.jpg` | 1920 × 1080 | 16:9 | 400 KB | Atmósfera ✅ |
| Día 2 · ilustración | `dia-2-silicon-slopes.jpg` | 1920 × 1080 | 16:9 | 400 KB | Atmósfera ✅ |
| Día 3 · ilustración | `dia-3-ceremonia.jpg` | 1920 × 1080 | 16:9 | 400 KB | Atmósfera ✅ |
| Día 4 · ilustración | `dia-4-invierno.jpg` | 1920 × 1080 | 16:9 | 400 KB | Atmósfera ✅ |
| Día 1..4 · **foto** | `dia-N-foto.jpg` | 1920 × 1080 | 16:9 | 400 KB | **Personas** — pendiente |
| Banda de cierre | `cierre-grupo.jpg` | 2400 × 800 | 3:1 | 300 KB | Atmósfera ✅ |

✅ = ilustración ya generada, sólo falta dejar el archivo en `public/bootcamp/`.

Notas de encuadre:

- **Portada**: al 45% bajo un velo navy en diagonal. El texto vive en la mitad
  izquierda (escritorio) o arriba (móvil) → deja esa zona despejada.
- **Fotos con personas**: se muestran a plena opacidad y con recorte `cover`.
  **Deja aire alrededor de las caras** — un recorte 16:9 puede comerse los
  bordes según el ancho de pantalla.
- **Día 3** se entrega en 16:9: el CSS la recorta a 21:9 sólo en escritorio.
- **Cierre**: al 35% bajo navy, casi textura. No necesita nitidez.
- Todas llevan una franja cyan→dorado al pie que las ata a la pieza.

---

## Prompts

Sólo para la **capa atmosférica** —portada y cierre—: en
**`docs/prompts-nano-banana.md`**.

Los prompts de escena que había allí quedan como respaldo por si algún día
concreto no consigues foto adecuada. Pero la opción buena es siempre la foto
con personas.

---

## Texto alternativo

Accesibilidad y posicionamiento. Describe **lo que se ve**, no el concepto.

- ✅ `"Grupo de adolescentes recorriendo un campus universitario nevado con un guía"`
- ❌ `"Imagen del día 1"` · ❌ `"bootcamp"`

---

## Después de subirlas

1. Peso: `ls -la public/bootcamp/`
2. `npm run build` — Next avisa si alguna imagen es desproporcionada
3. Revisa las **dos** portadas: el titular debe seguir leyéndose sobre la foto
4. Comprueba que ningún recorte 16:9 corta caras
