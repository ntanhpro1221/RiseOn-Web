(() => {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  // Header background once the page scrolls
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Reveal on scroll
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${(i % 5) * 60}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Highlight the nav link of the section in view
  const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  // Course filter
  const filters = document.querySelectorAll(".filter");
  const courses = document.querySelectorAll(".course");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", String(b === btn)); });
    const f = btn.dataset.filter;
    courses.forEach((c) => c.classList.toggle("is-hidden", f !== "all" && c.dataset.cat !== f));
  }));

  document.getElementById("year").textContent = new Date().getFullYear();

  // Gallery lightbox
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const lbImg = lightbox.querySelector("img");
    const lbText = lightbox.querySelector("p");
    document.querySelectorAll(".shot button").forEach((btn) => btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbText.textContent = btn.closest("figure").querySelector("figcaption").textContent;
      lightbox.showModal();
    }));
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  // ---------- Pixel-art fighting game demo ----------
  const canvas = document.getElementById("pixelGame");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height, GROUND = 146;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 10x14 sprite: . empty, h hair, s skin, b body, d dark, w white(eye)
  const SPRITE = [
    "...hhhh...",
    "..hhhhhh..",
    "..hsswsh..",
    "..ssssss..",
    "...ssss...",
    "..bbbbbb..",
    ".bbbbbbbb.",
    "sbbbbbbbbs",
    "s.bbbbbb.s",
    "..dddddd..",
    "..dd..dd..",
    "..dd..dd..",
    "..dd..dd..",
    ".ddd..ddd.",
  ];
  const fighters = [
    { x: 56, dir: 1, body: "#f27d1c", hair: "#231f20", hp: 1, hit: 0 },
    { x: 244, dir: -1, body: "#ef4c24", hair: "#f9de0b", hp: 1, hit: 0 },
  ];
  const stars = Array.from({ length: 40 }, () => ({ x: Math.random() * W | 0, y: Math.random() * 100 | 0, t: Math.random() * 6 }));
  const projectiles = [];
  let turn = 0, timer = 0, frame = 0;

  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w, h); };

  function drawFighter(f, bob) {
    const S = 3, ox = f.x - 15, oy = GROUND - SPRITE.length * S + bob;
    const pal = { h: f.hair, s: "#f5c9a0", b: f.body, d: "#2b2226", w: "#ffffff" };
    SPRITE.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const ch = row[f.dir === 1 ? x : row.length - 1 - x];
        if (ch === ".") continue;
        px(ox + x * S, oy + y * S, S, S, f.hit > 0 && frame % 4 < 2 ? "#ffffff" : pal[ch]);
      }
    });
  }

  function drawScene() {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, "#1a1325");
    sky.addColorStop(1, "#4a1f1a");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    stars.forEach((s) => px(s.x, s.y, 1, 1, Math.sin(frame / 20 + s.t) > 0 ? "#f9de0b" : "#6b5a7a"));
    // pixel sun
    ctx.fillStyle = "#f27d1c"; ctx.beginPath(); ctx.arc(160, 120, 34, Math.PI, 0); ctx.fill();
    for (let i = 0; i < 4; i++) px(126, 104 + i * 8, 68, 3, "#4a1f1a");
    // mountains
    for (let x = 0; x < W; x += 4) {
      const h = 18 + Math.abs(Math.sin(x / 37) * 22) + Math.abs(Math.sin(x / 13) * 6);
      px(x, GROUND - h, 4, h, "#2a1a24");
    }
    // ground tiles
    px(0, GROUND, W, H - GROUND, "#231f20");
    for (let x = 0; x < W; x += 16) { px(x, GROUND, 14, 3, "#f6ad13"); px(x + 4, GROUND + 10, 6, 2, "#3a3233"); }
  }

  function drawHUD() {
    fighters.forEach((f, i) => {
      const x = i === 0 ? 10 : W - 110;
      px(x - 1, 9, 102, 8, "#111");
      px(x, 10, 100, 6, "#3a3233");
      px(i === 0 ? x : x + 100 - 100 * f.hp, 10, 100 * f.hp, 6, i === 0 ? "#f9de0b" : "#ef4c24");
    });
    px(W / 2 - 9, 7, 18, 12, "#111");
    ctx.fillStyle = "#fff"; ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
    ctx.fillText("VS", W / 2, 16);
  }

  function throwFrom(i) {
    const f = fighters[i], t = fighters[1 - i];
    projectiles.push({ x: f.x + f.dir * 14, y: GROUND - 30, vx: (t.x - f.x) / 60, vy: -2.2, rot: 0, target: 1 - i });
  }

  function step() {
    frame++;
    timer++;
    if (timer > 70) { timer = 0; throwFrom(turn); turn = 1 - turn; }
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.075; p.rot += 0.35;
      const t = fighters[p.target];
      if (Math.abs(p.x - t.x) < 12 && p.y > GROUND - 42) {
        t.hit = 14; t.hp = Math.max(0, t.hp - 0.18);
        projectiles.splice(i, 1);
        if (t.hp <= 0) fighters.forEach((f) => (f.hp = 1));
      } else if (p.y > GROUND) projectiles.splice(i, 1);
    }
    fighters.forEach((f) => { if (f.hit > 0) f.hit--; });
  }

  function render() {
    drawScene();
    fighters.forEach((f, i) => drawFighter(f, Math.round(Math.sin(frame / 10 + i * 2)) ));
    projectiles.forEach((p) => {
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      px(-4, -1, 8, 2, "#f9de0b"); px(-1, -4, 2, 8, "#f9de0b"); px(-1, -1, 2, 2, "#ef4c24");
      ctx.restore();
    });
    drawHUD();
  }

  if (reduced) { render(); return; }

  let running = false, raf = 0;
  const loop = () => { step(); render(); raf = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !running) { running = true; loop(); }
    else if (!e.isIntersecting && running) { running = false; cancelAnimationFrame(raf); }
  }).observe(canvas);
  render();
})();
