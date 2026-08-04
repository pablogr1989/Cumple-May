// ---- Musica de fondo -------------------------------------------------------
const VOLUMEN = 0.7; // de 0 a 1

const cancion = document.getElementById("cancion");
const boton = document.getElementById("sonido");
let disponible = true;

cancion.volume = VOLUMEN;
cancion.addEventListener("error", () => { disponible = false; boton.hidden = true; });

function pintarBoton() {
  boton.hidden = !disponible;
  boton.textContent = cancion.paused ? "🔇" : "🔊";
  boton.classList.toggle("pulso", cancion.paused);
}

function arrancar() {
  if (!disponible) return Promise.resolve(false);
  return cancion.play().then(() => { pintarBoton(); return true; })
                      .catch(() => { pintarBoton(); return false; });
}

// Los navegadores bloquean el autoplay con sonido: si falla, arranca sola
// en cuanto May toque, deslice o pulse cualquier cosa.
arrancar().then(sonando => {
  if (sonando) return;
  const desbloquear = () => {
    arrancar().then(ok => { if (ok) quitar(); });
  };
  const eventos = ["pointerdown", "keydown", "touchstart", "wheel"];
  const quitar = () => eventos.forEach(ev => removeEventListener(ev, desbloquear));
  eventos.forEach(ev => addEventListener(ev, desbloquear, { passive: true }));
});

boton.addEventListener("click", e => {
  e.stopPropagation();
  if (cancion.paused) arrancar(); else { cancion.pause(); pintarBoton(); }
});

// ---- Navegacion entre paginas ---------------------------------------------
const wrap = document.getElementById("wrap");
const pages = [...document.querySelectorAll(".page")];
let locked = false;

function goTo(dir) {
  if (locked) return;
  const actual = Math.round(wrap.scrollLeft / wrap.clientWidth);
  const destino = Math.min(pages.length - 1, Math.max(0, actual + dir));
  if (destino === actual) return;
  locked = true;
  pages[destino].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  setTimeout(() => { locked = false; }, 600);
}

// Deja que la carta larga haga su scroll vertical; solo cambia de pagina en los extremos
function cardCanScroll(target, deltaY) {
  const card = target instanceof Element ? target.closest(".card") : null;
  if (!card || card.scrollHeight <= card.clientHeight) return false;
  const atTop = card.scrollTop <= 0;
  const atBottom = card.scrollTop + card.clientHeight >= card.scrollHeight - 1;
  return !((deltaY < 0 && atTop) || (deltaY > 0 && atBottom));
}

addEventListener("wheel", e => {
  if (cardCanScroll(e.target, e.deltaY)) return;
  e.preventDefault();
  goTo(Math.sign(e.deltaY) || 1);
}, { passive: false });

addEventListener("keydown", e => {
  if (e.key === "ArrowRight" || e.key === "PageDown") goTo(1);
  if (e.key === "ArrowLeft" || e.key === "PageUp") goTo(-1);
});
