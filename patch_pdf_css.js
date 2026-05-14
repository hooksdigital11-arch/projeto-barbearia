const fs = require('fs');
const file = 'src/lib/insightsPDF.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the CSS block to add anti-Tailwind safeguards and !important rules
const cssRegex = /<style>([\s\S]*?)<\/style>/;

const newCSS = `<style>
/* ── ANTI-TAILWIND CRASH ── */
*, *::before, *::after { 
  margin: 0; padding: 0; box-sizing: border-box; 
  border-color: rgba(0,0,0,0);
  outline-color: rgba(0,0,0,0);
  text-decoration-color: rgba(0,0,0,0);
  background-color: transparent;
}

/* ── PÁGINA ── */
@page { size: A4; margin: 0; }

html, body {
  width: 210mm;
  background-color: #0a0a0a !important;
  color: #ffffff !important;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 12mm;
  background-color: #0a0a0a !important;
}

/* ── HEADER ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1.5px solid #00e5ff !important;
  padding-bottom: 8px;
  margin-bottom: 14px;
}
.brand  { font-size: 8px; font-weight: 700; letter-spacing: 3px; color: #00e5ff !important; text-transform: uppercase; }
.hname  { font-size: 14px; font-weight: 700; color: #ffffff !important; margin-top: 2px; }
.hsub   { font-size: 8px; color: #a3a3a3 !important; margin-top: 2px; }
.htitle { font-size: 30px; font-weight: 700; color: #ffffff !important; line-height: 1; text-align: right; }
.htitle span { color: #00e5ff !important; }
.hdate  { font-size: 7.5px; color: #a3a3a3 !important; text-align: right; margin-top: 3px; }

/* ── TÍTULO DE SEÇÃO ── */
.sec {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: #00e5ff !important;
  text-transform: uppercase;
  margin-top: 16px;
  margin-bottom: 7px;
  padding-left: 8px;
  border-left: 2.5px solid #00e5ff !important;
}

/* ── CARDS ── */
.cards { display: flex; gap: 6px; margin-bottom: 8px; }
.card  {
  flex: 1;
  background-color: #141414 !important;
  border: 1px solid #1f1f1f !important;
  border-radius: 6px;
  padding: 9px 9px 7px;
}
.clabel { font-size: 6.5px; font-weight: 700; letter-spacing: 1px; color: #a3a3a3 !important; text-transform: uppercase; margin-bottom: 5px; }
.cval   { font-size: 19px; font-weight: 700; color: #ffffff !important; line-height: 1; margin-bottom: 3px; }
.csub   { font-size: 7px; font-weight: 500; color: #00e5ff !important; }
.csub.g { color: #00e5ff !important; }
.csub.w { color: #f59e0b !important; }
.csub.d { color: #a3a3a3 !important; }
.cval.g { color: #00e5ff !important; }
.cval.w { color: #f59e0b !important; }
.cval.d { color: #a3a3a3 !important; }

/* ── KPI BOXES (agenda) ── */
.kpis { display: flex; gap: 6px; margin-bottom: 8px; }
.kpi  {
  flex: 1;
  background-color: #0f1f18 !important;
  border: 1px solid rgba(0, 229, 255, 0.15) !important;
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
}
.klabel { font-size: 6.5px; color: #a3a3a3 !important; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
.kval   { font-size: 15px; font-weight: 700; color: #00e5ff !important; }
.kval.d { color: #a3a3a3 !important; }
.kval.w { color: #f59e0b !important; }
.ksub   { font-size: 7px; color: #a3a3a3 !important; margin-top: 2px; }

/* ── TABELAS ── */
.twrap {
  background-color: #141414 !important;
  border: 1px solid #1f1f1f !important;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
table           { width: 100%; border-collapse: collapse; }
thead tr        { background-color: #1f1f1f !important; }
thead th        {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #00e5ff !important;
  text-transform: uppercase;
  padding: 7px 9px;
  text-align: left;
  border-bottom: 1px solid #2a2a2a !important;
}
tbody tr                  { border-bottom: 1px solid #1f1f1f !important; }
tbody tr:last-child        { border-bottom: none !important; }
tbody tr:nth-child(even)   { background-color: #1a1a1a !important; }
tbody td                  { font-size: 9px; color: #c0c0c0 !important; padding: 7px 9px; vertical-align: middle; }

/* ── TAGS ── */
.tag {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 20px;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.tag-green  { background-color: rgba(0, 229, 255, 0.1) !important; color: #00e5ff !important; border: 1px solid rgba(0, 229, 255, 0.2) !important; }
.tag-gray   { background-color: rgba(51, 51, 51, 0.2) !important; color: #777 !important;    border: 1px solid rgba(68, 68, 68, 0.2) !important; }
.tag-warn   { background-color: rgba(245, 158, 11, 0.1) !important; color: #f59e0b !important; border: 1px solid rgba(245, 158, 11, 0.2) !important; }
.tag-purple { background-color: rgba(157, 92, 255, 0.1) !important; color: #9d5cff !important; border: 1px solid rgba(157, 92, 255, 0.2) !important; }

/* ── NOTAS ── */
.note {
  border-radius: 5px;
  padding: 7px 10px;
  font-size: 7.5px;
  margin-bottom: 6px;
  background-color: #0f1f18 !important;
  border: 1px solid rgba(0, 229, 255, 0.15) !important;
  color: #00e5ff !important;
}
.note strong { color: #ffffff !important; font-weight: 700; }
.note.warn   { background-color: #1a1000 !important; border-color: rgba(245, 158, 11, 0.15) !important; color: #f59e0b !important; }

/* ── FOOTER ── */
.footer {
  margin-top: 18px;
  border-top: 1px solid #1f1f1f !important;
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fl, .fr { font-size: 7.5px; color: #a3a3a3 !important; }
.dot {
  display: inline-block;
  width: 4px; height: 4px;
  background-color: #00e5ff !important;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
</style>`;

content = content.replace(cssRegex, newCSS);
fs.writeFileSync(file, content);
console.log('CSS updated with anti-Tailwind safeguards.');
