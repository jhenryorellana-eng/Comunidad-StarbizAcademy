# Prompts para nano banana — Bootcamp Utah 2027

> **Decidido con el usuario:** los cuatro días llevan **fotos reales con
> adolescentes** — un padre compra la imagen de su hijo allí, no un paisaje
> vacío. Ver `docs/imagenes-bootcamp.md`.
>
> Estos prompts sirven para la **capa atmosférica**: la portada (nº 1 y 1b) y
> la banda de cierre (nº 6), que van al 45% y al 35% de opacidad bajo velos
> navy haciendo de escenario. Ahí la ilustración funciona muy bien.
>
> Los prompts 2 a 5 quedan como **respaldo**, por si algún día concreto no
> consigues una foto adecuada. Pero la opción buena es siempre la foto.

> ### Regla permanente: TODO tiene que oler a Utah
>
> El producto no es "un viaje", es **Utah**. Si una imagen podria ser de
> cualquier sitio, se pierde justo lo que se vende.
>
> El ancla visual es la **cordillera Wasatch**: se levanta de golpe sobre el
> valle y se ve desde Provo, Salt Lake, Lehi y Park City. Tiene que aparecer
> —de fondo, por una ventana, cerrando la calle— en todas las imagenes que lo
> permitan. Nieve en las cumbres, valle amplio, cielo limpio de invierno.
>
> Eso da identidad geografica sin inventar edificios concretos, que es la linea
> que no se cruza.

Generados con **Gemini 2.5 Flash Image (nano banana)**.

---

## Antes de empezar: tres cosas prácticas

**1 · Resolución.** Nano banana entrega alrededor de **1024 px en el lado
largo**. Ninguna de las imágenes que necesitas sale directamente del modelo:

| Destino | Generar en | Después |
|---|---|---|
| Portada escritorio 2560×1200 | 16:9 | Ampliar ×2,5 y recortar altura |
| **Portada móvil 1080×1440** | **3:4** | **Ampliar ×1,4** |
| Días 1, 2 y 4 · 1920×1080 | 16:9 | Ampliar ×1,9 |
| Día 3 · 1920×1080 | 16:9 | Ampliar ×1,9 (el recorte a 21:9 lo hace el CSS) |
| Cierre 2400×800 | 16:9 | Ampliar ×2,5 y recortar a 3:1 |

Para ampliar: Upscayl (gratis, local), Topaz Gigapixel, o el reescalado de
Photoshop. Como van a opacidad reducida bajo velos de color, el reescalado se
nota poco.

**2 · Coherencia del conjunto.** Es lo que más va a costar. Dos trucos:

- Pega **el mismo párrafo de estilo** (abajo) al principio de los seis prompts.
- Genera primero el Día 1. Cuando te guste, **adjúntalo como imagen de
  referencia** en los cinco siguientes y añade: *"Mantén exactamente el mismo
  estilo de ilustración, paleta y tratamiento de luz que la imagen de
  referencia."* Nano banana es bueno en esto.

**3 · Por qué ilustración y no foto.** Una foto realista de BYU o de Adobe
generada por IA afirma que tu hijo visitará ese sitio exacto. Una ilustración
editorial no lo afirma: comunica el concepto sin fingir un documento. Además es
lo que ya hace tu logo. **Cuando tengas fotos reales de la primera edición,
sustituyen a estas.**

---

## Párrafo de estilo — pégalo al inicio de los seis

```
Ilustración digital editorial de alta calidad, estilo vectorial limpio con
degradados amplios, luz volumétrica suave y un grano fino apenas perceptible.
Sin contornos negros. Paleta estricta y limitada: azul marino profundo #1a2744
y #0a1020 como base, cian brillante #22d3ee para las luces y reflejos, dorado
#fbbf24 para los acentos cálidos. Atmósfera nocturna o de última luz del día,
serena y aspiracional. Sin texto, sin letras, sin números, sin logotipos, sin
marcas de agua. Sin rostros identificables.
```

---

## 1 · Fondo de portada — `hero-utah.jpg` · generar 16:9

El texto vive en la mitad izquierda: ese lado tiene que quedar despejado.

```
[PÁRRAFO DE ESTILO]

Escena: una cordillera nevada extensa vista desde lejos al anochecer, con el
cielo ocupando la mayor parte del encuadre. Las montañas se sitúan únicamente
en el tercio inferior derecho de la imagen; los dos tercios izquierdos son
cielo abierto y despejado, sin ningún elemento. En el cielo, las primeras
estrellas y un degradado que va del azul marino profundo arriba al turquesa
tenue cerca del horizonte. Una única estela de luz muy fina cruzando el cielo
en diagonal, como un cometa lejano, en cian. La nieve de las cumbres recoge un
reflejo dorado de la última luz.

Composición panorámica muy ancha, mucho aire, sensación de amplitud y calma.
Nada de edificios, carreteras, vehículos ni personas.
```

---

## 1b · Portada en móvil — `hero-utah-movil.jpg` · generar 3:4

**No es la misma imagen recortada.** En móvil la portada es vertical, y un
apaisado con `object-cover` recortaría al centro, tirando por tierra la
composición. Aquí el aire despejado tiene que estar **arriba**, no a la
izquierda, porque el texto cae en la mitad superior.

```
[PÁRRAFO DE ESTILO]

Escena vertical: una cordillera nevada vista desde lejos al anochecer, situada
únicamente en el TERCIO INFERIOR del encuadre. Los dos tercios superiores son
cielo abierto y despejado, sin ningún elemento: un degradado que va del azul
marino profundo en lo alto al turquesa tenue justo sobre las cumbres, con las
primeras estrellas repartidas por la parte alta.

Una estela de luz muy fina cruzando el cielo en diagonal, como un cometa
lejano, en cian, situada en el tercio central. La nieve de las cumbres recoge
un reflejo dorado de la última luz.

Formato vertical alto (retrato). Composición con mucho aire en la mitad
superior, sensación de amplitud y calma. Nada de edificios, carreteras,
vehículos ni personas.
```

---

## 2 · Día 1 · Universidades — `dia-1-campus.jpg` · generar 16:9

Genera este primero y úsalo de referencia para el resto.

```
[PÁRRAFO DE ESTILO]

Escena: un campus universitario genérico en invierno, visto desde una avenida
arbolada. Edificios de arquitectura académica sobria y atemporal al fondo,
sencillos y sin rasgos que identifiquen a ninguna institución concreta. Árboles
sin hojas con nieve fina en las ramas. Un camino ancho de piedra que avanza
hacia el centro de la imagen y guía la mirada hacia los edificios. Al fondo, la
silueta de montañas nevadas.

Luz de media tarde de invierno, cálida y baja, contrastando con las sombras
azuladas de la nieve. Ventanas de los edificios iluminadas en dorado tenue,
sugiriendo actividad dentro.

Sin personas, sin banderas, sin escudos, sin carteles, sin nombres de
universidad. Composición horizontal equilibrada con profundidad.
```

---

## 3 · Día 2 · Silicon Slopes — `dia-2-silicon-slopes.jpg` · generar 16:9

```
[PÁRRAFO DE ESTILO]

Escena: un corredor tecnológico moderno al anochecer, al pie de una cadena
montañosa nevada. Varios edificios corporativos contemporáneos de vidrio y
líneas rectas, de tamaño medio y diseño genérico, con sus fachadas reflejando
el cielo del atardecer. Las ventanas iluminadas desde dentro en cian tenue.
Detrás, las montañas nevadas dominando el horizonte y recortándose contra el
cielo azul marino.

En primer plano, un espacio abierto despejado. La composición debe transmitir
que la tecnología y la montaña conviven en el mismo sitio.

Sin logotipos, sin nombres de empresa, sin carteles, sin vehículos
identificables, sin personas. Formato horizontal amplio.
```

---

## 4 · Día 3 · Ceremonia Star App — `dia-3-ceremonia.jpg` · generar 16:9

El día protagonista. **Se entrega en 16:9 y no se recorta**: el CSS la muestra
16:9 en móvil y recortada a 21:9 en escritorio. Por eso el prompt pide aire
sobre el trofeo — es justo la franja que desaparece en pantalla grande.

```
[PÁRRAFO DE ESTILO]

Escena: el escenario de una ceremonia de premios vista de frente y desde media
distancia, en penumbra. Un haz de luz cálida y dorada cae vertical desde arriba
sobre un pequeño trofeo con forma de estrella de cuatro puntas, situado sobre un
pedestal sencillo en el centro del escenario. El haz genera luz volumétrica
visible en el aire.

A ambos lados, focos laterales en cian recortando el escenario. En primer plano
y muy desenfocadas, siluetas oscuras de público de espaldas, sin ningún rasgo
reconocible, ocupando sólo la franja inferior.

Mucho aire por encima del trofeo: la parte superior del encuadre es penumbra
casi vacía. Atmósfera solemne y emocionante, no de fiesta.

Estilo claramente ilustrado, NO fotorrealista. Sin texto, sin logotipos, sin
pantallas, sin rostros.
```

---

## 5 · Día 4 · Utah en invierno — `dia-4-invierno.jpg` · generar 16:9

```
[PÁRRAFO DE ESTILO]

Escena: una calle principal de pueblo de montaña en invierno, al caer la tarde.
Edificios bajos de dos plantas a ambos lados, de arquitectura sencilla de
montaña, con nieve acumulada en tejados y aceras. Guirnaldas de luces cálidas
cruzando la calle de lado a lado. Al fondo, cerrando la perspectiva, una
montaña nevada de gran tamaño.

Cielo de anochecer en azul marino con las primeras estrellas. La nieve del suelo
refleja el dorado de las luces de la calle y el cian del cielo.

Sin personas, sin coches, sin carteles ni rótulos comerciales, sin texto.
Composición en perspectiva central, la calle guiando hacia la montaña.
```

---

## 6 · Banda de cierre — `cierre-grupo.jpg` · generar 16:9, recortar a 3:1

Va al 35% de opacidad bajo un velo navy: es **textura**, no debe competir.

```
[PÁRRAFO DE ESTILO]

Escena: textura atmosférica abstracta de cielo nocturno de alta montaña, muy
desenfocada y de bajo contraste. Brumas suaves de color difuminándose unas en
otras sobre el azul marino profundo: una zona cian en la parte izquierda, una
insinuación magenta muy tenue en la derecha, un rastro dorado cerca del borde
inferior. Puntos de estrella diminutos y dispersos, sin formar constelaciones.

Sin ningún punto de interés marcado, sin formas reconocibles, sin horizonte
definido, sin edificios, sin personas, sin texto. Debe funcionar como fondo
detrás de texto blanco: uniforme, tranquila y sin zonas de alto contraste.
```

---

---

## Por qué sólo la portada lleva dos versiones

| Hueco | ¿Dos versiones? | Motivo |
|---|---|---|
| Portada | **Sí** | Apaisada en escritorio, vertical en móvil: son dos encuadres distintos, no un recorte |
| Días 1, 2 y 4 | No | 16:9 se lee bien en ambos anchos |
| Día 3 | No | Un solo 16:9; el recorte a 21:9 en escritorio lo hace el CSS |
| Cierre | No | Es textura abstracta al 35%: da igual por dónde recorte |

Duplicar los seis sería trabajo doble sin ganancia. Sólo se duplica donde la
proporción del contenedor cambia de verdad.

---

## Comprobación antes de subirlas

1. **¿Se lee el texto encima?** Pruébalo en las DOS portadas: en escritorio el
   titular cae a la izquierda, en móvil arriba. Si compite, oscurece la foto o
   desplaza el interés visual.
2. **¿Parecen del mismo conjunto?** Ponlas las seis juntas. Si una desentona,
   regenérala usando otra como referencia.
3. **Peso**: exporta a JPG calidad 82 y comprueba que no pasa de los máximos de
   `docs/imagenes-bootcamp.md`.
4. **Sin texto colado.** Los modelos de imagen a veces inventan letras. Repasa
   carteles, fachadas y pantallas.

---

# PARTE 2 · Fotos realistas con adolescentes

Estas son las que van al frente de cada día (campo `photo`). Su trabajo es que
un padre **vea a su hijo ahí dentro**.

## Tres reglas de encuadre que importan

**1 · Adolescentes latinos de 14 a 18 años.** Vuestras familias son
latinoamericanas: el chico de la foto tiene que parecerse a su hijo. Es lo que
más afecta a que el padre proyecte.

**2 · Distancia media, nunca primer plano.** Grupos vistos de tres cuartos o de
espaldas, caras pequeñas o parcialmente fuera de foco. Dos motivos: los
primeros planos generados por IA son los que más cantan, y así no se fabrican
personas concretas identificables.

**3 · Luz natural y gesto espontáneo.** Nada de sonrisas a cámara ni pose de
catálogo. Que parezca que alguien pasaba por ahí con el móvil.

> **Al publicarlas**: sin pie de foto que diga "nuestros estudiantes". Evocan la
> experiencia, no la documentan. En cuanto tengas fotos de enero de 2027,
> sustitúyelas.

---

## Párrafo de realismo — pégalo al inicio de las cuatro

```
Fotografía documental realista tomada en Utah, Estados Unidos, en pleno
invierno. Al fondo, siempre que la escena lo permita, las montañas nevadas de
la cordillera Wasatch levantándose de forma abrupta sobre un valle amplio, bajo
el cielo azul y limpio propio del invierno de Utah.

Luz natural de día claro, aspecto de cámara sin retoque
publicitario. Profundidad de campo suave, grano fotográfico fino, colores
naturales y ligeramente fríos. Adolescentes latinoamericanos de 14 a 18 años,
grupo diverso y mixto, ropa de invierno corriente y actual. Vistos a distancia
media o de tres cuartos, rostros pequeños en el encuadre o parcialmente fuera
de foco, nunca en primer plano. Gestos espontáneos, nadie posando ni mirando a
cámara. Sin texto, sin logotipos, sin marcas visibles en la ropa.
```

---

## A · Día 1 · Universidades — `dia-1-foto.jpg` · 16:9

```
[PÁRRAFO DE REALISMO]

Escena: un grupo de seis o siete adolescentes camina por una avenida de campus
universitario en un día de invierno, siguiendo a una persona adulta que va
delante señalando un edificio. Se les ve de espaldas y de tres cuartos,
avanzando en la misma dirección que la cámara. Llevan mochilas y abrigos.
Árboles sin hojas a los lados, restos de nieve en el césped, edificios
académicos de ladrillo claro al fondo, algo desenfocados.

CLAVE UTAH: por encima de los edificios, dominando el horizonte, las cumbres
nevadas de la cordillera Wasatch, muy cercanas y empinadas, tal como se ven
desde cualquier punto del valle de Utah. Es lo que sitúa la escena.

Luz de media mañana, fría y clara. Uno de los chicos mira hacia arriba, hacia
la fachada. Ambiente de curiosidad, no de excursión.
```

---

## B · Día 2 · Empresa tecnológica — `dia-2-foto.jpg` · 16:9

```
[PÁRRAFO DE REALISMO]

Escena: un grupo de adolescentes de pie dentro de una oficina tecnológica
moderna y luminosa, escuchando a una persona adulta que les explica algo
señalando una pantalla grande. Se les ve desde atrás y de lado, en semicírculo.
Espacio abierto con mesas de trabajo desenfocadas al fondo.

CLAVE UTAH: la pared del fondo es un ventanal de suelo a techo por el que se
ven, muy cerca y nevadas, las montañas de la cordillera Wasatch bajo un cielo
de invierno despejado. Ese contraste entre oficina de vidrio y montaña nevada
es la firma visual de Silicon Slopes, en Lehi.

Dos de ellos se inclinan hacia adelante para ver mejor. Ambiente de visita real
a un sitio donde se trabaja, no de aula. Sin logotipos ni nombres de empresa en
ninguna superficie ni pantalla.
```

---

## C · Día 3 · Ceremonia Star App — `dia-3-foto.jpg` · 16:9

Deja aire arriba: en escritorio se recorta a 21:9.

> **Si tu primera versión fue rechazada, era por esto.** Pedía *"una adolescente
> de unos dieciséis años, de cuerpo entero"*: una menor identificada
> individualmente, en fotorrealista. Ese es el patrón que bloquean todos los
> modelos de imagen. Los otros tres prompts pasan porque describen grupos de
> espaldas y a distancia.
>
> Esta versión resuelve el bloqueo **y mejora la foto**: la figura pasa a ser
> una silueta a contraluz contra el ventanal, pequeña en el encuadre. Más
> cinematográfico que verle la espalda, y sin pedirle al modelo que fabrique
> una menor concreta.

```
[PÁRRAFO DE REALISMO]

Escena: vista desde el fondo de una sala, por encima de las cabezas del público.
En primer plano, muy desenfocadas y en penumbra, las siluetas del público
sentado ocupando el tercio inferior. Al fondo, un escenario bajo y sencillo
donde dos figuras humanas aparecen recortadas a CONTRALUZ, en silueta oscura y
sin rasgos visibles, en el momento de un apretón de manos y la entrega de un
pequeño objeto. Las figuras son pequeñas dentro del encuadre.

CLAVE UTAH: detrás del escenario, un gran ventanal de suelo a techo por el que
entra la última luz del día. Es esa luz la que recorta las siluetas. A través
del cristal se ven, nevadas y muy próximas, las montañas de la cordillera
Wasatch al atardecer, con el cielo pasando del dorado al azul.

Espacio vacío por encima de la escena. Ambiente de emoción contenida y silencio,
no de fiesta. Sin pantallas, sin carteles, sin texto de ningún tipo.
```

*Si aun así se resiste:* quita del párrafo de realismo la frase
`Adolescentes latinoamericanos de 14 a 18 años...` para este prompt concreto.
En una escena de siluetas no aporta nada y es el resto del disparador.

---

### Alternativa · sin ninguna persona en el escenario

Si prefieres no arriesgarte, esta funciona igual de bien y no tiene bloqueo
posible. Cuenta el momento **justo después**:

```
Fotografía documental realista tomada en Utah, Estados Unidos, en invierno. Luz
natural mezclada con luz de sala. Aspecto de cámara sin retoque publicitario,
grano fotográfico fino, colores naturales y ligeramente fríos.

Escena: un escenario bajo y vacío visto desde el fondo de la sala. Sobre un
pedestal sencillo en el centro, un pequeño trofeo con forma de estrella,
iluminado por un foco cálido desde arriba. El escenario está desierto: el
momento acaba de pasar. En primer plano, muy desenfocadas y en penumbra, unas
pocas siluetas de respaldos de sillas vacías.

CLAVE UTAH: detrás del escenario, un gran ventanal de suelo a techo con las
montañas nevadas de la cordillera Wasatch al atardecer, el cielo pasando del
dorado al azul profundo.

Espacio vacío por encima del trofeo. Atmósfera de calma después de un momento
importante. Sin personas, sin pantallas, sin carteles, sin texto.
```

---

## D · Día 4 · Utah en invierno — `dia-4-foto.jpg` · 16:9

```
[PÁRRAFO DE REALISMO]

Escena: un grupo de adolescentes caminando por la calle de un pueblo de montaña
cubierto de nieve, al final de la tarde. Se les ve a distancia media, de
espaldas y en movimiento, dispersos de forma natural. Abrigos, gorros y
bufandas. Uno se agacha a tocar la nieve, otro señala hacia la montaña del
fondo.

CLAVE UTAH: es la calle principal de un pueblo minero histórico de montaña
tipo Park City. Calle empinada, flanqueada por edificios bajos de finales del
siglo XIX en madera y ladrillo pintados en colores apagados, con fachadas de
dos plantas y porches — la arquitectura característica de los pueblos mineros
de Utah. Guirnaldas de luces cálidas cruzando la calle y, cerrando la
perspectiva, una ladera de estación de esquí nevada. Luz dorada de última
hora contrastando con el azul de la nieve en sombra.
```

---

## Comprobación de estas cuatro

1. **¿Se ve alguna cara nítida y reconocible?** Si sí, regenera pidiendo más
   distancia — no queremos fabricar personas concretas.
2. **¿Podrían ser hijos de tus familias?** Si el grupo no se parece a vuestro
   público, el padre no proyecta.
3. **¿Hay manos raras?** Es el fallo clásico. Revisa dedos y guantes.
4. **¿Se coló texto?** Carteles, pantallas, ropa.
