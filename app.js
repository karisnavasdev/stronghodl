// Drop the live links in here when you have them.
const CONFIG = {
  name: "Robinhodl",
  ticker: "HODL",
  ca: "0xcomingsoon",
  pair: "",
  twitter: "",
  pump: "",
  chainSlug: "robinhood",
};

const caNodes = document.querySelectorAll("#ca-value, .ca-echo");
caNodes.forEach((node) => {
  node.textContent = CONFIG.ca;
});

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
  twitterLabel.textContent = "Follow the fist";
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
}
resize();
window.addEventListener("resize", resize);

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
  requestAnimationFrame(draw);
}
draw();
