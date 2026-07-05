/* =========================================================
   Liên & Giang — Wedding Invitation
   Vanilla JS controller
   ========================================================= */
(function () {
  "use strict";

  /* ---------- config ---------- */
  const RSVP_STORAGE_KEY = "lien_giang_rsvp";

  const WEDDING_DATE = new Date("2026-08-08T18:00:00+07:00").getTime();

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- loading screen ---------- */
  window.addEventListener("load", () => {
    const loader = $("#loader");
    if (!loader) return;
    setTimeout(() => loader.classList.add("is-hidden"), 1700);
  });

  /* ---------- envelope gate ---------- */
  const gate = $("#envelopeGate");
  const envelope = $("#envelope");
  const content = $("#content");
  const musicToggle = $("#musicToggle");

  function openInvitation() {
    if (!envelope || envelope.classList.contains("is-open")) return;
    envelope.classList.add("is-open");
    musicToggle.classList.add("is-active");

    // reveal site after the letter lifts
    setTimeout(() => {
      if (gate) gate.classList.add("is-open");
      if (content) {
        content.classList.add("is-revealed");
        content.setAttribute("aria-hidden", "false");
      }
      // attempt autoplay
      tryStartMusic();
      // first reveal pass
      runReveal();
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 1100);
  }

  if (envelope) {
    envelope.addEventListener("click", openInvitation);
    envelope.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openInvitation(); }
    });
  }

  /* ---------- background music ---------- */
  let audio = null;
  function buildAudio() {
    if (audio) return audio;
    audio = new Audio("assets/music/background-music.wav");
    audio.loop = true;
    audio.volume = 0.4;
    audio.preload = "auto";
    return audio;
  }
  function tryStartMusic() {
    if (prefersReduced) return;
    buildAudio();
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => musicToggle.classList.add("is-playing")).catch(() => {
        // autoplay blocked — wait for first user gesture
        const resume = () => {
          audio.play().then(() => musicToggle.classList.add("is-playing")).catch(() => {});
          window.removeEventListener("click", resume);
          window.removeEventListener("touchstart", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("click", resume, { once: true });
        window.addEventListener("touchstart", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      });
    }
  }
  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      buildAudio();
      if (audio.paused) { audio.play().then(() => musicToggle.classList.add("is-playing")).catch(() => {}); }
      else { audio.pause(); musicToggle.classList.remove("is-playing"); }
    });
  }

  /* ---------- nav scroll state ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("is-scrolled", y > 40);
    if (progress) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- hero parallax ---------- */
  const heroBg = $(".hero__bg");
  if (heroBg && !prefersReduced) {
    window.addEventListener("scroll", () => {
      const y = window.scrollY || 0;
      if (y < window.innerHeight) heroBg.style.transform = `scale(1.06) translateY(${y * 0.18}px)`;
    }, { passive: true });
  }

  /* ---------- countdown ---------- */
  const cdNums = $$(".countdown__num");
  function tickCountdown() {
    const now = Date.now();
    let diff = Math.max(0, WEDDING_DATE - now);
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);
    const map = { days, hours, minutes: mins, seconds: secs };
    cdNums.forEach((el) => {
      const v = map[el.dataset.unit];
      if (v != null) el.textContent = String(v).padStart(2, "0");
    });
  }
  tickCountdown();
  setInterval(tickCountdown, 1000);

  /* ---------- gallery (20 placeholders) ---------- */
  const galleryGrid = $("#galleryGrid");
  if (galleryGrid) {
    const captions = [
      "Lần đầu gặp gỡ", "Chiều thu Hà Nội", "Sách & cà phê", "Chuyến Sa Pa",
      "Tuyết đầu mùa", "Hoa ban dốc núi", "Ngày dọn nhà", "Bữa sáng đầu tiên",
      "Hoàng hôn Hạ Long", "Câu hỏi quan trọng", "Cái gật đầu", "Ngày đính ước",
      "Chụp ảnh cưới", "Khoảnh khắc lặng im", "Nụ cười cô dâu", "Ánh mắt chú rể",
      "Hoa cưới trong tay", "Vuốt ve tà áo", "Bàn tay đan nhau", "Đếm ngược ngày vui"
    ];
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= 20; i++) {
      const tile = document.createElement("figure");
      tile.className = "gallery__tile" + (i % 5 === 0 ? " gallery__tile--wide" : "");
      tile.setAttribute("data-index", i);
      tile.innerHTML =
        `<img src="assets/images/gallery-${String(i).padStart(2, "0")}.svg"
              alt="${captions[i - 1]} — ảnh cưới số ${i} của Liên và Giang"
              loading="lazy" width="800" height="600" />`;
      frag.appendChild(tile);
    }
    galleryGrid.appendChild(frag);
    // lightbox
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML = `<button class="lightbox__close" aria-label="Đóng">×</button><img class="lightbox__img" alt="" />`;
    document.body.appendChild(lb);
    const lbImg = $(".lightbox__img", lb);
    const lbClose = $(".lightbox__close", lb);
    galleryGrid.addEventListener("click", (e) => {
      const tile = e.target.closest(".gallery__tile");
      if (!tile) return;
      const img = $("img", tile);
      if (!img) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
    function closeLb() { lb.classList.remove("is-open"); document.body.style.overflow = ""; }
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });
  }

  /* ---------- QR gift (generated) ---------- */
  const giftQr = $("#giftQr");
  if (giftQr) {
    // Generate a decorative QR-like placeholder matrix (no external dependency).
    // Encodes a symbolic "wedding gift" payload for visual purposes.
    const SIZE = 21; // classic QR module count
    const cells = [];
    // deterministic pseudo-pattern
    let seed = 0x9cae8b;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed; }
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const finder = (x < 7 && y < 7) || (x >= SIZE - 7 && y < 7) || (x < 7 && y >= SIZE - 7);
        let on = false;
        if (finder) {
          const fx = x < 7 ? x : x - (SIZE - 7);
          const fy = y < 7 ? y : y - (SIZE - 7);
          on = (fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4));
        } else {
          on = (rnd() & 1) === 1;
        }
        cells.push(on);
      }
    }
    const unit = 10;
    const dim = SIZE * unit;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" role="img" aria-label="Mã QR mừng cưới">`;
    svg += `<rect width="${dim}" height="${dim}" fill="#ffffff"/>`;
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i]) continue;
      const x = (i % SIZE) * unit;
      const y = Math.floor(i / SIZE) * unit;
      svg += `<rect x="${x}" y="${y}" width="${unit}" height="${unit}" fill="#2b2b2b"/>`;
    }
    svg += `</svg>`;
    giftQr.innerHTML = svg;
  }

  /* ---------- reveal on scroll ---------- */
  let revealObserver = null;
  function runReveal() {
    const els = $$(".reveal, .gallery__tile");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revealObserver.unobserve(en.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    }
    els.forEach((el) => {
      if (!el.classList.contains("is-in")) revealObserver.observe(el);
    });
  }

  /* ---------- smooth scroll for anchor links ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 10;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ---------- RSVP form ---------- */
  const form = $("#rsvpForm");
  const status = $("#rsvpStatus");
  const submitBtn = $("#rsvpSubmit");

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.classList.remove("is-ok", "is-err");
    if (kind) status.classList.add(kind);
  }
  function setFieldError(name, msg) {
    const field = document.querySelector(`.field input[name="${name}"], .field select[name="${name}"], .field textarea[name="${name}"]`);
    if (!field) return;
    const wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("is-invalid", !!msg);
    const err = wrap.querySelector(`.field__error[data-for="${name}"]`);
    if (err) err.textContent = msg || "";
  }

  function saveRsvpLocally(data) {
    try {
      const prev = JSON.parse(localStorage.getItem(RSVP_STORAGE_KEY) || "[]");
      prev.push({ ...data, created_at: new Date().toISOString() });
      localStorage.setItem(RSVP_STORAGE_KEY, JSON.stringify(prev));
      return true;
    } catch (_) {
      return false;
    }
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = {
        name: (form.name.value || "").trim(),
        email: (form.email.value || "").trim() || null,
        phone: (form.phone.value || "").trim() || null,
        attending: (form.attending.value || "").trim(),
        guests: Math.max(0, Math.min(10, parseInt(form.guests.value, 10) || 1)),
        meal: (form.meal.value || "").trim() || null,
        message: (form.message.value || "").trim() || null,
      };

      let ok = true;
      setFieldError("name", "");
      setFieldError("email", "");
      if (!data.name) { setFieldError("name", "Vui lòng nhập họ tên."); ok = false; }
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setFieldError("email", "Email không hợp lệ."); ok = false; }
      if (!data.attending) { setStatus("Vui lòng cho biết quý khách có tham dự hay không.", "is-err"); ok = false; }
      if (!ok) return;

      submitBtn.disabled = true;
      setStatus("Đang gửi xác nhận...", "");
      try {
        await new Promise((r) => setTimeout(r, 500));
        saveRsvpLocally(data);
        setStatus("Cảm ơn quý khách! Xác nhận của quý khách đã được ghi nhận.", "is-ok");
        form.reset();
      } catch (_) {
        setStatus("Gửi không thành công. Quý khách vui lòng thử lại.", "is-err");
      }
      submitBtn.disabled = false;
    });
  }

  /* ---------- flower petals ---------- */
  const canvas = $("#petals");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let petals = [];

    function resize() {
      w = canvas.clientWidth = window.innerWidth;
      h = canvas.clientHeight = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function spawn(n) {
      for (let i = 0; i < n; i++) petals.push(makePetal(true));
    }
    function makePetal(initial) {
      const r = 6 + Math.random() * 10;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -20 - Math.random() * 80,
        r,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.4 + Math.random() * 0.9,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        sway: Math.random() * Math.PI * 2,
        swayAmp: 0.4 + Math.random() * 0.8,
        hue: Math.random() < 0.5 ? "sage" : "gold",
        alpha: 0.5 + Math.random() * 0.4,
      };
    }
    function drawPetal(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      const grad = ctx.createLinearGradient(0, -p.r, 0, p.r);
      if (p.hue === "sage") { grad.addColorStop(0, "rgba(185,200,166,0.95)"); grad.addColorStop(1, "rgba(156,174,139,0.6)"); }
      else { grad.addColorStop(0, "rgba(230,217,182,0.95)"); grad.addColorStop(1, "rgba(201,184,140,0.6)"); }
      ctx.fillStyle = grad;
      // petal shape
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * 0.8, -p.r * 0.4, p.r * 0.8, p.r * 0.4, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.8, p.r * 0.4, -p.r * 0.8, -p.r * 0.4, 0, -p.r);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    let last = 0;
    function loop(t) {
      const dt = Math.min(40, t - last); last = t;
      ctx.clearRect(0, 0, w, h);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.sway += 0.02;
        p.x += p.vx + Math.sin(p.sway) * p.swayAmp * 0.3;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h + 30) { petals.splice(i, 1); continue; }
        drawPetal(p);
      }
      if (petals.length < 60 && Math.random() < 0.08) petals.push(makePetal(false));
      requestAnimationFrame(loop);
    }
    resize();
    spawn(40);
    window.addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(loop);
  }

  /* ---------- run reveal once DOM is ready ---------- */
  if (document.readyState !== "loading") runReveal();
  else document.addEventListener("DOMContentLoaded", runReveal);

})();
