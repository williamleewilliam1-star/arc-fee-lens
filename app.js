export const RPC_URL = "https://rpc.mainnet.arc.io";
export const EXPECTED_CHAIN_ID = 5042;
const SAMPLE_BLOCKS = 8;
const SAMPLE_TXS = 10;

export async function rpc(method, params = [], opts = {}) {
  const fetchImpl = opts.fetchImpl || fetch;
  const res = await fetchImpl(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: method, params: params }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error("RPC HTTP " + res.status);
  const body = await res.json();
  if (body.error) throw new Error(body.error.message || "RPC error");
  if (!("result" in body)) throw new Error("RPC result missing");
  return body.result;
}

export function hexToBigInt(value) {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) throw new Error("invalid RPC hex");
  return BigInt(value);
}

export function formatNative(raw, digits = 6) {
  const n = typeof raw === "bigint" ? raw : BigInt(raw);
  const base = 10n ** 18n;
  const whole = n / base;
  const frac = (n % base).toString().padStart(18, "0").slice(0, digits).replace(/0+$/, "");
  return String(whole) + (frac ? "." + frac : "");
}

export function receiptFee(receipt) {
  if (!receipt || !receipt.gasUsed || !receipt.effectiveGasPrice) throw new Error("receipt fee fields missing");
  return hexToBigInt(receipt.gasUsed) * hexToBigInt(receipt.effectiveGasPrice);
}

export function median(values) {
  if (!values.length) return 0n;
  const a = [...values].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0));
  const m = Math.floor(a.length / 2);
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2n;
}

async function collectSamples(latest) {
  const hashes = [];
  for (let i = 0; i < SAMPLE_BLOCKS && hashes.length < SAMPLE_TXS; i++) {
    const n = latest - BigInt(i);
    const block = await rpc("eth_getBlockByNumber", ["0x" + n.toString(16), false]);
    for (const h of (block && block.transactions) || []) {
      hashes.push({ hash: h, block: n });
      if (hashes.length >= SAMPLE_TXS) break;
    }
  }
  return Promise.all(hashes.map(async function (x) {
    const receipt = await rpc("eth_getTransactionReceipt", [x.hash]);
    return { hash: x.hash, block: x.block, receipt: receipt, fee: receiptFee(receipt) };
  }));
}

function shortHash(h) { return h ? h.slice(0, 8) + "…" + h.slice(-6) : "—"; }
function fmtGwei(hex) {
  const wei = hexToBigInt(hex);
  const scaled = Number(wei) / 1e9;
  return Number.isFinite(scaled) ? scaled.toFixed(4) + " gwei" : "—";
}

export async function refreshDashboard() {
  const health = document.querySelector("#health");
  health.textContent = "Connecting…"; health.className = "pill loading";
  try {
    const chainId = Number(hexToBigInt(await rpc("eth_chainId")));
    document.querySelector("#chain").textContent = String(chainId);
    if (chainId !== EXPECTED_CHAIN_ID) throw new Error("Wrong chain: expected 5042, got " + chainId);
    document.querySelector("#chainStatus").textContent = "verified Arc Mainnet";
    const latest = hexToBigInt(await rpc("eth_blockNumber"));
    document.querySelector("#block").textContent = latest.toLocaleString("en-US");
    const latestBlock = await rpc("eth_getBlockByNumber", ["0x" + latest.toString(16), false]);
    const ts = Number(hexToBigInt(latestBlock.timestamp));
    const age = Math.max(0, Math.round(Date.now() / 1000 - ts));
    document.querySelector("#blockAge").textContent = String(age) + "s ago";
    const samples = await collectSamples(latest);
    const fees = samples.map(function (x) { return x.fee; });
    document.querySelector("#sampleCount").textContent = String(samples.length);
    document.querySelector("#medianFee").textContent = samples.length ? formatNative(median(fees), 8) + " USDC" : "No tx";
    const rows = document.querySelector("#rows");
    rows.replaceChildren();
    if (!samples.length) {
      rows.innerHTML = '<tr><td colspan="5">No transactions found in the sampled blocks.</td></tr>';
    } else {
      for (const x of samples) {
        const tr = document.createElement("tr");
        const explorer = "https://arcscan.app/tx/" + encodeURIComponent(x.hash);
        tr.innerHTML =
          '<td><a href="' + explorer + '" target="_blank" rel="noreferrer">' + shortHash(x.hash) + '</a></td>' +
          '<td>' + x.block.toString() + '</td>' +
          '<td>' + hexToBigInt(x.receipt.gasUsed).toLocaleString("en-US") + '</td>' +
          '<td>' + fmtGwei(x.receipt.effectiveGasPrice) + '</td>' +
          '<td><strong>' + formatNative(x.fee, 8) + ' USDC</strong></td>';
        rows.append(tr);
      }
    }
    health.textContent = "Arc Mainnet live"; health.className = "pill ok";
  } catch (err) {
    health.textContent = "RPC unavailable"; health.className = "pill bad";
    document.querySelector("#rows").innerHTML = '<tr><td colspan="5">' + String(err.message || err) + '</td></tr>';
    throw err;
  }
}

export async function checkBalance(address) {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error("Enter a valid 0x address.");
  const chainId = Number(hexToBigInt(await rpc("eth_chainId")));
  if (chainId !== EXPECTED_CHAIN_ID) throw new Error("RPC is not Arc Mainnet.");
  return formatNative(hexToBigInt(await rpc("eth_getBalance", [address, "latest"])), 6);
}

if (typeof document !== "undefined") {
  document.querySelector("#refreshBtn").addEventListener("click", function () { refreshDashboard().catch(function () {}); });
  document.querySelector("#balanceForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const out = document.querySelector("#balanceResult");
    try {
      out.className = "result"; out.textContent = "Checking…";
      const value = await checkBalance(document.querySelector("#address").value.trim());
      out.innerHTML = "<strong>" + value + " USDC</strong> native Arc balance";
    } catch (err) {
      out.className = "result bad-text"; out.textContent = String(err.message || err);
    }
  });
  refreshDashboard().catch(function () {});
  setInterval(function () { refreshDashboard().catch(function () {}); }, 45000);
}
