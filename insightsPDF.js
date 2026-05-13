// ============================================================
// insightsPDF.js
// Cole este arquivo no seu projeto e importe onde precisar.
// Dependência: npm install html2pdf.js
// ============================================================

import html2pdf from 'html2pdf.js';

// ─────────────────────────────────────────────────────────────
// PONTO DE ENTRADA — chame esta função no onClick do botão
// ─────────────────────────────────────────────────────────────
//
// Exemplo de uso:
//   import { downloadInsightsPDF } from './insightsPDF';
//   <button onClick={() => downloadInsightsPDF(seuObjetoDeDados)}>
//     Baixar PDF
//   </button>
//
// O parâmetro `data` deve seguir a interface InsightsData abaixo.
// ─────────────────────────────────────────────────────────────

export async function downloadInsightsPDF(data) {
  const html = buildHTML(data);

  await html2pdf()
    .set({
      margin:   0,
      filename: `insights_${(data.barbearia?.barbeiro ?? 'relatorio').replace(/\s+/g, '_')}.pdf`,
      image:    { type: 'jpeg', quality: 1 },
      html2canvas: {
        scale:           3,
        useCORS:         true,
        backgroundColor: '#0d0d0d',
        logging:         false,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(html)
    .save();
}

// ─────────────────────────────────────────────────────────────
// INTERFACE DE DADOS (TypeScript — apague se usar JS puro)
// ─────────────────────────────────────────────────────────────
//
// interface InsightsData {
//   barbearia: { nome: string; barbeiro: string; }
//   periodo:   string            // ex: "Semana 12/05/2026"
//   dataGeracao: string          // ex: "12/05/2026"
//   receita: {
//     faturamentoTotal:    number   // ex: 670
//     variacaoSemana:      string   // ex: "+100%" | "-5%"
//     ticketMedio:         number   // ex: 134
//     totalAtendimentos:   number   // ex: 5
//     pagamentosPendentes: number   // ex: 4
//     valorPresente:       number   // ex: 0
//     topServicos: Array<{
//       nome:         string
//       categoria:    string
//       faturamento:  number | null  // null = sem valor individual
//       participacao: string         // ex: "Top Receita" | "~60% do mix"
//       destaque:     boolean        // true = aparece na nota de destaque
//     }>
//   }
//   agenda: {
//     total:         number
//     confirmados:   number
//     cancelados:    number
//     noShow:        number
//     taxaConclusao: number   // 0–100
//     porDia: Array<{
//       dia:           string  // ex: "Segunda-feira"
//       agendamentos:  number
//       concluidos:    number
//     }>
//   }
//   clientes: {
//     total:        number
//     ativos:       number
//     novos:        number
//     taxaRetencao: number   // 0–100
//     satisfacao:   number   // 0–100
//     lista: Array<{
//       nome:        string
//       status:      'ATIVO' | 'INATIVO'
//       faturamento: number
//       observacao:  string
//     }>
//   }
//   equipe: Array<{
//     nome:          string
//     avaliacao:     number   // 0–5
//     agendamentos:  number
//     faturamento:   number
//     status:        'ATIVO' | 'INATIVO'
//   }>
//   fidelidade: {
//     inscritos:           number
//     pontosResgatados:    number
//     presentesMes:        number
//     progressaoMedia:     string   // ex: "0/10"
//     clientesBonificados: number   // percentual 0–100
//   }
// }

// ─────────────────────────────────────────────────────────────
// FUNÇÕES AUXILIARES (internas)
// ─────────────────────────────────────────────────────────────

function moeda(v) {
  const n = Number(v) || 0;
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(v) {
  return `${Number(v) || 0}%`;
}

function estrelas(n) {
  const r = Math.min(5, Math.max(0, Math.round(Number(n) || 0)));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function tagServico(participacao) {
  if (!participacao) return 'tag-gray';
  const p = participacao.toLowerCase();
  if (p.includes('top'))  return 'tag-green';
  if (p.includes('mix') || p.includes('%')) return 'tag-purple';
  return 'tag-gray';
}

// ─────────────────────────────────────────────────────────────
// GERADOR DE LINHAS DE TABELA
// ─────────────────────────────────────────────────────────────

function rowsServicos(lista) {
  if (!lista || lista.length === 0) {
    return '<tr><td colspan="4" style="color:#555;text-align:center">Sem dados</td></tr>';
  }
  return lista.map(s => `
    <tr>
      <td><strong style="color:#fff">${s.nome ?? '—'}</strong></td>
      <td>${s.categoria ?? '—'}</td>
      <td>${s.faturamento != null ? `<strong style="color:#00e5a0">R$ ${moeda(s.faturamento)}</strong>` : '—'}</td>
      <td><span class="tag ${tagServico(s.participacao)}">${s.participacao ?? '—'}</span></td>
    </tr>`).join('');
}

function rowsAgenda(lista) {
  if (!lista || lista.length === 0) {
    return '<tr><td colspan="4" style="color:#555;text-align:center">Sem dados</td></tr>';
  }
  return lista.map(d => {
    const ok = Number(d.concluidos) > 0;
    const label = ok ? (Number(d.concluidos) > 1 ? 'Concluídos' : 'Concluído') : 'Sem atendimentos';
    return `
    <tr>
      <td>${d.dia ?? '—'}</td>
      <td>${d.agendamentos ?? 0}</td>
      <td>${d.concluidos ?? 0}</td>
      <td><span class="tag ${ok ? 'tag-green' : 'tag-gray'}">${label}</span></td>
    </tr>`;
  }).join('');
}

function rowsClientes(lista, satisfacao) {
  if (!lista || lista.length === 0) {
    return '<tr><td colspan="5" style="color:#555;text-align:center">Sem dados</td></tr>';
  }
  return lista.map(c => `
    <tr>
      <td><strong style="color:#fff">${c.nome ?? '—'}</strong></td>
      <td><span class="tag ${c.status === 'ATIVO' ? 'tag-green' : 'tag-gray'}">${c.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td>
      <td>R$ ${moeda(c.faturamento)}</td>
      <td><span style="color:#00e5a0">${pct(satisfacao)}</span></td>
      <td>${c.observacao ?? '—'}</td>
    </tr>`).join('');
}

function rowsEquipe(lista) {
  if (!lista || lista.length === 0) {
    return '<tr><td colspan="5" style="color:#555;text-align:center">Sem dados</td></tr>';
  }
  return lista.map(b => `
    <tr>
      <td><strong style="color:#fff">${b.nome ?? '—'}</strong></td>
      <td>
        <span style="color:#f59e0b;font-size:11px">${estrelas(b.avaliacao)}</span>
        <span style="color:#555;font-size:8px;margin-left:4px">${(Number(b.avaliacao) || 0).toFixed(1)}</span>
      </td>
      <td>${b.agendamentos ?? 0}</td>
      <td><strong style="color:#00e5a0">R$ ${moeda(b.faturamento)}</strong></td>
      <td><span class="tag ${b.status === 'ATIVO' ? 'tag-green' : 'tag-gray'}">${b.status === 'ATIVO' ? 'Ativo' : 'Inativo'}</span></td>
    </tr>`).join('');
}

// ─────────────────────────────────────────────────────────────
// CONSTRUTOR DO HTML COMPLETO
// ─────────────────────────────────────────────────────────────

function buildHTML(data) {
  // Atalhos seguros para cada seção
  const barbearia  = data.barbearia  ?? {};
  const receita    = data.receita    ?? {};
  const agenda     = data.agenda     ?? {};
  const clientes   = data.clientes   ?? {};
  const equipe     = data.equipe     ?? [];
  const fidelidade = data.fidelidade ?? {};

  // Lógicas condicionais calculadas antes do template
  const varNegativa       = String(receita.variacaoSemana ?? '').startsWith('-');
  const temPendentes      = Number(receita.pagamentosPendentes) > 0;
  const temCancelados     = Number(agenda.cancelados) > 0;
  const temNoShow         = Number(agenda.noShow) > 0;
  const temInscritos      = Number(fidelidade.inscritos) > 0;
  const destaque          = (receita.topServicos ?? []).find(s => s.destaque);
  const melhorBarbeiro    = equipe[0] ?? {};
  const notaEquipe        = melhorBarbeiro.nome
    ? `${melhorBarbeiro.nome} com avaliação ${(Number(melhorBarbeiro.avaliacao) || 0).toFixed(1)}/5.0 e R$ ${moeda(melhorBarbeiro.faturamento)} de faturamento no período.`
    : 'Nenhum dado de equipe disponível.';
  const notaFidelidade    = temInscritos
    ? `${fidelidade.inscritos} inscritos no programa. Continue incentivando resgates.`
    : 'Programa de fidelidade sem inscritos — ativar campanhas de engajamento pode aumentar recorrência.';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<style>
/* ── RESET ── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

/* ── PÁGINA ── */
@page { size: A4; margin: 0; }

html, body {
  width: 210mm;
  background: #0d0d0d;
  color: #ffffff;
  font-family: Helvetica, Arial, sans-serif;
  font-size: 10px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  width: 210mm;
  min-height: 297mm;
  padding: 10mm 12mm;
  background: #0d0d0d;
}

/* ── HEADER ── */
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1.5px solid #00e5a0;
  padding-bottom: 8px;
  margin-bottom: 14px;
}
.brand  { font-size: 8px; font-weight: 700; letter-spacing: 3px; color: #00e5a0; text-transform: uppercase; }
.hname  { font-size: 14px; font-weight: 700; color: #fff; margin-top: 2px; }
.hsub   { font-size: 8px; color: #555; margin-top: 2px; }
.htitle { font-size: 30px; font-weight: 700; color: #fff; line-height: 1; text-align: right; }
.htitle span { color: #00e5a0; }
.hdate  { font-size: 7.5px; color: #555; text-align: right; margin-top: 3px; }

/* ── TÍTULO DE SEÇÃO ── */
.sec {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 2.5px;
  color: #00e5a0;
  text-transform: uppercase;
  margin-top: 16px;
  margin-bottom: 7px;
  padding-left: 8px;
  border-left: 2.5px solid #00e5a0;
}

/* ── CARDS ── */
.cards { display: flex; gap: 6px; margin-bottom: 8px; }
.card  {
  flex: 1;
  background: #161616;
  border: 1px solid #242424;
  border-radius: 6px;
  padding: 9px 9px 7px;
}
.clabel { font-size: 6.5px; font-weight: 700; letter-spacing: 1px; color: #555; text-transform: uppercase; margin-bottom: 5px; }
.cval   { font-size: 19px; font-weight: 700; color: #fff; line-height: 1; margin-bottom: 3px; }
.csub   { font-size: 7px; font-weight: 500; color: #00e5a0; }
.csub.g { color: #00e5a0; }
.csub.w { color: #f59e0b; }
.csub.d { color: #555; }
.cval.g { color: #00e5a0; }
.cval.w { color: #f59e0b; }
.cval.d { color: #444; }

/* ── KPI BOXES (agenda) ── */
.kpis { display: flex; gap: 6px; margin-bottom: 8px; }
.kpi  {
  flex: 1;
  background: #0f1f18;
  border: 1px solid #00e5a025;
  border-radius: 6px;
  padding: 8px 6px;
  text-align: center;
}
.klabel { font-size: 6.5px; color: #555; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
.kval   { font-size: 15px; font-weight: 700; color: #00e5a0; }
.kval.d { color: #555; }
.kval.w { color: #f59e0b; }
.ksub   { font-size: 7px; color: #444; margin-top: 2px; }

/* ── TABELAS ── */
.twrap {
  background: #161616;
  border: 1px solid #242424;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}
table           { width: 100%; border-collapse: collapse; }
thead tr        { background: #1e1e1e; }
thead th        {
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #00e5a0;
  text-transform: uppercase;
  padding: 7px 9px;
  text-align: left;
  border-bottom: 1px solid #2a2a2a;
}
tbody tr                  { border-bottom: 1px solid #1e1e1e; }
tbody tr:last-child        { border-bottom: none; }
tbody tr:nth-child(even)   { background: #191919; }
tbody td                  { font-size: 9px; color: #c0c0c0; padding: 7px 9px; vertical-align: middle; }

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
.tag-green  { background: #00e5a018; color: #00e5a0; border: 1px solid #00e5a035; }
.tag-gray   { background: #33333335; color: #777;    border: 1px solid #44444435; }
.tag-warn   { background: #f59e0b18; color: #f59e0b; border: 1px solid #f59e0b35; }
.tag-purple { background: #9d5cff18; color: #9d5cff; border: 1px solid #9d5cff35; }

/* ── NOTAS ── */
.note {
  border-radius: 5px;
  padding: 7px 10px;
  font-size: 7.5px;
  margin-bottom: 6px;
  background: #0f1f18;
  border: 1px solid #00e5a025;
  color: #00e5a0;
}
.note strong { color: #fff; font-weight: 700; }
.note.warn   { background: #1a1000; border-color: #f59e0b25; color: #f59e0b; }

/* ── FOOTER ── */
.footer {
  margin-top: 18px;
  border-top: 1px solid #1e1e1e;
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.fl, .fr { font-size: 7.5px; color: #333; }
.dot {
  display: inline-block;
  width: 4px; height: 4px;
  background: #00e5a0;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
</style>
</head>
<body>
<div class="page">

  <!-- ══ HEADER ══ -->
  <div class="header">
    <div>
      <div class="brand">${barbearia.nome ?? 'Barbearia'}</div>
      <div class="hname">${barbearia.barbeiro ?? ''}</div>
      <div class="hsub">Inteligência de dados para uma gestão de alto nível</div>
    </div>
    <div>
      <div class="htitle">INSIGHTS<span>.</span></div>
      <div class="hdate">${data.periodo ?? ''} &nbsp;·&nbsp; Gerado em ${data.dataGeracao ?? ''}</div>
    </div>
  </div>

  <!-- ══ RECEITA ══ -->
  <div class="sec">Receita</div>

  <div class="cards">
    <div class="card">
      <div class="clabel">Faturamento Total</div>
      <div class="cval">R$ ${moeda(receita.faturamentoTotal)}</div>
      <div class="csub ${varNegativa ? 'w' : 'g'}">${receita.variacaoSemana ?? '—'} vs semana anterior</div>
    </div>
    <div class="card">
      <div class="clabel">Ticket Médio</div>
      <div class="cval">R$ ${moeda(receita.ticketMedio)}</div>
      <div class="csub g">${receita.totalAtendimentos ?? 0} atendimentos</div>
    </div>
    <div class="card">
      <div class="clabel">Pag. Pendentes</div>
      <div class="cval ${temPendentes ? 'w' : 'd'}">${receita.pagamentosPendentes ?? 0}</div>
      <div class="csub ${temPendentes ? 'w' : 'd'}">${temPendentes ? 'Aguardando confirmação' : 'Nenhum pendente'}</div>
    </div>
    <div class="card">
      <div class="clabel">Presente</div>
      <div class="cval ${Number(receita.valorPresente) > 0 ? 'g' : 'd'}">R$ ${moeda(receita.valorPresente)}</div>
      <div class="csub d">${Number(receita.valorPresente) > 0 ? 'Emitido' : 'Nenhum emitido'}</div>
    </div>
  </div>

  <div class="twrap">
    <table>
      <thead>
        <tr>
          <th>Serviço / Produto</th>
          <th>Categoria</th>
          <th>Faturamento</th>
          <th>Participação no Mix</th>
        </tr>
      </thead>
      <tbody>${rowsServicos(receita.topServicos)}</tbody>
    </table>
  </div>

  <div class="note">
    <strong>Destaque:</strong> ${destaque ? `${destaque.nome} é o produto com maior receita individual do período.` : 'Nenhum produto marcado como destaque.'}
  </div>

  <!-- ══ AGENDA ══ -->
  <div class="sec">Agenda</div>

  <div class="kpis">
    <div class="kpi">
      <div class="klabel">Total</div>
      <div class="kval">${agenda.total ?? 0}</div>
      <div class="ksub">agendamentos</div>
    </div>
    <div class="kpi">
      <div class="klabel">Confirmados</div>
      <div class="kval">${agenda.confirmados ?? 0}</div>
      <div class="ksub">confirmados</div>
    </div>
    <div class="kpi">
      <div class="klabel">Cancelados</div>
      <div class="kval ${temCancelados ? 'w' : 'd'}">${agenda.cancelados ?? 0}</div>
      <div class="ksub">${temCancelados ? 'cancelamentos' : 'zero cancelamentos'}</div>
    </div>
    <div class="kpi">
      <div class="klabel">No Show</div>
      <div class="kval ${temNoShow ? 'w' : 'd'}">${agenda.noShow ?? 0}</div>
      <div class="ksub">${temNoShow ? 'faltas' : 'zero faltas'}</div>
    </div>
    <div class="kpi">
      <div class="klabel">Conclusão</div>
      <div class="kval">${pct(agenda.taxaConclusao)}</div>
      <div class="ksub">${agenda.confirmados ?? 0} de ${agenda.total ?? 0}</div>
    </div>
  </div>

  <div class="twrap">
    <table>
      <thead>
        <tr>
          <th>Dia da Semana</th>
          <th>Agendamentos</th>
          <th>Concluídos</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rowsAgenda(agenda.porDia)}</tbody>
    </table>
  </div>

  <!-- ══ CLIENTES ══ -->
  <div class="sec">Clientes</div>

  <div class="cards">
    <div class="card">
      <div class="clabel">Total de Clientes</div>
      <div class="cval">${clientes.total ?? 0}</div>
      <div class="csub d">na base</div>
    </div>
    <div class="card">
      <div class="clabel">Ativos</div>
      <div class="cval">${clientes.ativos ?? 0}</div>
      <div class="csub g">${pct(clientes.taxaRetencao)} ativos</div>
    </div>
    <div class="card">
      <div class="clabel">Novos</div>
      <div class="cval">${clientes.novos ?? 0}</div>
      <div class="csub g">esta semana</div>
    </div>
    <div class="card">
      <div class="clabel">Taxa de Retenção</div>
      <div class="cval g">${pct(clientes.taxaRetencao)}</div>
      <div class="csub g">clientes retidos</div>
    </div>
  </div>

  <div class="twrap">
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Status</th>
          <th>Faturamento</th>
          <th>Satisfação</th>
          <th>Observação</th>
        </tr>
      </thead>
      <tbody>${rowsClientes(clientes.lista, clientes.satisfacao)}</tbody>
    </table>
  </div>

  <!-- ══ EQUIPE ══ -->
  <div class="sec">Equipe</div>

  <div class="twrap">
    <table>
      <thead>
        <tr>
          <th>Barbeiro</th>
          <th>Avaliação</th>
          <th>Agendamentos</th>
          <th>Faturamento</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rowsEquipe(equipe)}</tbody>
    </table>
  </div>

  <div class="note">
    <strong>Desempenho:</strong> ${notaEquipe}
  </div>

  <!-- ══ FIDELIDADE ══ -->
  <div class="sec">Fidelidade</div>

  <div class="cards">
    <div class="card">
      <div class="clabel">Inscritos</div>
      <div class="cval ${temInscritos ? '' : 'd'}">${fidelidade.inscritos ?? 0}</div>
      <div class="csub d">no programa</div>
    </div>
    <div class="card">
      <div class="clabel">Pontos Resgatados</div>
      <div class="cval ${Number(fidelidade.pontosResgatados) > 0 ? '' : 'd'}">${fidelidade.pontosResgatados ?? 0}</div>
      <div class="csub d">este mês</div>
    </div>
    <div class="card">
      <div class="clabel">Presentes / Mês</div>
      <div class="cval ${Number(fidelidade.presentesMes) > 0 ? '' : 'd'}">${fidelidade.presentesMes ?? 0}</div>
      <div class="csub d">emitidos</div>
    </div>
    <div class="card">
      <div class="clabel">Progressão Média</div>
      <div class="cval ${temInscritos ? '' : 'd'}">${fidelidade.progressaoMedia ?? '0/10'}</div>
      <div class="csub d">pontos médios</div>
    </div>
  </div>

  <div class="twrap">
    <table>
      <thead>
        <tr>
          <th>Indicador</th>
          <th>Valor Atual</th>
          <th>Meta</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Clientes Bonificados</td>
          <td>${pct(fidelidade.clientesBonificados)}</td>
          <td>—</td>
          <td><span class="tag ${temInscritos ? 'tag-green' : 'tag-warn'}">${temInscritos ? 'Ativo' : 'Programa não iniciado'}</span></td>
        </tr>
        <tr>
          <td>Progressão Média</td>
          <td>${fidelidade.progressaoMedia ?? '0/10'} pts</td>
          <td>10 / 10</td>
          <td><span class="tag tag-gray">Aguardando inscrições</span></td>
        </tr>
        <tr>
          <td>Presentes Emitidos no Mês</td>
          <td>${fidelidade.presentesMes ?? 0}</td>
          <td>—</td>
          <td><span class="tag tag-gray">Aguardando resgate</span></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="note ${temInscritos ? '' : 'warn'}">
    <strong>Oportunidade:</strong> ${notaFidelidade}
  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <div class="fl"><span class="dot"></span>${barbearia.nome ?? 'Barbearia'} &nbsp;·&nbsp; Gestão Profissional</div>
    <div class="fr">${barbearia.barbeiro ?? ''} &nbsp;·&nbsp; ${data.periodo ?? ''} &nbsp;·&nbsp; Gerado em ${data.dataGeracao ?? ''}</div>
  </div>

</div>
</body>
</html>`;
}
