// Drop the live links in here when you have them.
const CONFIG = {
  name: "Robinhodl",
  ticker: "HODL",
  ca: "0x6006844435802bb4c75f5f5129ad6801d451418a",
  pair: "0x6006844435802bb4c75f5f5129ad6801d451418a",
  twitter: "https://x.com/HODLONROBIN",
  pump: "",
  chainSlug: "robinhood",
};

const caNodes = document.querySelectorAll("#ca-value, .ca-echo");
caNodes.forEach((node) => {
  node.textContent = CONFIG.ca;
});
const caSocial = document.getElementById("ca-social");
if (caSocial) {
  caSocial.textContent = `${CONFIG.ca.slice(0, 6)}…${CONFIG.ca.slice(-4)}`;
}

function flashCopied(button) {
  const original = button.textContent;
  button.textContent = "Copied";
  button.classList.add("copied");
  const toast = document.getElementById("toast");
  toast?.classList.add("show");
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove("copied");
    toast?.classList.remove("show");
  }, 1600);
}

async function copyCa(button) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(CONFIG.ca);
    } else {
      throw new Error("clipboard unavailable");
    }
  } catch {
    const input = document.createElement("textarea");
    input.value = CONFIG.ca;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }
  flashCopied(button);
}

document.getElementById("copy-ca")?.addEventListener("click", (event) => {
  copyCa(event.currentTarget);
});
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyCa(button));
});

const twitter = document.getElementById("twitter-link");
const twitterLabel = document.getElementById("twitter-label");
if (CONFIG.twitter) {
  twitter.href = CONFIG.twitter;
  twitter.target = "_blank";
  twitter.rel = "noopener noreferrer";
  twitter.classList.remove("soon");
  twitter.removeAttribute("aria-disabled");
  twitterLabel.textContent = "@HODLONROBIN";
}

const dexFrame = document.getElementById("dex-frame");
const dexSoon = document.getElementById("dex-soon");
const dexLink = document.getElementById("dex-link");
const chartLink = document.getElementById("chart-link");
if (CONFIG.pair) {
  const url = `https://dexscreener.com/${CONFIG.chainSlug}/${CONFIG.pair}?embed=1&theme=dark&info=0&trades=0`;
  const openUrl = `https://dexscreener.com/${CONFIG.chainSlug}/${CONFIG.pair}`;
  const iframe = document.createElement("iframe");
  iframe.src = url;
  iframe.title = "$HODL DexScreener chart";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  dexSoon.remove();
  dexFrame.appendChild(iframe);
  dexLink.href = openUrl;
  dexLink.target = "_blank";
  dexLink.rel = "noopener noreferrer";
  chartLink.href = openUrl;
  chartLink.target = "_blank";
  chartLink.rel = "noopener noreferrer";
}

const pumpLink = document.getElementById("pump-link");
if (CONFIG.pump) {
  pumpLink.href = CONFIG.pump;
  pumpLink.target = "_blank";
  pumpLink.rel = "noopener noreferrer";
}

document.getElementById("add-chain")?.addEventListener("click", async () => {
  if (!window.ethereum) {
    window.open("https://metamask.io/download/", "_blank", "noopener,noreferrer");
    return;
  }
  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x1237",
          chainName: "Robinhood Chain",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
          blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
        },
      ],
    });
  } catch (error) {
    console.warn(error);
  }
});

const canvas = document.getElementById("shards");
const ctx = canvas.getContext("2d");
const boltCanvas = document.getElementById("lightning");
const boltCtx = boltCanvas.getContext("2d");
const flashEl = document.getElementById("lightning-flash");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const shards = Array.from({ length: 28 }, () => ({
  x: Math.random(),
  y: Math.random(),
  s: 4 + Math.random() * 10,
  v: 0.08 + Math.random() * 0.18,
  a: Math.random() * Math.PI,
  gold: Math.random() > 0.78,
}));

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  boltCanvas.width = window.innerWidth;
  boltCanvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function displace(start, end, jag) {
  let pts = [start, end];
  let offset = jag;
  for (let pass = 0; pass < 6; pass += 1) {
    const next = [pts[0]];
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const disp = (Math.random() - 0.5) * offset;
      next.push({
        x: (a.x + b.x) / 2 + (-dy / len) * disp,
        y: (a.y + b.y) / 2 + (dx / len) * disp,
      }, b);
    }
    pts = next;
    offset *= 0.5;
  }
  return pts;
}

function strikeTarget() {
  const banner = document.querySelector(".hero-banner");
  const box = banner?.getBoundingClientRect();
  if (box && box.width && box.bottom > 40 && box.top < window.innerHeight) {
    return {
      x: box.left + box.width * (0.12 + Math.random() * 0.76),
      y: box.top + box.height * (0.18 + Math.random() * 0.55),
    };
  }
  return {
    x: window.innerWidth * (0.18 + Math.random() * 0.64),
    y: window.innerHeight * (0.3 + Math.random() * 0.4),
  };
}

function makeBolt() {
  const w = boltCanvas.width;
  const h = boltCanvas.height;
  const fromLeft = Math.random() < 0.12;
  const fromRight = Math.random() < 0.12;
  const start = fromLeft
    ? { x: -16, y: h * Math.random() * 0.28 }
    : fromRight
      ? { x: w + 16, y: h * Math.random() * 0.28 }
      : { x: w * (0.06 + Math.random() * 0.88), y: -24 };
  const end = strikeTarget();
  const jag = Math.min(w, h) * (0.14 + Math.random() * 0.08);
  const main = displace(start, end, jag);
  const branches = [];
  const count = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i += 1) {
    const origin = main[6 + Math.floor(Math.random() * Math.max(1, main.length - 10))];
    branches.push(displace(origin, {
      x: origin.x + (Math.random() - 0.5) * w * 0.24,
      y: origin.y + h * (0.06 + Math.random() * 0.16),
    }, jag * 0.42));
  }
  const sparks = Array.from({ length: 10 + Math.floor(Math.random() * 8) }, () => ({
    x: end.x,
    y: end.y,
    vx: (Math.random() - 0.5) * 6,
    vy: (Math.random() - 0.5) * 6,
    life: 1,
  }));
  return {
    main,
    branches,
    sparks,
    born: performance.now(),
    life: 260 + Math.random() * 180,
    flicker: Math.random() * 8,
    impactX: end.x / w,
  };
}

function strokeBolt(path, width, color, blur, alpha) {
  boltCtx.save();
  boltCtx.globalAlpha = alpha;
  boltCtx.strokeStyle = color;
  boltCtx.lineWidth = width;
  boltCtx.lineJoin = "round";
  boltCtx.lineCap = "round";
  boltCtx.shadowColor = "rgba(28, 255, 138, 0.95)";
  boltCtx.shadowBlur = blur;
  boltCtx.beginPath();
  boltCtx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i += 1) {
    boltCtx.lineTo(path[i].x, path[i].y);
  }
  boltCtx.stroke();
  boltCtx.restore();
}

function drawStrike(strike, now) {
  const t = (now - strike.born) / strike.life;
  if (t >= 1) return false;
  const flicker = 0.7 + Math.abs(Math.sin(now * 0.09 + strike.flicker)) * 0.3;
  const fade = t < 0.1 ? t / 0.1 : t > 0.78 ? (1 - t) / 0.22 : 1;
  const alpha = Math.max(0, fade * flicker);
  const hidden = Math.sin(now * 0.18 + strike.flicker) > 0.93;
  if (hidden && t > 0.2 && t < 0.55) return true;

  boltCtx.globalCompositeOperation = "lighter";
  strokeBolt(strike.main, 22, "rgba(28, 255, 138, 0.22)", 42, alpha);
  strokeBolt(strike.main, 9, "rgba(28, 255, 138, 0.62)", 22, alpha);
  strokeBolt(strike.main, 2.4, "rgba(240, 255, 248, 0.98)", 8, alpha);
  strike.branches.forEach((branch) => {
    strokeBolt(branch, 10, "rgba(28, 255, 138, 0.2)", 24, alpha * 0.9);
    strokeBolt(branch, 2, "rgba(210, 255, 232, 0.92)", 7, alpha);
  });
  strike.sparks.forEach((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.08;
    spark.life -= 0.045;
    if (spark.life <= 0) return;
    boltCtx.fillStyle = `rgba(28, 255, 138, ${spark.life * alpha})`;
    boltCtx.beginPath();
    boltCtx.arc(spark.x, spark.y, 1.4, 0, Math.PI * 2);
    boltCtx.fill();
  });
  boltCtx.globalCompositeOperation = "source-over";
  return true;
}

const strikes = [];
let nextStrikeAt = reduceMotion ? Infinity : performance.now() + 400;
let flashTimer = 0;

function triggerFlash(xNorm) {
  if (!flashEl) return;
  flashEl.style.setProperty("--lx", `${(xNorm * 100).toFixed(1)}%`);
  flashEl.classList.add("on");
  document.documentElement.classList.add("bolted");
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    flashEl.classList.remove("on");
    document.documentElement.classList.remove("bolted");
  }, 140);
}

function spawnStrike(now) {
  const bolt = makeBolt();
  strikes.push(bolt);
  triggerFlash(bolt.impactX);
  if (Math.random() > 0.45) {
    setTimeout(() => {
      const encore = makeBolt();
      encore.life *= 0.75;
      strikes.push(encore);
      triggerFlash(encore.impactX);
    }, 70 + Math.random() * 90);
  }
  nextStrikeAt = now + 1200 + Math.random() * 2800;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  shards.forEach((shard) => {
    shard.y -= shard.v * 0.0015;
    shard.a += 0.01;
    if (shard.y < -0.05) shard.y = 1.05;
    const x = shard.x * canvas.width;
    const y = shard.y * canvas.height;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(shard.a);
    ctx.fillStyle = shard.gold ? "rgba(255, 213, 79, 0.28)" : "rgba(28, 255, 138, 0.22)";
    ctx.beginPath();
    ctx.moveTo(0, -shard.s);
    ctx.lineTo(shard.s * 0.7, 0);
    ctx.lineTo(0, shard.s);
    ctx.lineTo(-shard.s * 0.7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  const now = performance.now();
  boltCtx.clearRect(0, 0, boltCanvas.width, boltCanvas.height);
  if (!reduceMotion) {
    if (now >= nextStrikeAt) spawnStrike(now);
    for (let i = strikes.length - 1; i >= 0; i -= 1) {
      if (!drawStrike(strikes[i], now)) strikes.splice(i, 1);
    }
  }
  requestAnimationFrame(draw);
}
draw();
