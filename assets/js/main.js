(() => {
  const header = document.querySelector(".site-header");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  // Header background once the page scrolls
  // Header: background once the page scrolls; hidden completely while scrolling down, shown again on the way up
  let lastY = window.scrollY;
  // opening a #link / tapping a menu item scrolls the page by itself (smoothly): that's not "reading down"
  let autoScrollUntil = performance.now() + 1500;
  const autoScroll = () => { autoScrollUntil = performance.now() + 1200; };
  window.addEventListener("hashchange", autoScroll);
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest('a[href^="#"]')) autoScroll(); });
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    let tuck = header.classList.contains("is-tucked");
    if (y < 80 || header.classList.contains("menu-open")) tuck = false;
    else if (performance.now() < autoScrollUntil) tuck = false; // the page itself is scrolling to a #section: keep it
    else if (y > lastY + 8) tuck = true;
    else if (y < lastY - 8) tuck = false;
    else return; // small jitter: keep the current state and the reference point
    header.classList.toggle("is-tucked", tuck);
    document.documentElement.classList.toggle("header-tucked", tuck);
    lastY = y;
  };
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
  // Measured directly on load, scroll and resize instead of trusting IntersectionObserver alone: some mobile
  // browsers mis-report it after opening a #link (e.g. /#life), which left half-visible blocks stuck invisible.
  // Anything already scrolled past (above the screen) is shown too, so scrolling back up never finds a blank.
  let pending = Array.from(document.querySelectorAll(".reveal"));
  pending.forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 60}ms`; });
  const show = (el) => el.classList.add("is-visible");
  const sweep = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    pending = pending.filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < h - 24 || r.bottom <= 0) { show(el); return false; } // on screen (even a sliver) or above it
      return true;
    });
    if (!pending.length) ["scroll", "resize", "hashchange", "load", "pageshow"].forEach((ev) => window.removeEventListener(ev, onMove));
  };
  let sweepQueued = false;
  const onMove = () => { if (!sweepQueued) { sweepQueued = true; requestAnimationFrame(() => { sweepQueued = false; sweep(); }); } };
  ["scroll", "resize", "hashchange", "load", "pageshow"].forEach((ev) => window.addEventListener(ev, onMove, { passive: true }));
  sweep();
  setTimeout(sweep, 400); // after the browser's own jump to the #section

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
    // back in the hero (above every tracked section): nothing is active
    const clearTop = () => { if (sections[0] && window.scrollY + window.innerHeight * 0.5 < sections[0].offsetTop) links.forEach((a) => a.classList.remove("is-active")); };
    window.addEventListener("scroll", clearTop, { passive: true }); clearTop();
  }

  // Course filter
  const filters = document.querySelectorAll(".filter");
  const courses = document.querySelectorAll(".course");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-selected", String(b === btn)); });
    const f = btn.dataset.filter;
    courses.forEach((c) => {
      const hide = f !== "all" && c.dataset.cat !== f;
      (c.closest(".course-wrap") || c).classList.toggle("is-hidden", hide);
    });
  }));

  document.getElementById("year").textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero parallax: characters drift with the pointer at different depths
  const heroVisual = document.getElementById("heroVisual");
  if (heroVisual && !reducedMotion && window.matchMedia("(pointer: fine)").matches) {
    let raf = 0;
    window.addEventListener("pointermove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        heroVisual.style.setProperty("--mx", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        heroVisual.style.setProperty("--my", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    }, { passive: true });
  }

  // Learning path: the bun walks down the line as you scroll (staying near the middle of the screen),
  // lights up each step it reaches, and turns into the chef at the end
  const path = document.getElementById("path");
  if (path) {
    const walker = path.querySelector(".walker");
    const steps = [...path.querySelectorAll(".step")];
    let stopT = 0, lastY = -1;
    const update = () => {
      const r = path.getBoundingClientRect();
      const wh = walker.offsetHeight || 92;
      const first = steps[0].offsetTop, last = steps[steps.length - 1].offsetTop;
      // walker top follows the viewport's 55% line, clamped between the first and the last step
      const y = Math.min(last, Math.max(first, window.innerHeight * 0.55 - r.top - wh / 2));
      walker.style.setProperty("--y", `${y.toFixed(1)}px`);
      const p = (y - first) / Math.max(1, last - first);
      path.style.setProperty("--walked", p.toFixed(3));
      walker.classList.toggle("is-done", p >= 0.999);
      steps.forEach((s) => s.classList.toggle("is-reached", y >= s.offsetTop - 4));
      if (Math.abs(y - lastY) > 0.5 && lastY >= 0 && p < 0.999) {
        walker.classList.add("is-walking");
        clearTimeout(stopT);
        stopT = setTimeout(() => walker.classList.remove("is-walking"), 160);
      }
      lastY = y;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  // Character select
  // RiseOn Arena runs on the studio Mac mini. The Mac keeps play.json updated with its current public
  // address; office visitors arriving there are redirected by the game server to the faster LAN address.
  let gameUrl = "http://192.168.0.77:3000/";
  let playChar = "tiger";
  const playBtn = document.getElementById("playBtn");
  const updatePlay = () => { if (playBtn) playBtn.href = `${gameUrl}?char=${playChar}`; };
  fetch(`play.json?t=${Date.now()}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((c) => {
      if (c && c.url) { gameUrl = c.url; updatePlay(); }
      // Admin: the Mac's PIN-protected panel to switch the game server on/off (public link, LAN as fallback)
      if (c && (c.admin || c.adminLan)) document.querySelectorAll("[data-admin]").forEach((a) => { a.href = c.admin || c.adminLan; });
    })
    .catch(() => {});

  const TEAM = [
    { img: "tiger", name: "Hổ Thiền Debug", cls: "Tank · Backend", quote: "Bug đến thì ngồi thiền, bug đi thì ngồi tiếp.",
      stats: [["Code", 92], ["Design", 40], ["Meme", 85], ["Bình tĩnh", 99]], skills: [["🐯", "Gầm hổ", 8, "Sóng âm hất văng mọi kẻ xung quanh"], ["🧘", "Thiền định", 14, "3s giảm 70% sát thương, không bị đẩy lùi, hồi 20 máu"]] },
    { img: "cat", name: "Mèo Review", cls: "Support · QA", quote: "Code đẹp quá, cho em xin approve nha.",
      stats: [["Code", 70], ["Design", 75], ["Meme", 95], ["Dễ thương", 100]], skills: [["🐾", "Vồ mồi", 5, "Lao vút theo hướng ngắm, vồ trúng gây 16 sát thương"], ["🐈", "Chín mạng", 22, "Trong 6s, nếu bị hạ sẽ hồi sinh ở chỗ an toàn với 40 máu"]] },
    { img: "fruit", name: "Hiệp sĩ Trái cây", cls: "Mage · Game Design", quote: "Ý tưởng tươi mới mỗi ngày — theo nghĩa đen.",
      stats: [["Code", 55], ["Design", 96], ["Meme", 80], ["Vitamin", 100]], skills: [["🍉", "Mưa trái cây", 10, "Trái cây rơi ào ào xuống quanh điểm ngắm"], ["🥤", "Sinh tố", 15, "Hồi 35 máu và nạp đầy nhiên liệu bay"]] },
    { img: "trungthu", name: "Siêu sao Trung Thu", cls: "Fighter · Gameplay", quote: "SUGOI I-KOI! Sự kiện nào cũng phải có nhân vật chính.",
      stats: [["Code", 80], ["Design", 65], ["Meme", 90], ["Thể lực", 97]], skills: [["⭐", "Đèn ông sao", 6, "Ném ngôi sao bay ra rồi quay về, trúng được 2 lần"], ["🥮", "Bánh nướng", 9, "Lao thẳng xuống, tạo chấn động khi chạm đất"]] },
    { img: "studio", name: "Tân binh Studio", cls: "Rookie · Unity Dev", quote: "Hôm nay học Unity, mai ship game lên store!",
      stats: [["Code", 75], ["Design", 70], ["Meme", 88], ["Nhiệt huyết", 100]], skills: [["⏪", "Ctrl+Z", 10, "Quay ngược về vị trí 2 giây trước"], ["🛠️", "Spawn Prefab", 16, "Đặt tháp súng tự bắn kẻ địch gần nhất trong 6s"]] },
    { img: "xoan", name: "Xoăn Lễ Hội", cls: "Bard · Community", quote: "Đi đâu cũng mang theo không khí lễ hội.",
      stats: [["Code", 68], ["Design", 82], ["Meme", 93], ["Năng lượng", 100]], skills: [["🎉", "Pháo giấy", 7, "Ném quả pháo giấy, nổ tung khi chạm người hoặc sàn"], ["🎈", "Chùm bóng bay", 13, "4s lơ lửng nhẹ tênh: rơi chậm, bay không tốn nhiên liệu"]] },
    { img: "courage", name: "Chó Nhát Gan", cls: "Scout · QA Tester", quote: "Sợ thì sợ, nhưng bug thì vẫn phải tìm cho ra!",
      stats: [["Code", 60], ["Design", 58], ["Meme", 99], ["Hét to", 100]], skills: [["😱", "Hét thất thanh", 9, "Tiếng hét kinh hoàng thổi bay mọi kẻ ở gần"], ["💨", "Chạy mất dép", 12, "3s chạy nhanh gấp rưỡi, nhảy cao hơn, nhận ít hơn 40% sát thương"]] },
    { img: "soi", name: "Sói Đêm Trăng", cls: "Assassin · Night Shift", quote: "Deadline đêm nay? Trăng tròn rồi, sẵn sàng.",
      stats: [["Code", 88], ["Design", 60], ["Meme", 82], ["Thức khuya", 100]], skills: [["🐺", "Cào xé", 4.5, "Lướt tới, cào một nhát vòng cung trúng mọi kẻ phía trước"], ["🌕", "Tru trăng", 16, "6s cuồng hóa: đấm và Cào xé mạnh hơn 60%, hút 40% sát thương thành máu"]] },
    { img: "chidai", name: "Chị Đại", cls: "Leader · Producer", quote: "Mày nghĩ tao sợ deadline à?",
      stats: [["Code", 72], ["Design", 85], ["Meme", 90], ["Khí chất", 100]], skills: [["😏", "Mày nghĩ tao sợ?", 9, "1.5s thủ thế: chặn mọi đòn, phản lại kẻ tấn công 15 sát thương"], ["👁️", "Lườm cháy mặt", 7, "Ánh mắt tia laser xuyên thấu mọi kẻ trên đường ngắm"]] },
    { img: "tire", name: "Người Bánh Xe", cls: "Tank · DevOps", quote: "Pipeline chạy êm như lốp mới thay.",
      stats: [["Code", 84], ["Design", 50], ["Meme", 94], ["Bền bỉ", 100]], skills: [["🛞", "Lăn bánh", 6, "Cuộn tròn lăn vèo về phía trước, tông ai văng người đó"], ["🍜", "Mì ly tiếp sức", 14, "Hồi 25 máu và chạy nhanh hơn 35% trong 4s"]] },
    { img: "co", name: "Kỳ Thủ", cls: "Support · Marketing", quote: "Cờ cắm tới đâu, đội vui tới đó!",
      stats: [["Code", 66], ["Design", 78], ["Meme", 92], ["Nụ cười", 100]], skills: [["🚩", "Cắm cờ", 15, "Cắm cờ 6s: đứng gần cờ hồi 5 máu/giây và nhận ít hơn 30% sát thương"], ["🎌", "Phất cờ", 7, "Phất cờ quét một vòng, hất văng kẻ địch xung quanh"]] },
    { img: "dmc", name: "Thợ Săn Quỷ", cls: "Slayer · Gameplay", quote: "Quỷ khóc, thần sầu — bug cũng phải chạy.",
      stats: [["Code", 86], ["Design", 62], ["Meme", 91], ["Ngầu", 100]], skills: [["🗡️", "Stinger", 5.5, "Lao kiếm đâm thẳng theo hướng ngắm, xuyên qua và hất văng mọi kẻ trên đường"], ["🔫", "Ebony & Ivory", 7, "Rút song súng bắn một chùm 5 viên hình quạt"]] },
  ];
  const slots = [...document.querySelectorAll(".roster .slot")];
  const stageChar = document.getElementById("stageChar");
  if (slots.length && stageChar) {
    const $ = (id) => document.getElementById(id);
    const statsEl = $("pStats");
    const select = (i, focus) => {
      const m = TEAM[i];
      slots.forEach((s, n) => {
        const on = n === i;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-selected", String(on));
        s.tabIndex = on ? 0 : -1;
      });
      if (focus) slots[i].focus();
      // keep the picked slot visible when the roster is a sideways strip (phones); never scroll the page itself
      const strip = slots[i].parentElement;
      if (strip.scrollWidth > strip.clientWidth) strip.scrollTo({ left: slots[i].offsetLeft - strip.offsetLeft - (strip.clientWidth - slots[i].offsetWidth) / 2, behavior: "smooth" });
      stageChar.src = `assets/img/team/${m.img}.webp`;
      stageChar.alt = m.name;
      playChar = m.img;
      updatePlay();
      stageChar.classList.remove("is-swapping");
      void stageChar.offsetWidth; // restart the summon animation
      stageChar.classList.add("is-swapping");
      $("pClass").textContent = m.cls;
      $("pName").textContent = m.name;
      $("pQuote").textContent = `“${m.quote}”`;
      // the character's real skill set in RiseOn Arena
      $("pSkills").innerHTML = m.skills
        .map(([icon, name, cd, desc]) => `<li><span class="sk-ic">${icon}</span><span><b>${name}</b><small>hồi ${cd}s</small><em>${desc}</em></span></li>`).join("");
      statsEl.innerHTML = m.stats.map(([k, v]) =>
        `<li><span>${k}</span><div class="bar"><i data-v="${v}"></i></div><b>${v}</b></li>`).join("");
      requestAnimationFrame(() => statsEl.querySelectorAll(".bar i").forEach((b) => { b.style.width = `${b.dataset.v}%`; }));
    };
    slots.forEach((s, i) => {
      s.addEventListener("click", () => select(i));
      s.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        select((i + d + slots.length) % slots.length, true);
      });
    });
    TEAM.forEach((m) => { new Image().src = `assets/img/team/${m.img}.webp`; });
    select(0);
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
