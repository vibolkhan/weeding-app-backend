// assets/js/countdown.js

// ---- CONFIG: set your target event date/time here (ISO 8601) ----
const COUNTDOWN_TARGET = "2026-03-05T16:40:00+07:00";

// Use existing Khmer numeral helpers if available, otherwise fall back to plain digits.
function toKhmerDigits(n) {
  if (typeof window.convertToKhmerNumerals === "function") {
    return window.convertToKhmerNumerals(String(n));
  }
  // Fallback: plain numbers
  return String(n);
}

function pad2(n) {
  n = Math.max(0, n|0);
  return n < 10 ? "0" + n : String(n);
}

function formatKhmer(n) {
  // Keep two digits for H/M/S; days can be long
  return toKhmerDigits(n);
}

function renderCountdown(msLeft) {
  const el = document.getElementById("countdown");
  if (!el) return;

  if (msLeft <= 0) {
    el.textContent = "ពិធីបានចាប់ផ្តើមហើយ";
    el.classList.remove("animate-breathing");
    return;
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Khmer labels
  const dLabel = "ថ្ងៃ";
  const hLabel = "ម៉ោង";
  const mLabel = "នាទី";
  const sLabel = "វិនាទី";

  el.innerHTML = `
    <span>${formatKhmer(days)} ${dLabel}</span>
    <span> : ${formatKhmer(pad2(hours))} ${hLabel}</span>
    <span> : ${formatKhmer(pad2(minutes))} ${mLabel}</span>
    <span> : ${formatKhmer(pad2(seconds))} ${sLabel}</span>
  `;
}

(function initCountdown() {
  // Prefer dayjs if you’ve already loaded it; otherwise use Date.
  const target = (typeof dayjs === "function")
    ? dayjs(COUNTDOWN_TARGET).toDate().getTime()
    : new Date(COUNTDOWN_TARGET).getTime();

  function tick() {
    const now = Date.now();
    renderCountdown(target - now);
  }

  tick(); // first paint
  setInterval(tick, 1000);
})();
