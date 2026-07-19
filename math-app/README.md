# Ruby Moon Maths 🌙✨

App web para aprender matemáticas, creada especialmente para Ruby (7 años).
Funciona en el navegador (móvil, tablet u ordenador), no necesita instalación,
conexión a internet ni servidor: son solo archivos HTML, CSS y JavaScript.

## Cómo abrirla

**Opción más simple (un solo archivo):** haz doble clic en
`ruby-moon-maths-standalone.html`. Es la app entera —HTML, CSS, JS y
tipografía— empaquetada en un único archivo portable, sin dependencias
externas ni conexión a internet. Ábrelo con cualquier navegador (Chrome,
Safari, Edge...) en el móvil, tablet u ordenador.

**Opción para desarrollo (archivos separados):** haz doble clic en
`index.html`.

**Opción recomendada (mejor compatibilidad, sobre todo en móvil):** sirve la
carpeta con un servidor local:

```bash
cd math-app
python3 -m http.server 8080
```

Y abre `http://localhost:8080` en el navegador.

## Publicarla en internet (opcional)

Al ser una app 100% estática, puedes subirla gratis a GitHub Pages, Netlify o
Vercel simplemente arrastrando la carpeta `math-app/`. No requiere backend ni
base de datos.

## Qué incluye

- **6 juegos**: Sumas, Restas, Multiplicar, Comparar (`<`, `>`, `=`), Contar
  objetos y Formas geométricas.
- **3 niveles de dificultad** (Fácil / Medio / Difícil) por juego, que se van
  desbloqueando según el progreso para acompañar el aprendizaje.
- **Apoyo visual**: en los niveles fáciles las sumas/restas/conteo se muestran
  con dibujos (emojis) para contar, no solo números.
- **Respuestas de opción múltiple** con botones grandes, pensado para que
  Ruby juegue sola sin necesitar teclado.
- **Ánimo personalizado con su nombre**: la mascota anima a Ruby por su
  nombre en el saludo, al acertar o fallar cada pregunta, en los resultados
  de cada ronda y al ganar una insignia.
- **Sonidos y animaciones** (generados por código, sin archivos de audio) al
  acertar, fallar o completar una ronda, más confeti al terminar bien.
- **Estrellas, insignias y mascota personalizable** para motivar sin depender
  de premios externos.
- **Progreso guardado en el dispositivo** (localStorage): avatar, estrellas,
  mejores puntuaciones e insignias por juego.
- **Zona de familia** (icono ⚙️ en la esquina): protegida con una pequeña
  cuenta (multiplicación) para que solo un adulto entre. Desde ahí se ve el
  progreso por juego, se puede silenciar el sonido o borrar el progreso.

## Estructura

```
math-app/
├── ruby-moon-maths-standalone.html   Todo en un archivo (recomendado para abrir directamente)
├── index.html                         Estructura de todas las pantallas
├── css/style.css                       Estilos (colores, animaciones, responsive)
└── js/
    ├── sound.js                         Efectos de sonido (Web Audio API)
    ├── confetti.js                       Animación de confeti (canvas)
    ├── questions.js                       Generador de preguntas por juego/dificultad
    └── app.js                           Lógica de la app: pantallas, partidas, progreso
```

`ruby-moon-maths-standalone.html` se genera a partir de los archivos
anteriores incrustando el CSS, el JS y la tipografía. Si editas
`index.html`/`css`/`js`, regenera ese archivo antes de volver a
compartirlo (no se actualiza solo).

No hay dependencias externas que instalar (solo una tipografía opcional de
Google Fonts que, si no hay internet, cae a una tipografía del sistema sin
romper nada).
