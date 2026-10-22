const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* 1. BOOT SCREEN */
const bootLines = [
  "> booting portfolio.os ...", "> loading skills ........ OK",
  "> scanning ports ......... OK", "> player found: ALI GOLAWALA", "> press any key... just kidding"
];
(async function boot() {
  const el = $("#bootText");
  for (const l of bootLines) {
    el.textContent += l + "\n";
    await new Promise(r => setTimeout(r, reduce ? 0 : 380));
  }
  setTimeout(() => $("#boot").classList.add("done"), 400);
})();

/* 2. MATRIX RAIN BACKGROUND */
const cv = $("#rain"), cx = cv.getContext("2d");
let cols, drops;
function sizeRain() {
  cv.width = innerWidth; cv.height = innerHeight;
  cols = Math.floor(cv.width / 16); drops = Array(cols).fill(1);
}
sizeRain(); addEventListener("resize", sizeRain);
function rain() {
  cx.fillStyle = "rgba(15,14,36,.12)";
  if (document.body.classList.contains("arcade")) cx.fillStyle = "rgba(255,246,220,.12)";
  cx.fillRect(0, 0, cv.width, cv.height);
  cx.fillStyle = getComputedStyle(document.body).getPropertyValue("--a");
  cx.font = "14px monospace";
  drops.forEach((y, i) => {
    cx.fillText(Math.random() > .5 ? "1" : "0", i * 16, y * 16);
    drops[i] = y * 16 > cv.height && Math.random() > .975 ? 0 : y + 1;
  });
}
if (!reduce) setInterval(rain, 60);

/* 3. TYPING EFFECT */
const roles = ["BSc-IT student", "UI/UX designer", "ethical hacker in training", "web developer"];
let ri = 0, ci = 0, del = false;
(function type() {
  const w = roles[ri];
  $("#typed").textContent = w.slice(0, ci);
  ci += del ? -1 : 1;
  let t = del ? 40 : 90;
  if (!del && ci > w.length) { del = true; t = 1400; }
  else if (del && ci < 0) { del = false; ri = (ri + 1) % roles.length; t = 300; }
  setTimeout(type, t);
})();

/* 4. CURSOR GLOW */
addEventListener("mousemove", e => {
  const g = $("#glow"); g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px";
});

/* 5. TOAST + XP SYSTEM */

/* 5. TOAST + XP SYSTEM */
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t.id);
  t.id = setTimeout(() => t.classList.remove("show"), 2600);
}

let level = 1;

function updateLevel() {
  const maxScroll =
    document.documentElement.scrollHeight - window.innerHeight;

  const p = maxScroll > 0
    ? window.scrollY / maxScroll
    : 0;

  const progress = Math.max(0, Math.min(p, 1));
  const newLevel = Math.min(5, Math.floor(progress * 5) + 1);

  $("#xpFill").style.width = progress * 100 + "%";

  if (newLevel !== level) {
    level = newLevel;
    $("#lvl").textContent = "LV " + level;

    if (level > 1) {
      toast("LEVEL UP! LV " + level);
    }
  }

  $$("section").forEach(s => {
    const a = $(`nav a[href="#${s.id}"]`);

    if (a) {
      a.classList.toggle(
        "on",
        s.getBoundingClientRect().top < innerHeight / 2 &&
        s.getBoundingClientRect().bottom > innerHeight / 2
      );
    }
  });
}

addEventListener("scroll", updateLevel, { passive: true });
addEventListener("load", updateLevel);


/* 6. SCROLL TRIGGERS: skill meters + badge unlock */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target;
  if (el.classList.contains("meter")) $("i", el).style.width = el.dataset.v + "%";
  if (el.classList.contains("badge")) {
    setTimeout(() => { el.classList.add("unlocked"); toast("ACHIEVEMENT: " + $("h3", el).textContent); },
      $$(".badge").indexOf(el) * 350);
  }
  io.unobserve(el);
}), { threshold: .6 });
$$(".meter,.badge").forEach(el => io.observe(el));

/* 7. 3D TILT ON PANELS */
$$(".tilt").forEach(c => {
  c.addEventListener("mousemove", e => {
    if (reduce) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    c.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  c.addEventListener("mouseleave", () => c.style.transform = "");
});

/* 8. INTERACTIVE TERMINAL */
const out = $("#out"), cmd = $("#cmd");
const say = t => { out.textContent += t + "\n"; out.scrollTop = out.scrollHeight; };
const cmds = {
  help: () => "Commands: about, skills, projects, certs, contact, hack, theme, clear",
  about: () => "Ali Golawala - SY BSc-IT student. Loves UI/UX, cybersecurity and football.",
  skills: () => "Java, Python, C, HTML, CSS, JavaScript, Figma, Nmap (learning)",
  projects: () => "1) UI/UX Project 01  2) UI/UX Project 02  3) Quiz Game  4) port scanner 5) Unitex",
  certs: () => "Generative AI | Ethical Hacker | Java | Generative AI on AWS",
  contact: () => "Email: aligolawala15@gmail.com | GitHub: aligolawala155",
  theme: () => { document.body.classList.toggle("arcade"); return "Theme switched."; },
  clear: () => { out.textContent = ""; return ""; },
  hack: () => { runHack(); return ""; },
  sudo: () => "Nice try. Permission denied.",
  profile: () => "Ali Golawala - SY BSc-IT student. UI/UX designer, cybersecurity and footballer."
};
async function runHack() {
  const steps = ["Scanning target...", "Bypassing firewall [##########] 100%", "Access granted.", "(Just a joke. I only hack ethically.)"];
  for (const s of steps) { say(s); await new Promise(r => setTimeout(r, 600)); }
  toast("ETHICAL HACKER MODE");
}
cmd.addEventListener("keydown", e => {
  if (e.key !== "Enter") return;
  const v = cmd.value.trim().toLowerCase(); cmd.value = "";
  say("$ " + v);
  const r = cmds[v] ? cmds[v]() : v ? `Unknown command "${v}". Type "help".` : "";
  if (r) say(r);
});
say('Welcome! Type "help" to begin.');

/* 9. THEME BUTTON + KONAMI CODE */
$("#theme").onclick = () => {
  document.body.classList.toggle("arcade");
  toast(document.body.classList.contains("arcade") ? "ARCADE MODE" : "CYBER MODE");
};
const kon = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let ki = 0;
addEventListener("keydown", e => {
  if (e.target === cmd) return;
  ki = e.key === kon[ki] ? ki + 1 : 0;
  if (ki === kon.length) { ki = 0; document.body.classList.toggle("arcade"); toast("SECRET UNLOCKED!"); }
});
