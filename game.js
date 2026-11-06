/* Star Catcher - game HTML5 Canvas sederhana
   Aturan: tangkap bintang (+10), hindari meteor (-1 nyawa).
   Durasi 60 detik, 3 nyawa. */

(function () {
  "use strict";

  // ===== Konfigurasi =====
  var GAME_TITLE = "Star Catcher";
  var GAME_TIME = 60;        // detik
  var START_LIVES = 3;
  var STAR_POINTS = 10;
  var PLAYER_SPEED = 380;    // piksel per detik

  // ===== Elemen DOM =====
  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var elScore = document.getElementById("score");
  var elTime = document.getElementById("time");
  var elLives = document.getElementById("lives");
  var overlay = document.getElementById("overlay");
  var overlayTitle = document.getElementById("overlayTitle");
  var overlayText = document.getElementById("overlayText");
  var elBest = document.getElementById("best");
  var startBtn = document.getElementById("startBtn");
  var btnLeft = document.getElementById("btnLeft");
  var btnRight = document.getElementById("btnRight");

  var W = canvas.width;
  var H = canvas.height;

  // ===== Aset (path relatif) =====
  var starImg = new Image();
  var starReady = false;
  starImg.onload = function () { starReady = true; };
  starImg.onerror = function () {
    console.warn("assets/star.svg gagal dimuat, memakai gambar cadangan.");
  };
  starImg.src = "./assets/star.svg";

  // ===== State =====
  var state = "ready";   // ready | playing | over
  var score, timeLeft, lives, player, items, spawnTimer, elapsed, lastTs;
  var keys = { left: false, right: false };
  var touch = { left: false, right: false };
  var stars = [];        // bintang latar

  // Latar bintang kecil (dekorasi)
  for (var i = 0; i < 40; i++) {
    stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.5 });
  }

  // ===== Skor tertinggi (aman jika storage diblokir) =====
  function loadBest() {
    try { return parseInt(localStorage.getItem("starcatcher_best"), 10) || 0; }
    catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem("starcatcher_best", String(v)); } catch (e) { /* abaikan */ }
  }
  var best = loadBest();

  // ===== Reset / mulai ulang =====
  function resetGame() {
    score = 0;
    timeLeft = GAME_TIME;
    lives = START_LIVES;
    items = [];
    spawnTimer = 0;
    elapsed = 0;
    player = { w: 80, h: 24, x: W / 2 - 40, y: H - 50 };
    updateHud();
  }

  function startGame() {
    resetGame();
    state = "playing";
    overlay.classList.add("hidden");
    canvas.focus();
    lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  function endGame(reason) {
    state = "over";
    var isNewBest = score > best;
    if (isNewBest) { best = score; saveBest(best); }
    overlayTitle.textContent = reason === "time" ? "Waktu Habis!" : "Nyawa Habis!";
    overlayText.textContent = "Skor akhir: " + score + (isNewBest ? " (rekor baru!)" : "");
    elBest.textContent = "Skor tertinggi: " + best;
    startBtn.textContent = "Main Lagi";
    overlay.classList.remove("hidden");
  }

  // ===== HUD =====
  function updateHud() {
    elScore.textContent = score;
    elTime.textContent = Math.ceil(timeLeft);
    var hearts = "";
    for (var i = 0; i < START_LIVES; i++) hearts += i < lives ? "♥" : "♡";
    elLives.textContent = hearts;
  }

  // ===== Spawn objek jatuh =====
  function spawnItem() {
    var isMeteor = Math.random() < 0.35 + Math.min(elapsed / 200, 0.15);
    var size = isMeteor ? 34 : 32;
    items.push({
      type: isMeteor ? "meteor" : "star",
      x: Math.random() * (W - size) + size / 2,
      y: -size,
      size: size,
      vy: (isMeteor ? 190 : 150) + elapsed * 2.5 + Math.random() * 60,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 4
    });
  }

  // ===== Update =====
  function update(dt) {
    elapsed += dt;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateHud();
      endGame("time");
      return;
    }

    // Gerak pemain
    var dir = 0;
    if (keys.left || touch.left) dir -= 1;
    if (keys.right || touch.right) dir += 1;
    player.x += dir * PLAYER_SPEED * dt;
    if (player.x < 0) player.x = 0;
    if (player.x + player.w > W) player.x = W - player.w;

    // Spawn makin cepat seiring waktu
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnItem();
      spawnTimer = Math.max(0.35, 0.85 - elapsed * 0.008);
    }

    // Gerak objek + tabrakan
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      it.y += it.vy * dt;
      it.rot += it.vr * dt;

      var half = it.size / 2;
      var hit = it.y + half >= player.y &&
                it.y - half <= player.y + player.h &&
                it.x + half >= player.x &&
                it.x - half <= player.x + player.w;

      if (hit) {
        items.splice(i, 1);
        if (it.type === "star") {
          score += STAR_POINTS;
        } else {
          lives -= 1;
          if (lives <= 0) {
            updateHud();
            endGame("lives");
            return;
          }
        }
        updateHud();
      } else if (it.y - half > H) {
        items.splice(i, 1);
      }
    }
    updateHud();
  }

  // ===== Gambar =====
  function drawStar(it) {
    if (starReady) {
      ctx.drawImage(starImg, it.x - it.size / 2, it.y - it.size / 2, it.size, it.size);
      return;
    }
    // Gambar cadangan jika SVG belum/gagal dimuat
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var r = i % 2 === 0 ? it.size / 2 : it.size / 4;
      var a = (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(it.x + Math.cos(a) * r, it.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawMeteor(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    ctx.fillStyle = "#8a5a44";
    ctx.beginPath();
    ctx.arc(0, 0, it.size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5e3a2b";
    ctx.beginPath(); ctx.arc(-6, -4, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#ff7a45";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, it.size / 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Latar
    ctx.fillStyle = "#0b1026";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (var i = 0; i < stars.length; i++) {
      ctx.beginPath();
      ctx.arc(stars[i].x, stars[i].y, stars[i].r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!player) return;

    // Objek
    for (var j = 0; j < items.length; j++) {
      if (items[j].type === "star") drawStar(items[j]);
      else drawMeteor(items[j]);
    }

    // Pemain (keranjang)
    ctx.fillStyle = "#4fc3f7";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#b3e5fc";
    ctx.fillRect(player.x, player.y, player.w, 6);
  }

  // ===== Loop =====
  function loop(ts) {
    if (state !== "playing") { draw(); return; }
    var dt = Math.min((ts - lastTs) / 1000, 0.05); // batasi lonjakan frame
    lastTs = ts;
    update(dt);
    draw();
    if (state === "playing") requestAnimationFrame(loop);
  }

  // ===== Input keyboard =====
  window.addEventListener("keydown", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; e.preventDefault(); }
    if (k === "ArrowRight" || k === "d" || k === "D") { keys.right = true; e.preventDefault(); }
    if ((k === "Enter" || k === " ") && state !== "playing" && document.activeElement !== startBtn) {
      e.preventDefault();
      startGame();
    }
  });
  window.addEventListener("keyup", function (e) {
    var k = e.key;
    if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
    if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
  });
  window.addEventListener("blur", function () { keys.left = keys.right = false; });

  // ===== Input sentuh / pointer pada tombol layar =====
  function bindHold(btn, side) {
    function on(e) { e.preventDefault(); touch[side] = true; btn.classList.add("active"); }
    function off(e) { e.preventDefault(); touch[side] = false; btn.classList.remove("active"); }
    btn.addEventListener("pointerdown", on);
    btn.addEventListener("pointerup", off);
    btn.addEventListener("pointerleave", off);
    btn.addEventListener("pointercancel", off);
    btn.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  }
  bindHold(btnLeft, "left");
  bindHold(btnRight, "right");

  // Geser jari langsung pada canvas
  function moveToPointer(e) {
    if (state !== "playing") return;
    var rect = canvas.getBoundingClientRect();
    var x = (e.clientX - rect.left) * (W / rect.width);
    player.x = Math.max(0, Math.min(W - player.w, x - player.w / 2));
  }
  canvas.addEventListener("pointerdown", function (e) { canvas.focus(); moveToPointer(e); });
  canvas.addEventListener("pointermove", function (e) { if (e.buttons || e.pointerType === "touch") moveToPointer(e); });

  // ===== Tombol mulai =====
  startBtn.addEventListener("click", startGame);

  // ===== Tampilan awal =====
  document.title = GAME_TITLE;
  elBest.textContent = best ? "Skor tertinggi: " + best : "";
  resetGame();
  draw();
})();
