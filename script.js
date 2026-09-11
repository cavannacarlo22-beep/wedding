/* ═══════════════════════════════════════════════════════════════════════
   MARIO & LUCIA — Digital Wedding Invitation Experience
   ───────────────────────────────────────────────────────────────────────
   Tutto ciò che riguarda gli sposi è raccolto in weddingConfig:
   cambiando quei valori (e gli asset in /assets) l'invito diventa un altro.
   ═══════════════════════════════════════════════════════════════════════ */

const weddingConfig = {
  groom: "Mario Rossi",
  bride: "Lucia Bianchi",
  weddingDate: "2027-08-13",
  venue: "Tenuta Klopè",
  address: "Francavilla Angitola (VV), Calabria",
  ceremonyTime: "16:30",
  aperitifTime: "18:00",
  dinnerTime: "19:30",
  cakeTime: "22:30",
  partyTime: "23:00",
  music: "assets/audio/music.mp3"
};

/* Impostazioni secondarie, separate per tenere weddingConfig leggibile. */
const siteConfig = {
  mapsQuery: "Tenuta Klopè, Francavilla Angitola VV",
  coordinates: { lat: 38.7386, lng: 16.2361 },
  iban: "IT00 X000 0000 0000 0000 000",
  ibanHolder: "Mario Rossi & Lucia Bianchi",
  rsvpStorageKey: "ml-wedding-rsvp",
  eventDurationHours: 8,
  musicVolume: 0.45
};

/* ═══ Utilità condivise ═══════════════════════════════════════════════ */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const isReduced = () => reduceMotion.matches;
const hasGSAP   = () => typeof window.gsap !== "undefined";
const isCoarse  = () => window.matchMedia("(pointer: coarse)").matches;

const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/** Data/ora di inizio della cerimonia, come oggetto Date locale. */
function ceremonyDate() {
  const [y, m, d] = weddingConfig.weddingDate.split("-").map(Number);
  const [hh, mm]  = weddingConfig.ceremonyTime.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

/** Piccolo messaggio non invasivo in basso allo schermo. */
let toastTimer;
function toast(message, ms = 3200) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-on"), ms);
}

/* ═══════════════════════════════════════════════════════════════════════
   1 · INVITATION — orchestrazione dei due livelli
   ═══════════════════════════════════════════════════════════════════════ */
const phase = {
  set(name) { document.body.dataset.phase = name; }
};

function initInvitation() {
  const stage = $("#stage");
  const intro = $("#intro");
  const site  = $("#site");

  // La scena entra: luce, foschia, busta.
  requestAnimationFrame(() => {
    setTimeout(() => stage.classList.add("is-ready"), isReduced() ? 60 : 240);
  });

  /* ─── Sequenza cinematografica di apertura ─────────────────────────
     Fasi 1-10 della sceneggiatura, orchestrate qui in un unico punto. */
  let opening = false;
  async function openInvitation() {
    if (opening) return;
    opening = true;

    const seal = $("#seal");
    phase.set("opening");

    if (isReduced()) {
      // Esperienza equivalente, senza coreografia.
      stage.classList.add("is-opening", "is-emerging", "is-open");
      await wait(120);
      showIntro();
      return;
    }

    // FASE 2 — il sigillo vibra e si incrina
    seal.classList.add("is-cracking");
    Particles.burst(14, 0.5);
    await wait(560);

    // …e si spezza in due
    breakSeal(seal);
    await wait(180);

    // FASE 3-4 — il lembo si solleva, la carta interna diventa visibile
    stage.classList.add("is-opening");
    await wait(620);

    // FASE 5-6-7 — la carta esce, si inclina verso lo spettatore, si espande
    stage.classList.add("is-emerging");
    await wait(760);

    // FASE 8-9 — leggero zoom della "telecamera" e pioggia di polvere dorata
    stage.classList.add("is-open");
    Particles.burst(70, 1);
    await wait(520);

    // FASE 10 — la carta diventa la pagina
    showIntro();
  }

  /** Divide il sigillo in due frammenti che cadono. */
  function breakSeal(seal) {
    const svg = $(".seal__svg", seal);
    if (svg) {
      const shards = document.createElement("span");
      shards.className = "seal__shards";
      ["l", "r"].forEach((side) => {
        const shard = document.createElement("span");
        shard.className = `seal__shard seal__shard--${side}`;
        shard.appendChild(svg.cloneNode(true));
        shards.appendChild(shard);
      });
      seal.appendChild(shards);
      // finita la caduta, i frammenti escono dal DOM: niente residui in scena
      setTimeout(() => shards.remove(), 1400);
    }
    seal.classList.add("is-broken");
  }

  /* ─── L'intro stampata sulla carta ─────────────────────────────────── */
  function showIntro() {
    phase.set("intro");
    intro.setAttribute("aria-hidden", "false");
    intro.classList.add("is-visible");
    $("#stageHint").setAttribute("hidden", "");

    const items = $$("[data-intro]", intro);
    if (hasGSAP() && !isReduced()) {
      gsap.to(items, {
        opacity: 1, y: 0, duration: 1,
        stagger: 0.28, ease: "power3.out", delay: 0.25,
        onStart: () => items.forEach((i) => i.classList.add("is-in"))
      });
    } else {
      items.forEach((item, i) => {
        setTimeout(() => item.classList.add("is-in"), isReduced() ? 0 : 250 + i * 280);
      });
    }
    setTimeout(() => $("#introEnter")?.focus({ preventScroll: true }), isReduced() ? 100 : 2600);
  }

  /* ─── Dall'invito al sito ──────────────────────────────────────────── */
  let entered = false;
  function enterSite() {
    if (entered) return;
    entered = true;

    site.setAttribute("aria-hidden", "false");
    phase.set("site");
    document.body.classList.remove("is-locked");
    window.scrollTo(0, 0);

    // da qui in poi le sezioni possono animarsi allo scroll
    Reveal.refresh();
    Particles.setMode("site");

    stage.classList.add("is-gone");
    setTimeout(() => {
      stage.setAttribute("aria-hidden", "true");
      stage.style.display = "none";
      Reveal.refresh();
    }, isReduced() ? 150 : 1200);

    // il focus passa al sito, per chi naviga da tastiera o con screen reader
    const hero = $("#hero");
    if (hero) {
      hero.setAttribute("tabindex", "-1");
      setTimeout(() => hero.focus({ preventScroll: true }), 60);
    }
  }

  // Attivazione: sigillo, pulsante, o click sulla busta.
  $("#seal").addEventListener("click", openInvitation);
  $("#openBtn").addEventListener("click", openInvitation);
  $("#envelopeScene").addEventListener("click", openInvitation);
  $("#introEnter").addEventListener("click", enterSite);

  // Il link "salta" porta direttamente al sito.
  $(".skip-link").addEventListener("click", (e) => {
    e.preventDefault();
    if (!opening) { opening = true; phase.set("opening"); }
    showIntro();
    enterSite();
  });

  // Scorrendo dentro l'intro (o premendo Invio/Spazio) si entra nel sito.
  intro.addEventListener("wheel", (e) => {
    if (e.deltaY > 40 && intro.scrollTop + intro.clientHeight >= intro.scrollHeight - 8) enterSite();
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (document.body.dataset.phase === "cover" && (e.key === "Enter" || e.key === " ")) {
      const tag = document.activeElement?.tagName;
      if (tag !== "BUTTON" && tag !== "A") { e.preventDefault(); openInvitation(); }
    }
  });

  return { openInvitation, enterSite };
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · ENVELOPE — il tilt fisico della busta
   ═══════════════════════════════════════════════════════════════════════ */
function initEnvelope() {
  const scene = $("#envelopeScene");
  const env   = $("#envelope");
  const front = $(".env-front");
  if (!scene || !env) return;

  if (isReduced()) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null, active = false;

  const MAX = 9; // gradi: volutamente contenuto, deve sembrare un oggetto vero

  function loop() {
    curX += (targetX - curX) * 0.09;
    curY += (targetY - curY) * 0.09;
    env.style.setProperty("--tx", `${curX.toFixed(2)}deg`);
    env.style.setProperty("--ty", `${(-curY).toFixed(2)}deg`);
    if (front) front.style.setProperty("--shine", `${(curX * 2.2).toFixed(1)}deg`);

    if (Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02) {
      raf = requestAnimationFrame(loop);
    } else { raf = null; }
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function setFromPoint(x, y) {
    if (document.body.dataset.phase !== "cover") return;
    const r = scene.getBoundingClientRect();
    const nx = clamp((x - (r.left + r.width / 2)) / (r.width / 2), -1.4, 1.4);
    const ny = clamp((y - (r.top + r.height / 2)) / (r.height / 2), -1.4, 1.4);
    targetX = nx * MAX;
    targetY = ny * MAX * 0.62;
    if (!active) { env.classList.add("is-tilting"); active = true; }
    kick();
  }

  // Desktop: il puntatore su tutta la finestra.
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    setFromPoint(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; kick(); }, { passive: true });

  // Mobile: il dito sulla busta.
  scene.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    if (t) setFromPoint(t.clientX, t.clientY);
  }, { passive: true });
  scene.addEventListener("touchend", () => { targetX = 0; targetY = 0; kick(); }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · COUNTDOWN
   ═══════════════════════════════════════════════════════════════════════ */
function initCountdown() {
  const target = ceremonyDate();
  const cells = {
    days:    $("#cdDays"),
    hours:   $("#cdHours"),
    minutes: $("#cdMinutes"),
    seconds: $("#cdSeconds")
  };
  if (!cells.days) return;

  const caption = $("#cdCaption");
  const last = {};
  let timer = null;

  function paint(el, value) {
    const text = String(value).padStart(2, "0");
    if (el.textContent === text) return;
    el.textContent = text;
    if (isReduced()) return;
    el.classList.remove("is-flip");
    void el.offsetWidth;          // forza il restart dell'animazione
    el.classList.add("is-flip");
  }

  function tick() {
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      Object.values(cells).forEach((c) => (c.textContent = "00"));
      if (caption) caption.textContent = "Oggi è il giorno.";
      clearInterval(timer);
      return;
    }

    const s = Math.floor(diff / 1000);
    const values = {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60
    };

    for (const key of Object.keys(cells)) {
      if (last[key] !== values[key]) {
        paint(cells[key], values[key]);
        last[key] = values[key];
      }
    }
  }

  tick();
  timer = setInterval(tick, 1000);

  // Nessun lavoro inutile quando la scheda è in secondo piano.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { clearInterval(timer); }
    else { tick(); timer = setInterval(tick, 1000); }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · NAVIGATION
   ═══════════════════════════════════════════════════════════════════════ */
function initNavigation() {
  const nav    = $("#nav");
  const menu   = $("#navMenu");
  const burger = $("#navBurger");
  if (!nav) return;

  let lastY = 0;

  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > window.innerHeight * 0.72);
    // si nasconde scendendo, riappare risalendo
    if (!menu.classList.contains("is-open")) {
      nav.classList.toggle("is-hidden", y > lastY + 6 && y > window.innerHeight);
    }
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ─── menu mobile ─── */
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    document.body.classList.toggle("menu-open", open);
    nav.classList.toggle("has-menu-open", open);
    if (open) nav.classList.remove("is-hidden");
  }
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); burger.focus(); }
  });

  /* ─── link attivo in base alla sezione visibile ─── */
  const links = $$("a[href^='#']", menu);
  const map = new Map();
  links.forEach((a) => {
    const sec = document.getElementById(a.getAttribute("href").slice(1));
    if (sec) map.set(sec, a);
  });
  if (map.size && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => l.classList.remove("is-active"));
          map.get(entry.target)?.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, sec) => io.observe(sec));
  }

  /* ─── smooth scroll con offset per la barra ─── */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = document.getElementById(id.slice(1));
      if (!t || document.body.dataset.phase !== "site") return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - (t.id === "hero" ? 0 : 56);
      window.scrollTo({ top, behavior: isReduced() ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · GALLERY + LIGHTBOX
   ═══════════════════════════════════════════════════════════════════════ */
function initGallery() {
  const grid = $("#galGrid");
  const lb   = $("#lightbox");
  if (!grid || !lb) return;

  const items = $$(".gal__btn", grid).map((btn) => {
    const img = $("img", btn);
    const cap = btn.closest(".gal__item")?.querySelector("figcaption");
    return {
      src: img.getAttribute("src"),
      alt: img.getAttribute("alt") || "",
      caption: cap ? cap.textContent.replace(/\s+/g, " ").trim() : ""
    };
  });

  const imgEl   = $("#lbImg");
  const capEl   = $("#lbCap");
  const countEl = $("#lbCount");
  let index = 0, opener = null;

  function show(i, initial = false) {
    index = (i + items.length) % items.length;
    const item = items[index];
    lb.classList.remove("is-ready");
    imgEl.setAttribute("data-loading", "1");
    const next = new Image();
    next.onload = next.onerror = () => {
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      imgEl.removeAttribute("data-loading");
      requestAnimationFrame(() => lb.classList.add("is-ready"));
    };
    next.src = item.src;
    capEl.textContent = item.caption;
    countEl.textContent = `${String(index + 1).padStart(2, "0")} / ${String(items.length).padStart(2, "0")}`;
    if (initial) lb.setAttribute("aria-label", `Galleria, immagine ${index + 1} di ${items.length}`);
  }

  function open(i, from) {
    opener = from || null;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(i, true);
    requestAnimationFrame(() => lb.classList.add("is-open"));
    $("#lbClose").focus({ preventScroll: true });
  }

  function close() {
    lb.classList.remove("is-open", "is-ready");
    document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; opener?.focus({ preventScroll: true }); }, isReduced() ? 0 : 400);
  }

  $$(".gal__btn", grid).forEach((btn) => {
    btn.addEventListener("click", () => open(Number(btn.dataset.index), btn));
  });

  $("#lbClose").addEventListener("click", close);
  $("#lbPrev").addEventListener("click", () => show(index - 1));
  $("#lbNext").addEventListener("click", () => show(index + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === $(".lb__stage")) close(); });

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape")      close();
    if (e.key === "ArrowLeft")   show(index - 1);
    if (e.key === "ArrowRight")  show(index + 1);
    if (e.key === "Tab") {
      // focus trap essenziale
      const f = $$("button", lb);
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ─── swipe su mobile ─── */
  let sx = 0, sy = 0, swiping = false;
  lb.addEventListener("touchstart", (e) => {
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; swiping = true;
  }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (!swiping) return;
    swiping = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) show(index + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  }, { passive: true });

  /* ─── nessuna immagine rotta: fallback elegante ─── */
  $$("img", document).forEach((img) => {
    img.addEventListener("error", () => {
      img.style.background = "linear-gradient(135deg,#E8DCC8,#F1E7D6)";
      img.style.minHeight = img.style.minHeight || "160px";
      img.style.opacity = "1";
      img.removeAttribute("srcset");
    }, { once: true });
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · RSVP
   ═══════════════════════════════════════════════════════════════════════ */
function initRSVP() {
  const form = $("#rsvpForm");
  if (!form) return;

  const nameInput = $("#rsvpName");
  const guests    = $("#rsvpGuests");
  const guestsField = $("#guestsField");
  const thanks    = $("#thanks");

  /* stepper invitati */
  $$(".stepper__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const step = Number(btn.dataset.step);
      const next = clamp(Number(guests.value || 1) + step, 1, 10);
      guests.value = next;
    });
  });

  /* se non partecipa, il numero di invitati perde di senso */
  $$('input[name="attending"]').forEach((r) => {
    r.addEventListener("change", () => {
      const away = $('input[name="attending"]:checked')?.value === "no";
      guestsField.classList.toggle("is-muted", away);
      guests.disabled = away;
    });
  });

  /* ripristino di una risposta precedente */
  try {
    const saved = JSON.parse(localStorage.getItem(siteConfig.rsvpStorageKey) || "null");
    if (saved?.name) {
      nameInput.value = saved.name;
      if (saved.attending) {
        const r = $(`input[name="attending"][value="${saved.attending}"]`);
        if (r) { r.checked = true; r.dispatchEvent(new Event("change")); }
      }
      if (saved.guests) guests.value = saved.guests;
      if (saved.diet)   $("#rsvpDiet").value = saved.diet;
      if (saved.notes)  $("#rsvpNotes").value = saved.notes;
    }
  } catch (_) { /* localStorage non disponibile: si prosegue */ }

  function setError(field, errId, on) {
    field.classList.toggle("has-error", on);
    const err = document.getElementById(errId);
    if (err) err.hidden = !on;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const attending = $('input[name="attending"]:checked')?.value;
    let ok = true;

    setError(nameInput.closest(".field"), "rsvpNameErr", false);
    setError($(".field--choice"), "rsvpAttErr", false);

    if (name.length < 2) { setError(nameInput.closest(".field"), "rsvpNameErr", true); ok = false; }
    if (!attending)      { setError($(".field--choice"), "rsvpAttErr", true); ok = false; }

    if (!ok) {
      (name.length < 2 ? nameInput : $('input[name="attending"]')).focus();
      return;
    }

    const payload = {
      name,
      attending,
      guests: attending === "si" ? Number(guests.value || 1) : 0,
      diet: $("#rsvpDiet").value.trim(),
      notes: $("#rsvpNotes").value.trim(),
      sentAt: new Date().toISOString()
    };
    try { localStorage.setItem(siteConfig.rsvpStorageKey, JSON.stringify(payload)); } catch (_) {}

    showThanks(payload);
  });

  function showThanks(data) {
    const firstName = data.name.split(" ")[0];
    $("#thanksName").textContent = firstName;
    $("#thanksText").textContent = data.attending === "si"
      ? "Non vediamo l'ora di festeggiare insieme a te."
      : "Ci mancherai. Grazie per avercelo fatto sapere: un pensiero speciale sarà comunque per te.";

    thanks.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => thanks.classList.add("is-open"));
    $("#thanksClose").focus({ preventScroll: true });

    if (data.attending === "si") confetti(26);
    Particles.burst(30, 0.8);
  }

  function closeThanks() {
    thanks.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { thanks.hidden = true; }, isReduced() ? 0 : 500);
  }
  $("#thanksClose").addEventListener("click", closeThanks);
  thanks.addEventListener("click", (e) => { if (e.target === thanks) closeThanks(); });
  document.addEventListener("keydown", (e) => {
    if (!thanks.hidden && e.key === "Escape") closeThanks();
  });

  /* petali/confetti raffinati: pochi, lenti, nei colori della palette */
  function confetti(n) {
    if (isReduced()) return;
    const colors = ["#E8DCC8", "#C89B7B", "#B99A5B", "#8C9A83", "#F1E7D6"];
    for (let i = 0; i < n; i++) {
      const p = document.createElement("i");
      p.className = "petal";
      const size = 8 + Math.random() * 8;
      p.style.cssText = `
        left:${Math.random() * 100}vw;
        width:${size}px;height:${size * 1.35}px;
        background:${colors[i % colors.length]};
        opacity:${0.55 + Math.random() * 0.4};`;
      document.body.appendChild(p);
      const drift = (Math.random() - 0.5) * 240;
      const dur = 4200 + Math.random() * 3200;
      const anim = p.animate([
        { transform: "translate3d(0,-10px,0) rotate(0deg)", opacity: 0 },
        { transform: `translate3d(${drift * 0.4}px,42vh,0) rotate(180deg)`, opacity: 0.9, offset: 0.5 },
        { transform: `translate3d(${drift}px,102vh,0) rotate(400deg)`, opacity: 0 }
      ], { duration: dur, delay: Math.random() * 700, easing: "cubic-bezier(.25,.6,.4,1)" });
      anim.onfinish = () => p.remove();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   7 · MUSICA — nessun autoplay, nessun errore se il file non esiste
   ═══════════════════════════════════════════════════════════════════════ */
const Music = {
  available: false,
  playing: false,
  audio: null,
  buttons: [],

  sync() {
    this.buttons.forEach((b) => {
      b.setAttribute("aria-pressed", String(this.playing));
      if (b.id === "stageMusic") {
        b.innerHTML = this.playing
          ? '<span aria-hidden="true">♪</span> Musica attiva'
          : '<span aria-hidden="true">♪</span> Accendi la musica';
      } else {
        b.setAttribute("aria-label", this.playing ? "Disattiva la musica" : "Attiva la musica di sottofondo");
      }
    });
  },

  async toggle() {
    if (!this.available || !this.audio) return;
    try {
      if (this.playing) { this.audio.pause(); this.playing = false; }
      else { await this.audio.play(); this.playing = true; }
    } catch (_) {
      this.playing = false;
      toast("La riproduzione audio è stata bloccata dal browser.");
    }
    this.sync();
  }
};

function initMusic() {
  const audio      = $("#audio");
  const musicBtn   = $("#musicBtn");
  const stageMusic = $("#stageMusic");
  if (!audio) return;

  Music.audio = audio;
  Music.buttons = [musicBtn, stageMusic].filter(Boolean);

  // Il pulsante compare solo se la traccia esiste davvero.
  stageMusic.hidden = true;

  const probe = new Audio();
  let settled = false;

  const enable = () => {
    if (settled) return;
    settled = true;
    Music.available = true;
    audio.src = weddingConfig.music;
    audio.volume = siteConfig.musicVolume;
    musicBtn.hidden = false;
    stageMusic.hidden = false;
    Music.sync();
  };
  const disable = () => {
    if (settled) return;
    settled = true;
    Music.available = false;
    musicBtn.hidden = true;
    stageMusic.hidden = true;
  };

  probe.addEventListener("canplaythrough", enable, { once: true });
  probe.addEventListener("loadedmetadata", enable, { once: true });
  probe.addEventListener("error", disable, { once: true });
  probe.preload = "metadata";
  try { probe.src = weddingConfig.music; probe.load(); } catch (_) { disable(); }
  setTimeout(disable, 4000); // se la traccia non risponde, si prosegue in silenzio

  Music.buttons.forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();          // dalla busta non deve far partire l'apertura
    Music.toggle();
  }));

  audio.addEventListener("error", () => { Music.available = false; musicBtn.hidden = true; });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && Music.playing) { audio.pause(); }
    else if (!document.hidden && Music.playing) { audio.play().catch(() => {}); }
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   8 · PARTICELLE — polvere dorata, sempre sotto controllo
   ═══════════════════════════════════════════════════════════════════════ */
const Particles = {
  canvas: null, ctx: null, dpr: 1,
  w: 0, h: 0, items: [], bursts: [],
  mode: "cover", raf: null, running: false,

  base() {
    if (this.mode === "site") return isCoarse() ? 14 : 24;
    return isCoarse() ? 26 : 40;
  },

  init() {
    if (isReduced()) return;
    this.canvas = $("#particles");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d", { alpha: true });
    this.resize();
    this.seed(this.base());
    this.start();

    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => this.resize(), 180);
    }, { passive: true });

    document.addEventListener("visibilitychange", () => {
      document.hidden ? this.stop() : this.start();
    });
  },

  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width  = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width  = this.w + "px";
    this.canvas.style.height = this.h + "px";
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  make(burst = false) {
    const a = Math.random() * Math.PI * 2;
    const speed = burst ? 0.8 + Math.random() * 2.4 : 0.06 + Math.random() * 0.16;
    return {
      x: burst ? this.w / 2 + (Math.random() - 0.5) * this.w * 0.28 : Math.random() * this.w,
      y: burst ? this.h * 0.46 + (Math.random() - 0.5) * this.h * 0.18 : Math.random() * this.h,
      vx: burst ? Math.cos(a) * speed : (Math.random() - 0.5) * 0.12,
      vy: burst ? Math.sin(a) * speed - 0.25 : -speed,
      r: burst ? 0.9 + Math.random() * 2.2 : 0.5 + Math.random() * 1.5,
      life: burst ? 1 : Infinity,
      decay: burst ? 0.004 + Math.random() * 0.008 : 0,
      alpha: burst ? 0.9 : 0.12 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
      tws: 0.008 + Math.random() * 0.02,
      burst
    };
  },

  seed(n) {
    this.items = [];
    for (let i = 0; i < n; i++) this.items.push(this.make(false));
  },

  /** Sciame extra: apertura della busta, conferma RSVP, easter egg. */
  burst(n = 40, power = 1) {
    if (isReduced() || !this.ctx) return;
    for (let i = 0; i < n; i++) {
      const p = this.make(true);
      p.vx *= power; p.vy *= power;
      this.bursts.push(p);
    }
    this.start();
  },

  setMode(mode) {
    this.mode = mode;
    if (!this.ctx) return;
    const want = this.base();
    while (this.items.length > want) this.items.pop();
    while (this.items.length < want) this.items.push(this.make(false));
  },

  frame() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);

    const draw = (p) => {
      p.x += p.vx; p.y += p.vy;
      p.tw += p.tws;
      if (p.burst) {
        p.vy += 0.012;            // gravità appena accennata
        p.vx *= 0.992;
        p.life -= p.decay;
      } else if (p.y < -10) {
        p.y = h + 10; p.x = Math.random() * w;
      } else if (p.x < -10 || p.x > w + 10) {
        p.x = Math.random() * w;
      }

      const a = (p.burst ? Math.max(p.life, 0) : 1) * p.alpha * (0.62 + 0.38 * Math.sin(p.tw));
      if (a <= 0.004) return;

      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.4);
      g.addColorStop(0, `rgba(232,214,170,${a})`);
      g.addColorStop(0.45, `rgba(185,154,91,${a * 0.42})`);
      g.addColorStop(1, "rgba(185,154,91,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3.4, 0, Math.PI * 2);
      ctx.fill();
    };

    this.items.forEach(draw);
    this.bursts.forEach(draw);
    this.bursts = this.bursts.filter((p) => p.life > 0 && p.y < h + 40);

    this.raf = requestAnimationFrame(() => this.frame());
  },

  start() {
    if (this.running || !this.ctx || isReduced()) return;
    this.running = true;
    this.frame();
  },

  stop() {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
};

function initParticles() { Particles.init(); }

/* ═══════════════════════════════════════════════════════════════════════
   9 · CALENDARIO — file .ics generato al volo
   ═══════════════════════════════════════════════════════════════════════ */
function initCalendar() {
  const buttons = [$("#calendarBtn")].filter(Boolean);
  if (!buttons.length) return;

  const pad = (n) => String(n).padStart(2, "0");
  const local = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const stamp = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  function buildICS() {
    const start = ceremonyDate();
    const end = new Date(start.getTime() + siteConfig.eventDurationHours * 3600 * 1000);
    const title = `Matrimonio ${weddingConfig.groom} & ${weddingConfig.bride}`;
    const location = `${weddingConfig.venue}, ${weddingConfig.address}`;
    const esc = (s) => String(s).replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

    // Orari espressi nel fuso di Roma: l'evento resta corretto ovunque sia importato.
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Wedding Invitation Experience//Demo//IT",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE",
      "TZID:Europe/Rome",
      "BEGIN:DAYLIGHT",
      "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST",
      "DTSTART:19700329T020000",
      "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
      "END:DAYLIGHT",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET",
      "DTSTART:19701025T030000",
      "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
      "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT",
      `UID:ml-wedding-${weddingConfig.weddingDate}@wedding-invitation.demo`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART;TZID=Europe/Rome:${local(start)}`,
      `DTEND;TZID=Europe/Rome:${local(end)}`,
      `SUMMARY:${esc(title)}`,
      `LOCATION:${esc(location)}`,
      `DESCRIPTION:${esc(`Cerimonia ore ${weddingConfig.ceremonyTime} · Aperitivo ${weddingConfig.aperitifTime} · Cena ${weddingConfig.dinnerTime} · Taglio della torta ${weddingConfig.cakeTime} · Festa ${weddingConfig.partyTime}`)}`,
      "STATUS:CONFIRMED",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(title)} — domani!`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  buttons.forEach((btn) => btn.addEventListener("click", () => {
    try {
      const blob = new Blob([buildICS()], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Matrimonio-Mario-e-Lucia-13-08-2027.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast("Evento scaricato: aprilo per aggiungerlo al calendario.");
    } catch (_) {
      toast("Non è stato possibile generare il file .ics su questo dispositivo.");
    }
  }));
}

/* ═══════════════════════════════════════════════════════════════════════
   10 · EASTER EGGS
   ═══════════════════════════════════════════════════════════════════════ */
function initEasterEggs() {
  /* ─── 1 · cinque click sulle iniziali M & L ─── */
  const initials = [$(".nav__brand"), $(".foot__mono")].filter(Boolean);
  let count = 0, resetTimer = null;

  initials.forEach((el) => {
    el.addEventListener("click", () => {
      count++;
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => (count = 0), 2200);
      if (count >= 5) {
        count = 0;
        celebrate();
      }
    });
  });

  function celebrate() {
    Particles.burst(90, 1.25);
    toast("M & L · per sempre ✦", 4200);
    if (isReduced()) return;

    // una piccola onda dorata che attraversa lo schermo
    const wave = document.createElement("div");
    wave.setAttribute("aria-hidden", "true");
    wave.style.cssText = `
      position:fixed;inset:0;z-index:399;pointer-events:none;
      background:radial-gradient(circle at 50% 50%, rgba(220,194,145,.34), rgba(220,194,145,0) 62%);`;
    document.body.appendChild(wave);
    const a = wave.animate(
      [{ opacity: 0, transform: "scale(.4)" },
       { opacity: 1, transform: "scale(1)", offset: 0.35 },
       { opacity: 0, transform: "scale(1.6)" }],
      { duration: 2200, easing: "cubic-bezier(.16,1,.3,1)" });
    a.onfinish = () => wave.remove();
  }

  /* ─── 2 · il piccolo segreto botanico ─── */
  const secret = $("#secret");
  if (secret) {
    secret.addEventListener("click", () => {
      secret.classList.add("is-found");
      toast("Hai trovato il nostro piccolo segreto.", 4500);
      Particles.burst(24, 0.7);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   11 · SCROLL — reveal, parallax, linea del programma
   ═══════════════════════════════════════════════════════════════════════ */
const Reveal = {
  io: null,
  init() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    this.io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          this.io.unobserve(entry.target);       // si anima una volta sola
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
    this.refresh();
  },
  refresh() {
    // Finché il sito è dietro alla busta non va osservato nulla:
    // altrimenti le sezioni "entrerebbero" mentre nessuno le sta guardando.
    if (!this.io || document.body.dataset.phase !== "site") return;
    $$(".reveal:not(.is-in)").forEach((el) => this.io.observe(el));
  }
};

function initScrollEffects() {
  Reveal.init();

  const parallax = $$("[data-parallax]");
  const dayLine  = $(".day__line i");
  const dayList  = $("#dayList");
  let ticking = false;

  function update() {
    ticking = false;
    const vh = window.innerHeight;

    if (!isReduced()) {
      parallax.forEach((el) => {
        const rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > vh + 200) return;
        const factor = parseFloat(el.dataset.parallax) || 0.2;
        const offset = (rect.top + rect.height / 2 - vh / 2) * -factor;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }

    if (dayLine && dayList) {
      const r = dayList.getBoundingClientRect();
      const p = clamp((vh * 0.72 - r.top) / r.height, 0, 1);
      dayLine.style.setProperty("--p", p.toFixed(3));
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

/* ═══════════════════════════════════════════════════════════════════════
   12 · CURSORE PERSONALIZZATO (solo desktop)
   ═══════════════════════════════════════════════════════════════════════ */
function initCursor() {
  if (isCoarse() || isReduced() || !window.matchMedia("(hover:hover)").matches) return;

  const cursor = $(".cursor");
  const dot = $(".cursor__dot"), ring = $(".cursor__ring");
  if (!cursor) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my, raf = null;

  function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    dot.style.transform  = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
    ring.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0) translate(-50%,-50%)`;
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    mx = e.clientX; my = e.clientY;
    cursor.classList.remove("is-hidden");
    if (!raf) loop();
  }, { passive: true });

  document.addEventListener("pointerdown", () => cursor.classList.add("is-down"));
  document.addEventListener("pointerup",   () => cursor.classList.remove("is-down"));
  document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));

  const hot = "a, button, input, textarea, label.choice, .seal, summary";
  const media = ".gal__btn, .map__frame, .intro__figure";
  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    cursor.classList.toggle("is-media", !!t.closest(media));
    cursor.classList.toggle("is-hot", !t.closest(media) && !!t.closest(hot));
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════════════
   13 · CONTENUTI DINAMICI dalla configurazione + interazioni minori
   ═══════════════════════════════════════════════════════════════════════ */
function initContent() {
  /* orari del programma presi da weddingConfig */
  const times = {
    ceremony: weddingConfig.ceremonyTime,
    aperitif: weddingConfig.aperitifTime,
    dinner:   weddingConfig.dinnerTime,
    cake:     weddingConfig.cakeTime,
    party:    weddingConfig.partyTime
  };
  $$("[data-time]").forEach((el) => {
    const v = times[el.dataset.time];
    if (v) el.textContent = v;
  });

  /* Google Maps: il pulsante funziona davvero */
  const mapsUrl = "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(siteConfig.mapsQuery);
  ["#mapsBtn", "#mapsBtn2"].forEach((sel) => {
    const el = $(sel);
    if (el) el.href = mapsUrl;
  });

  /* modal lista nozze */
  const modal = $("#giftModal");
  const giftBtn = $("#giftBtn");
  if (modal && giftBtn) {
    let lastFocus = null;

    const open = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modal.classList.add("is-open"));
      $(".modal__close", modal).focus({ preventScroll: true });
    };
    const close = () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(() => { modal.hidden = true; lastFocus?.focus({ preventScroll: true }); },
        isReduced() ? 0 : 450);
    };

    giftBtn.addEventListener("click", open);
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (!modal.hidden && e.key === "Escape") close();
      if (!modal.hidden && e.key === "Tab") {
        const f = $$("button", modal);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    /* copia IBAN */
    const copy = $("#ibanCopy");
    const code = $("#ibanCode");
    if (code) code.textContent = siteConfig.iban;
    copy?.addEventListener("click", async () => {
      const text = siteConfig.iban;
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
        } else {
          const ta = document.createElement("textarea");
          ta.value = text;
          ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
        }
        copy.textContent = "IBAN copiato";
        toast("IBAN copiato negli appunti — dato dimostrativo.");
        setTimeout(() => (copy.textContent = "Copia IBAN"), 2400);
      } catch (_) {
        toast("Copia non riuscita: seleziona l'IBAN manualmente.");
      }
    });
  }

  /* petali lenti nella schermata finale */
  const petals = $("#petals");
  if (petals && !isReduced() && "IntersectionObserver" in window) {
    let built = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting || built) return;
        built = true;
        const colors = ["#E8DCC8", "#DCC291", "#C89B7B", "#B3BDA9"];
        for (let i = 0; i < 12; i++) {
          const p = document.createElement("i");
          p.className = "petal";
          const size = 7 + Math.random() * 7;
          p.style.cssText = `
            left:${5 + Math.random() * 90}%;
            width:${size}px;height:${size * 1.4}px;
            background:${colors[i % colors.length]};
            --dur:${11 + Math.random() * 9}s;
            --delay:${-Math.random() * 12}s;
            --drift:${(Math.random() - 0.5) * 120}px;
            opacity:.7;`;
          petals.appendChild(p);
        }
        io.disconnect();
      });
    }, { threshold: 0.15 });
    io.observe($("#finale"));
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   AVVIO
   ═══════════════════════════════════════════════════════════════════════ */
function boot() {
  try { initParticles(); }    catch (e) { console.warn("particles", e); }
  try { initInvitation(); }   catch (e) { console.warn("invitation", e); }
  try { initEnvelope(); }     catch (e) { console.warn("envelope", e); }
  try { initContent(); }      catch (e) { console.warn("content", e); }
  try { initCountdown(); }    catch (e) { console.warn("countdown", e); }
  try { initNavigation(); }   catch (e) { console.warn("navigation", e); }
  try { initGallery(); }      catch (e) { console.warn("gallery", e); }
  try { initRSVP(); }         catch (e) { console.warn("rsvp", e); }
  try { initMusic(); }        catch (e) { console.warn("music", e); }
  try { initCalendar(); }     catch (e) { console.warn("calendar", e); }
  try { initEasterEggs(); }   catch (e) { console.warn("easter eggs", e); }
  try { initScrollEffects(); }catch (e) { console.warn("scroll", e); }
  try { initCursor(); }       catch (e) { console.warn("cursor", e); }

  // Se le preferenze di movimento cambiano in corsa, ci si adegua.
  reduceMotion.addEventListener?.("change", () => {
    if (isReduced()) { Particles.stop(); }
    else { Particles.init(); }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
