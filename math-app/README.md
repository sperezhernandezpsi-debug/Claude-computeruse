# Matemágicas 🦄✨

App web para aprender matemáticas, pensada para niñas y niños de unos 7 años.
Funciona en el navegador (móvil, tablet u ordenador), no necesita instalación,
conexión a internet ni servidor: son solo archivos HTML, CSS y JavaScript.

## Cómo abrirla

**Opción más simple:** haz doble clic en `index.html` y se abrirá en el navegador.

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
- **Respuestas de opción múltiple** con botones grandes, pensado para que un
  niño de 7 años juegue solo/a sin necesitar teclado.
- **Sonidos y animaciones** (generados por código, sin archivos de audio) al
  acertar, fallar o completar una ronda, más confeti al terminar bien.
- **Estrellas, insignias y mascota personalizable** para motivar sin depender
  de premios externos.
- **Progreso guardado en el dispositivo** (localStorage): nombre, avatar,
  estrellas, mejores puntuaciones e insignias por juego.
- **Zona de familia** (icono ⚙️ en la esquina): protegida con una pequeña
  cuenta (multiplicación) para que solo un adulto entre. Desde ahí se ve el
  progreso por juego, se puede silenciar el sonido o borrar el progreso.

## Estructura

```
math-app/
├── index.html        Estructura de todas las pantallas
├── css/style.css      Estilos (colores, animaciones, responsive)
└── js/
    ├── sound.js        Efectos de sonido (Web Audio API)
    ├── confetti.js      Animación de confeti (canvas)
    ├── questions.js      Generador de preguntas por juego/dificultad
    └── app.js          Lógica de la app: pantallas, partidas, progreso
```

No hay dependencias externas que instalar (solo una tipografía opcional de
Google Fonts que, si no hay internet, cae a una tipografía del sistema sin
romper nada).
