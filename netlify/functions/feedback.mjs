/* ============================================================
   Reviews & feedback (2026-10-30, Tony)

   The Hub's "★ REVIEWS & FEEDBACK" pop-up sends here.

   POST  /.netlify/functions/feedback
         { type: review|bug|idea, tools: [..], rating: 0-5, text, name,
           show: true/false, website (spam trap, must be empty),
           info: { app, lang, screen, installed, browser } }
         -> saved in Netlify Blobs (store "feedback", key items/<id>)
         -> emailed to Tony (Resend), subject starts [BUG] / [IDEA] / [REVIEW]
            so they are easy to spot. Review emails with "OK to show" ticked
            carry an APPROVE link. Every email has an INBOX link.
         Max 5 sends an hour per visitor (hashed IP, the IP itself is never kept).

   GET   ?reviews=1               -> approved reviews only (public, for the
                                     Hub's tape and the "What travellers say" tab)
   GET   ?approve=<id>&sig=..     -> Tony's link: put a review on the Hub
   GET   ?hide=<id>&sig=..        -> Tony's link: take it off again
   GET   ?inbox=1&sig=..          -> Tony's link: everything sent, bugs first
   (every one of these pages has a ✕ CLOSE button top right: closes the tab, or goes back / to the Hub when
    the phone won't let a page close itself -- 2026-10-31, Tony: no way out on mobile)
   GET   ?del=<id>&sig=..         -> Tony's link (in the inbox): asks "delete this?";
                                     &yes=1 deletes it for good (and takes it off the
                                     site if it was an approved review) (2026-10-31)

   2026-10-31: the other 5 sites (map/atlas/weather/translator/theme .nomansskyhub.app)
   send here too, from the shared nms-feedback.js -> CORS for *.nomansskyhub.app,
   info.site says which site it came from (shown in the email subject + inbox).

   Links are signed with FEEDBACK_SECRET (HMAC), so only Tony's emails work.

   Netlify settings this needs (Site configuration -> Environment variables):
     RESEND_API_KEY   same key as the Galactic Map site
     NOTIFY_EMAIL_TO  Tony's email
     FEEDBACK_SECRET  any long random text (signs the approve/inbox links)
   Without them feedback is still saved; the email/links are just skipped.
   ============================================================ */
import { getStore } from "@netlify/blobs";
import { createHmac, createHash, randomBytes } from "node:crypto";

const STORE = "feedback";
const TYPES = ["review", "bug", "idea"];
const TOOLS = ["hub", "map", "atlas", "weather", "translator", "theme"];
const TOOL_NAME = { hub: "Hub", map: "Galactic Map", atlas: "ATLAS", weather: "Weather", translator: "Translator", theme: "Theme Pack" };
const MAX_PER_HOUR = 5;
const SITE = "https://nomansskyhub.app";
const FN = SITE + "/.netlify/functions/feedback";

const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra }
});
// sister sites may post here (browser CORS); anything else is just same-origin as before
const ORIGIN_OK = /^https:\/\/([a-z0-9-]+\.)?nomansskyhub\.app$/;
const cors = req => {
  const o = req.headers.get("origin") || "";
  return ORIGIN_OK.test(o) ? { "access-control-allow-origin": o, "access-control-allow-methods": "GET, POST, OPTIONS", "access-control-allow-headers": "content-type", "access-control-max-age": "86400", "vary": "origin" } : {};
};
const page = (title, body, status = 200) => new Response(
  `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)}</title>
<style>body{margin:0;padding:20px;background:#0a1424;color:#cfe0f0;font:16px/1.5 system-ui,sans-serif}h1{font-size:1.1rem;letter-spacing:2px;color:#00e5ff}a{color:#00e5ff}
.it{border:1px solid rgba(0,229,255,.2);border-radius:8px;padding:10px 12px;margin:10px 0;background:rgba(255,255,255,.03)}.it.bug{border-color:#ff3322}.it.idea{border-color:#f0a500}
.k{font:12px monospace;letter-spacing:1px;color:rgba(207,224,240,.65)}.t{white-space:pre-wrap;margin:6px 0}.st{color:#f0a500}.ok{color:#00ff88}.tab a{margin-right:12px}h1{margin-right:96px}
#x{position:fixed;top:35px;right:14px;z-index:9;background:#0a1424;border:1px solid rgba(0,229,255,.45);border-radius:6px;color:#00e5ff;font:600 13px/1 system-ui,sans-serif;letter-spacing:1px;padding:10px 12px;cursor:pointer}</style>
<button id="x" type="button" onclick="window.close();setTimeout(function(){if(history.length>1)history.back();else location.href='https://nomansskyhub.app'},300)">✕ CLOSE</button>${body}`,
  { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function clean(s, max) { return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max); }

function sign(what) {
  const k = process.env.FEEDBACK_SECRET;
  return k ? createHmac("sha256", k).update(what).digest("hex").slice(0, 32) : "";
}
function okSig(what, sig) { const s = sign(what); return !!s && typeof sig === "string" && sig === s; }
const link = (what, q) => FN + "?" + q + "&sig=" + sign(what);

async function rebuildApproved(store) {
  const { blobs } = await store.list({ prefix: "items/" });
  const out = [];
  for (const b of blobs) {
    const it = await store.get(b.key, { type: "json" });
    if (it && it.type === "review" && it.show && it.approved) {
      out.push({ id: it.id, q: it.text, s: it.rating || 0, w: it.name || "", tools: it.tools || [], d: it.t });
    }
  }
  out.sort((a, b) => b.d - a.d);
  await store.setJSON("approved.json", out.slice(0, 40));
  return out.length;
}

async function sendEmail(it) {
  const key = process.env.RESEND_API_KEY, to = process.env.NOTIFY_EMAIL_TO;
  if (!key || !to) return { skipped: true };
  const tag = it.type === "bug" ? "[BUG]" : it.type === "idea" ? "[IDEA]" : "[REVIEW]";
  const tools = (it.tools || []).map(t => TOOL_NAME[t]).join(", ") || "no tool picked";
  const stars = it.rating ? " " + "★".repeat(it.rating) : "";
  const from = TOOL_NAME[it.info.site] || "Hub";
  const subject = `${tag} ${tools}${stars} — ${from} feedback`;
  const rows = [
    `<p style="white-space:pre-wrap;font-size:16px">${esc(it.text)}</p>`,
    `<p><b>From:</b> ${esc(it.name || "(no name)")}<br><b>Tools:</b> ${esc(tools)}${it.rating ? `<br><b>Rating:</b> ${"★".repeat(it.rating)}` : ""}`,
    `<br><b>OK to show on the site:</b> ${it.show ? "YES" : "no"}<br><b>Language:</b> ${esc(it.info.lang || "?")}<br><b>Sent from:</b> ${esc(from)}</p>`
  ];
  if (it.type === "bug") rows.push(`<p><b>Device:</b> ${esc(it.info.browser || "?")} · screen ${esc(it.info.screen || "?")} · ${it.info.installed ? "installed app" : "browser"} · ${esc(it.info.app || "")}</p>`);
  if (it.type === "review" && it.show && sign("approve" + it.id)) rows.push(`<p><a href="${link("approve" + it.id, "approve=" + it.id)}" style="background:#00e5ff;color:#00131a;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">✓ APPROVE — show it on the Hub</a></p>`);
  if (sign("inbox")) rows.push(`<p><a href="${link("inbox", "inbox=1")}">Open the feedback inbox</a></p>`);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify({ from: "NMS Hub Feedback <onboarding@resend.dev>", to: [to], subject, html: rows.join("") })
  });
  if (!res.ok) throw new Error("Resend " + res.status + " " + (await res.text()).slice(0, 200));
  return { sent: true };
}

async function inboxPage(store, url) {
  const only = url.searchParams.get("type");
  const { blobs } = await store.list({ prefix: "items/" });
  const items = [];
  for (const b of blobs) { const it = await store.get(b.key, { type: "json" }); if (it) items.push(it); }
  const order = { bug: 0, idea: 1, review: 2 };
  items.sort((a, b) => (order[a.type] - order[b.type]) || (b.t - a.t));
  const count = t => items.filter(i => i.type === t).length;
  const sig = url.searchParams.get("sig");
  const tabs = `<p class="tab"><a href="?inbox=1&sig=${sig}">ALL (${items.length})</a><a href="?inbox=1&type=bug&sig=${sig}">🐞 BUGS (${count("bug")})</a><a href="?inbox=1&type=idea&sig=${sig}">💡 IDEAS (${count("idea")})</a><a href="?inbox=1&type=review&sig=${sig}">★ REVIEWS (${count("review")})</a></p>`;
  const list = items.filter(i => !only || i.type === only).slice(0, 200).map(it => {
    const icon = it.type === "bug" ? "🐞 BUG" : it.type === "idea" ? "💡 IDEA" : "★ REVIEW";
    const tools = (it.tools || []).map(t => TOOL_NAME[t]).join(", ");
    let act = "";
    if (it.type === "review" && it.show) act = it.approved
      ? `<span class="ok">ON THE HUB</span> · <a href="${link("hide" + it.id, "hide=" + it.id)}">take it off</a>`
      : `<a href="${link("approve" + it.id, "approve=" + it.id)}">✓ approve</a>`;
    else if (it.type === "review") act = "private (not OK to show)";
    const del = `<a href="${link("del" + it.id, "del=" + it.id)}" style="color:#ff6b5e">delete</a>`;
    const dev = it.type === "bug" ? ` · ${esc(it.info.browser || "")} ${esc(it.info.screen || "")}${it.info.installed ? " · installed" : ""}` : "";
    return `<div class="it ${it.type}"><div class="k">${icon} · ${new Date(it.t).toISOString().slice(0, 16).replace("T", " ")} · ${esc(tools || "no tool")} · ${esc(it.info.lang || "")} · from ${esc(TOOL_NAME[it.info.site] || "Hub")}${dev}</div>
<div class="t">${it.rating ? `<span class="st">${"★".repeat(it.rating)}</span> ` : ""}${esc(it.text)}</div><div class="k">${esc(it.name || "(no name)")} ${act ? " · " + act : ""} · ${del}</div></div>`;
  }).join("") || "<p>Nothing yet.</p>";
  return page("Hub feedback inbox", `<h1>HUB FEEDBACK INBOX</h1>${tabs}${list}`);
}

export default async (req, context) => {
  const url = new URL(req.url);
  const store = getStore(STORE);
  const C = cors(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: C });

  if (req.method === "GET") {
    if (url.searchParams.get("reviews")) {
      const list = (await store.get("approved.json", { type: "json" })) || [];
      return json({ reviews: list }, 200, { "cache-control": "public, max-age=300", "access-control-allow-origin": "*" });
    }
    const sig = url.searchParams.get("sig");
    const dl = url.searchParams.get("del");
    if (dl) {
      const id = String(dl).replace(/[^a-z0-9]/gi, "");
      if (!okSig("del" + id, sig)) return page("Link not valid", "<h1>LINK NOT VALID</h1><p>This link doesn't work. Use the one in your feedback inbox.</p>", 403);
      const it = await store.get("items/" + id, { type: "json" });
      const back = `<p><a href="${link("inbox", "inbox=1")}">Back to the inbox</a></p>`;
      if (!it) return page("Not found", `<h1>ALREADY GONE</h1><p>That message isn't there any more.</p>${back}`, 404);
      if (url.searchParams.get("yes") !== "1") {
        return page("Delete?", `<h1>DELETE THIS MESSAGE?</h1><div class="it ${it.type}"><div class="t">${esc(it.text)}</div><div class="k">${esc(it.name || "(no name)")}</div></div>
<p>It is removed for good${it.approved ? " and taken off the site" : ""}. This can't be undone.</p>
<p><a href="${link("del" + id, "del=" + id)}&yes=1" style="background:#ff3322;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold">YES, DELETE IT</a></p>${back}`);
      }
      await store.delete("items/" + id);
      if (it.approved) await rebuildApproved(store);
      return page("Deleted", `<h1>DELETED</h1><p>“${esc(it.text)}” is gone.</p>${back}`);
    }
    const ap = url.searchParams.get("approve"), hd = url.searchParams.get("hide");
    if (ap || hd) {
      const id = String(ap || hd).replace(/[^a-z0-9]/gi, "");
      if (!okSig((ap ? "approve" : "hide") + id, sig)) return page("Link not valid", "<h1>LINK NOT VALID</h1><p>This link doesn't work. Use the one from your email.</p>", 403);
      const it = await store.get("items/" + id, { type: "json" });
      if (!it) return page("Not found", "<h1>NOT FOUND</h1>", 404);
      it.approved = !!ap;
      await store.setJSON("items/" + id, it);
      await rebuildApproved(store);
      return page(ap ? "Approved" : "Taken off", ap
        ? `<h1 class="ok">✓ APPROVED</h1><p>“${esc(it.text)}”</p><p>It's on the Hub now (can take up to 5 minutes to show). <a href="${link("hide" + id, "hide=" + id)}">Take it off again</a></p>`
        : `<h1>TAKEN OFF THE HUB</h1><p>“${esc(it.text)}”</p><p><a href="${link("approve" + id, "approve=" + id)}">Put it back</a></p>`);
    }
    if (url.searchParams.get("inbox")) {
      if (!okSig("inbox", sig)) return page("Link not valid", "<h1>LINK NOT VALID</h1>", 403);
      return inboxPage(store, url);
    }
    return json({ ok: true });
  }

  if (req.method !== "POST") return json({ error: "method" }, 405, C);

  let b;
  try { b = await req.json(); } catch (e) { return json({ error: "bad json" }, 400, C); }
  if (!b || typeof b !== "object") return json({ error: "bad json" }, 400, C);
  if (b.website) return json({ ok: true }, 200, C); // spam trap filled in: pretend it worked

  const type = TYPES.includes(b.type) ? b.type : "review";
  const text = clean(b.text, 1000);
  if (text.length < 3) return json({ error: "too short" }, 400, C);
  const tools = Array.isArray(b.tools) ? [...new Set(b.tools.filter(t => TOOLS.includes(t)))] : [];
  const rating = type === "review" ? Math.max(0, Math.min(5, b.rating | 0)) : 0;
  const name = clean(b.name, 40);
  const show = type === "review" && !!b.show;
  const inf = b.info && typeof b.info === "object" ? b.info : {};
  const info = { site: TOOLS.includes(inf.site) ? inf.site : "hub", app: clean(inf.app, 40), lang: clean(inf.lang, 8), screen: clean(inf.screen, 20), installed: !!inf.installed, browser: clean(inf.browser, 60) };

  // max 5 an hour per visitor; only a salted hash of the IP is kept, and only for that hour
  const ip = (context && context.ip) || req.headers.get("x-nf-client-connection-ip") || "";
  const hour = Math.floor(Date.now() / 36e5);
  const who = createHash("sha256").update((process.env.FEEDBACK_SECRET || "nms") + ip).digest("hex").slice(0, 20);
  const rlKey = `rl/${hour}/${who}`;
  const n = ((await store.get(rlKey, { type: "json" })) || 0) + 1;
  if (n > MAX_PER_HOUR) return json({ error: "slow down" }, 429, C);
  await store.setJSON(rlKey, n);

  const id = Date.now().toString(36) + randomBytes(3).toString("hex");
  const it = { id, t: Date.now(), type, tools, rating, text, name, show, approved: false, info };
  await store.setJSON("items/" + id, it);

  let mail = null;
  try { mail = await sendEmail(it); } catch (e) { console.log("feedback email failed: " + e.message); }
  console.log(`feedback: saved ${type} ${id}` + (mail && mail.sent ? " (emailed)" : ""));
  return json({ ok: true }, 200, C);
};
