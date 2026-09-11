# Wedding Invitation Experience — demo

Invito matrimoniale digitale immersivo. Due livelli: l'**apertura della busta**
(esperienza autonoma, cinematografica) e il **sito** che ne nasce.

Demo: **Mario Rossi & Lucia Bianchi** — 13 agosto 2027 — Tenuta Klopè,
Francavilla Angitola (VV), Calabria.

HTML5 + CSS3 + JavaScript vanilla. Nessun framework, nessun build step.
GSAP è opzionale (via CDN): se non si carica, l'esperienza resta identica.

---

## Avvio

Il progetto è statico. Il modo più rapido:

```bash
# dalla cartella del progetto
python3 -m http.server 8000
# poi apri http://localhost:8000
```

In alternativa `npx serve .`, oppure l'estensione *Live Server* di VS Code.

> Aprire `index.html` con doppio click (protocollo `file://`) funziona quasi del
> tutto, ma alcuni browser bloccano il download del file `.ics` e la lettura
> degli asset. **Per la demo usa un server locale.**

Per pubblicarlo online basta caricare la cartella così com'è su
GitHub Pages, Netlify, Vercel o un qualsiasi hosting statico.

---

## Struttura

```
.
├── index.html          markup completo (livello 1 + livello 2)
├── style.css           token di design, scena, busta, sito, responsive, a11y
├── script.js           weddingConfig + moduli init*()
├── README.md
└── assets/
    ├── images/
    │   ├── venue-illustration.svg   acquerello botanico della tenuta
    │   ├── hero-sky.svg             ─┐
    │   ├── hero-hills.svg            ├ tre livelli di parallax della hero
    │   ├── hero-foreground.svg      ─┘
    │   ├── venue-photo.svg          sfondo scenografico della sezione Location
    │   ├── map.svg                  mappa stilizzata disegnata a mano
    │   ├── gallery-1…8.svg          otto tavole editoriali (segnaposto)
    │   ├── divider-olive.svg        ornamento tipografico
    │   ├── botanical-corner.svg     decoro angolare
    │   └── favicon.svg
    ├── audio/
    │   └── README.md                dove mettere music.mp3
    └── textures/
        ├── paper.svg                carta avorio (fibre + granulazione)
        ├── envelope-paper.svg       cartoncino della busta
        └── grain.svg                grana fotografica
```

---

## Dove si cambia cosa

### Nomi, data, luogo, orari

Tutto in cima a `script.js`:

```js
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
```

Da qui derivano **countdown**, **file .ics del calendario** e gli **orari del
programma** (gli elementi con `data-time` si aggiornano da soli).

Subito sotto, `siteConfig` contiene: query di Google Maps, coordinate, IBAN
della lista nozze, chiave di `localStorage`, durata dell'evento, volume musica.

I nomi e le date **scritti nel markup** (busta, intro, hero, schermata finale)
si cambiano in `index.html`: sono pochi punti, tutti identificabili cercando
`Mario` e `Lucia`.

### Immagini

Sostituisci i file in `assets/images/` mantenendo gli stessi nomi: non serve
toccare né HTML né CSS. Le tavole della galleria (`gallery-1…8`) sono pensate
per essere rimpiazzate da fotografie vere (JPG/WebP); in quel caso aggiorna in
`index.html` l'estensione nel `src`, l'`alt` e le didascalie.

L'illustrazione della tenuta è `venue-illustration.svg`: è un SVG vero, quindi
resta nitido a qualsiasi risoluzione e si può ridisegnare per ogni coppia.

### Musica

Metti un file in `assets/audio/music.mp3` (vedi `assets/audio/README.md`).
Il pulsante ♪ **compare solo se il file esiste**: senza traccia il sito
funziona normalmente e non solleva errori JavaScript. Nessun autoplay: la
musica parte solo dopo un'interazione esplicita.

### Testi

Sono tutti in `index.html`, in italiano, sezione per sezione (storia,
programma, dress code, lista nozze, RSVP, schermata finale).

### Colori e tipografia

In cima a `style.css`, blocco `:root`: palette (ivory, champagne, olive, sage,
oro antico, terracotta) e famiglie tipografiche (Cormorant Garamond per i
titoli, Montserrat per i testi, Great Vibes per i pochi dettagli calligrafici).

---

## Cosa contiene

| Sezione | Note |
|---|---|
| Scena iniziale | polvere dorata, foschia, luce calda, busta in CSS 3D con tilt |
| Sigillo | ceralacca oliva/oro, vibrazione, crepa, rottura in due frammenti |
| Apertura | 10 fasi coreografate, ~3,5 s, dal click alla pagina |
| Intro | nomi, data, illustrazione ad acquerello, luogo, formula d'invito |
| Hero | parallax su tre livelli, tramonto calabrese |
| Save the date | genera e scarica un `.ics` con fuso `Europe/Rome` e promemoria |
| La nostra storia | timeline animata 2019 → 2027 |
| Countdown | reale, al secondo, con transizione delicata sulle cifre |
| Il grande giorno | timeline verticale con linea che si disegna allo scroll |
| Location | full-width con parallax e link reale a Google Maps |
| Mappa | disegnata a mano in SVG, nessuna API necessaria |
| RSVP | validazione, `localStorage`, overlay di ringraziamento, petali |
| Dress code | palette cromatica suggerita |
| Lista nozze | modal con IBAN dimostrativo e copia negli appunti |
| Galleria | layout editoriale + lightbox (frecce, ESC, swipe) |
| Schermata finale | petali che cadono lentamente |
| Easter egg | 5 click sulle iniziali `M & L`; simbolo botanico nascosto nel finale |

**Accessibilità**: HTML semantico, `aria-label`, focus visibile, navigazione da
tastiera completa, focus trap nei modali, `prefers-reduced-motion` (l'invito si
apre subito e le animazioni si spengono, l'esperienza resta intatta).

**Performance**: animazioni solo su `transform`/`opacity`, `IntersectionObserver`
per i reveal, `requestAnimationFrame` con throttling sullo scroll, particelle
ridotte su mobile e sospese a scheda nascosta, `lazy loading` sulle immagini.

**Fallback**: senza GSAP, senza audio, senza `localStorage` o con immagini
mancanti il sito continua a funzionare senza errori in console.

---

## Da demo a prodotto

Il passo successivo è trasformare l'invito in un servizio dove ogni coppia ha il
proprio link. La struttura attuale è già pensata per questo: tutti i dati
variabili sono concentrati in `weddingConfig`/`siteConfig`.

1. **Modello dati.** Una tabella `invitations` con i campi di `weddingConfig`
   più tema, testi, slug pubblico; una `guests` con il gruppo di invito e il
   token personale; una `rsvps` legata a `guest_id`.
2. **Link personalizzato.** `tuodominio.it/mario-e-lucia` (slug) oppure
   `…/mario-e-lucia/ab12cd` per il token del singolo invitato: l'invito saluta
   l'ospite per nome e precompila l'RSVP.
3. **Rendering.** Al posto delle costanti in `script.js`, un `GET /api/invitations/:slug`
   che restituisce il JSON di configurazione; la pagina resta questa, statica e
   veloce. Con Next.js/Astro si può passare a rendering server-side per SEO e
   anteprime social (Open Graph con i nomi degli sposi).
4. **RSVP reali.** `POST /api/rsvp` al posto di `localStorage` (in
   `initRSVP()` cambia una sola funzione), con notifica email/WhatsApp agli
   sposi ed esportazione CSV degli invitati.
5. **Login e area sposi.** Autenticazione (email magic link basta), dashboard
   con: dati dell'evento, upload foto, editor dei testi, anteprima live,
   lista invitati, stato delle conferme, allergie, numeri per il catering.
6. **Personalizzazione.** I token CSS in `:root` diventano un tema salvato sul
   database (palette, font, illustrazione della location). Tre o quattro temi
   di partenza + illustrazione su misura come servizio a valore aggiunto.
7. **Monetizzazione.** Prezzo per invito (una tantum) con dominio incluso per
   12 mesi; extra: illustrazione personalizzata della location, musica su
   licenza, gestione della lista nozze, stampa coordinata dei cartoncini con
   QR code che apre l'invito digitale.

---

*Wedding Invitation Experience · Demo — dati, foto e IBAN sono dimostrativi.*
