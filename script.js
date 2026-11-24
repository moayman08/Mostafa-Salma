const C = {
  groom: "مصطفى",
  bride: "سلمي",
  date: "2026-11-27",
  receptionTime: "19:00",
  startTime: "20:00",
  venue: "أمام المنزل",
  address: "نبروه, طريق المستشفي",
  mapQuery: "نبروه, طريق المستشفي",
  mapLink: "https://maps.app.goo.gl/ZuPFYBw8sAutVw2X9",
  photos: ["/pics/first.jpeg", "/pics/second.jpeg"],
};

// اجعلها true لتشغيل كل الحركات حتى لو الجهاز مفعّل "تقليل الحركة"
const FORCE_MOTION = true;

const $ = (id) => document.getElementById(id);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const motion = FORCE_MOTION || !matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = "cubic-bezier(.22,.8,.3,1)";
const toArabic = (n) => Number(n).toLocaleString("ar-EG").replace(/٬/g, "");
const eventStart = new Date(`${C.date}T${C.startTime}`);
const receptionStart = new Date(`${C.date}T${C.receptionTime}`);
const formatTime = (d) => d.toLocaleTimeString("ar-EG", { hour: "numeric", minute: "2-digit" });
const formatDate = (d, options) => d.toLocaleDateString("ar-EG", options);

document.documentElement.classList.toggle("has-motion", motion);

/* ---------- animation helpers ---------- */
const variants = {
  up: { transform: "translateY(28px)" },
  zoom: { transform: "translateY(30px) scale(.94)" },
  blur: { transform: "translateY(14px)", filter: "blur(6px)" },
  draw: { transform: "scaleX(.2)" },
  left: { transform: "translateX(-46px) rotate(-3deg)" },
  right: { transform: "translateX(46px) rotate(3deg)" },
};

function reveal(el, from, { duration = 850, delay = 0 } = {}) {
  const frames = motion
    ? [{ opacity: 0, ...from }, { opacity: 1, transform: "none", filter: "none" }]
    : [{ opacity: 0 }, { opacity: 1 }];
  const animation = el.animate(frames, { duration: motion ? duration : 300, delay: motion ? delay : 0, easing: ease, fill: "both" });
  animation.finished.then(() => { el.style.opacity = 1; animation.cancel(); }).catch(() => {});
  return animation;
}

function spawnRipple(button, event) {
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.detail ? event.clientX : rect.left + rect.width / 2;
  const y = event.detail ? event.clientY : rect.top + rect.height / 2;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x - rect.left - size / 2}px;top:${y - rect.top - size / 2}px`;
  button.append(ripple);
  setTimeout(() => ripple.remove(), 650);
}

/* ---------- content ---------- */
["coverGroom", "groomName"].forEach((id) => ($(id).textContent = C.groom));
["coverBride", "brideName"].forEach((id) => ($(id).textContent = C.bride));
$("coverDate").textContent = formatDate(eventStart, { day: "numeric", month: "long", year: "numeric" });
$("weekday").textContent = formatDate(eventStart, { weekday: "long" });
$("dayNumber").textContent = toArabic(eventStart.getDate());
$("monthName").textContent = formatDate(eventStart, { month: "long" });
$("yearNumber").textContent = toArabic(eventStart.getFullYear());
$("receptionTime").textContent = formatTime(receptionStart);
$("startTime").textContent = formatTime(eventStart);
$("venueName").textContent = C.venue;
$("venueAddress").textContent = C.address;
$("venueMap").src = `https://maps.google.com/maps?q=${encodeURIComponent(C.mapQuery)}&output=embed&hl=ar`;
$("mapLink").href = C.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.mapQuery)}`;

[0, 1].forEach((i) => {
  const photo = document.createElement("div");
  photo.className = "gallery__photo reveal";
  photo.dataset.reveal = i ? "left" : "right";
  if (C.photos[i]) photo.style.backgroundImage = `url("${C.photos[i]}")`;
  else photo.textContent = "مكان الصورة";
  $("gallery").append(photo);
});

/* ---------- countdown ---------- */
const units = [["daysLeft", 86400, Infinity], ["hoursLeft", 3600, 24], ["minutesLeft", 60, 60], ["secondsLeft", 1, 60]];

function updateCountdown() {
  const seconds = Math.max(0, Math.floor((eventStart - Date.now()) / 1000));
  units.forEach(([id, size, mod]) => {
    const el = $(id);
    const text = toArabic(Math.floor(seconds / size) % mod);
    if (el.textContent === text) return;
    el.textContent = text;
    if (motion) el.animate([{ transform: "translateY(-10px) rotateX(60deg)", opacity: 0.2 }, { transform: "none", opacity: 1 }], { duration: 380, easing: ease });
  });
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- calendar ---------- */
(function buildCalendar() {
  const year = eventStart.getFullYear();
  const month = eventStart.getMonth();
  const grid = $("calendarGrid");
  $("calendarTitle").textContent = formatDate(eventStart, { month: "long", year: "numeric" }).replace(/٬/g, "");
  ["س", "ح", "ن", "ث", "ر", "خ", "ج"].forEach((day) => grid.insertAdjacentHTML("beforeend", `<div class="calendar__weekday">${day}</div>`));
  const offset = (new Date(year, month, 1).getDay() + 1) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < offset; i++) grid.insertAdjacentHTML("beforeend", "<div></div>");
  for (let d = 1; d <= daysInMonth; d++) {
    const cls = d === eventStart.getDate() ? "calendar__day is-event" : "calendar__day";
    grid.insertAdjacentHTML("beforeend", `<div class="${cls}">${toArabic(d)}</div>`);
  }
})();

$("addToCalendar").addEventListener("click", () => {
  const stamp = (d) => d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0") +
    "T" + String(d.getHours()).padStart(2, "0") + String(d.getMinutes()).padStart(2, "0") + "00";
  const end = new Date(eventStart.getTime() + 4 * 3600 * 1000);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
    `SUMMARY:حفل خطوبة ${C.groom} و${C.bride}`,
    `DTSTART:${stamp(receptionStart)}`, `DTEND:${stamp(end)}`,
    `LOCATION:${C.venue} - ${C.address}`,
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = "engagement.ics";
  link.click();
});

/* ---------- scroll reveal ---------- */
$$(".section > *, .closing, .credits").forEach((el) => {
  el.classList.add("reveal");
  if (el.matches(".ornament")) el.dataset.reveal = "draw";
  if (el.matches(".hero")) el.dataset.reveal = "zoom";
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(({ isIntersecting, target }) => {
    if (!isIntersecting) return;
    observer.unobserve(target);
    reveal(target, variants[target.dataset.reveal || "up"], { delay: Number(target.dataset.delay) });
    if (motion && target.matches(".calendar")) {
      $("calendarGrid").querySelector(".is-event").animate(
        [{ transform: "scale(.4)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }],
        { duration: 700, delay: 400, easing: ease }
      );
    }
  });
}, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });

function watchPage() {
  $$("#page .reveal").forEach((el) => {
    if (el.dataset.delay === undefined) {
      const siblings = [...el.parentElement.children].filter((child) => child.classList.contains("reveal"));
      el.dataset.delay = siblings.indexOf(el) * 100;
    }
    observer.observe(el);
  });
}

/* ---------- opening the invitation ---------- */
const openButton = $("openButton");
const coverCard = $("coverCard");
let opened = false;

reveal(coverCard, variants.zoom, { duration: 1100, delay: 200 });
const idlePulse = motion
  ? openButton.animate(
      [{ boxShadow: "0 0 0 0 rgba(62,60,70,.35)" }, { boxShadow: "0 0 0 14px rgba(62,60,70,0)" }],
      { duration: 2200, iterations: Infinity }
    )
  : null;

function burstPetals() {
  for (let i = 0; i < 28; i++) {
    const petal = document.createElement("i");
    petal.className = "petal petal--burst";
    petal.style.cssText = `left:50%;top:50%;--size:${10 + Math.random() * 10}px`;
    document.body.append(petal);
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 240;
    petal.animate([
      { transform: "translate(-50%,-50%) scale(.4)", opacity: 0.95 },
      { transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px),calc(-50% + ${Math.sin(angle) * distance - 70}px)) rotate(${Math.random() * 540}deg)`, opacity: 0 },
    ], { duration: 1400 + Math.random() * 700, easing: ease }).onfinish = () => petal.remove();
  }
}

function startPage() {
  document.body.classList.remove("is-locked");
  window.scrollTo(0, 0);
  if (motion) {
    $$(".bloom svg").forEach((svg, i) => svg.animate(
      [{ transform: "scale(.5) rotate(-12deg)", opacity: 0 }, { transform: "none", opacity: 1 }],
      { duration: 1400, delay: 200 + i * 150, easing: ease }
    ));
  }
  watchPage();
}

function openInvitation() {
  if (opened) return;
  opened = true;
  if (idlePulse) idlePulse.cancel();
  openButton.animate(
    [{ transform: "scale(1)" }, { transform: "scale(.92)" }, { transform: "scale(1.05)" }, { transform: "scale(1)" }],
    { duration: 450, easing: ease }
  );
  if (motion) burstPetals();
  coverCard.animate(
    motion ? [{ transform: "none", opacity: 1 }, { transform: "translateY(-40px) scale(.94)", opacity: 0 }] : [{ opacity: 1 }, { opacity: 0 }],
    { duration: 700, delay: 250, easing: ease, fill: "forwards" }
  );
  const fade = $("cover").animate(
    motion ? [{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(10px)" }] : [{ opacity: 1 }, { opacity: 0 }],
    { duration: 900, delay: 600, easing: "ease-in", fill: "forwards" }
  );
  setTimeout(startPage, 750);
  fade.finished.then(() => { $("cover").style.display = "none"; });
}
openButton.addEventListener("click", openInvitation);

/* ---------- button ripple ---------- */
$$(".button").forEach((button) => button.addEventListener("click", (event) => {
  if (motion) spawnRipple(button, event);
}));

/* ---------- photo tilt (mouse only) ---------- */
if (motion && matchMedia("(hover: hover)").matches) {
  $$(".gallery__photo").forEach((photo) => {
    photo.addEventListener("pointermove", (event) => {
      const rect = photo.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      photo.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.03)`;
    });
    photo.addEventListener("pointerleave", () => { photo.style.transform = ""; });
  });
}

/* ---------- falling petals, parallax, progress bar ---------- */
if (motion) {
  for (let i = 0; i < 14; i++) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.cssText = `left:${Math.random() * 100}%;--size:${8 + Math.random() * 10}px;--duration:${14 + Math.random() * 14}s;--delay:-${Math.random() * 20}s`;
    $("garden").append(petal);
  }
}

const progress = document.createElement("div");
progress.className = "progress";
document.body.append(progress);

let scrollFrame = 0;
function onScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    if (motion) document.documentElement.style.setProperty("--scroll", scrollY);
  });
}
addEventListener("scroll", onScroll, { passive: true });
