# TAREFA: Implementar download de PDF na tela de Insights

## O que precisa ser feito

Adicionar a funcionalidade de download de PDF quando o usuário clicar no botão de exportar/baixar na tela de Insights. O PDF segue um layout já definido (dark theme, cards de métricas, tabelas, fundo preto). Você **não precisa criar o layout** — ele já está pronto no arquivo `insightsPDF.js` que acompanha este documento. Sua única tarefa é:

1. Instalar a dependência
2. Copiar o arquivo `insightsPDF.js` para o projeto
3. Montar o objeto `data` com os dados reais que já existem na tela
4. Chamar `downloadInsightsPDF(data)` no clique do botão

---

## Passo 1 — Instalar dependência

```bash
npm install html2pdf.js
```

---

## Passo 2 — Copiar o arquivo

Copie o arquivo `insightsPDF.js` para dentro do seu projeto (ex: `src/lib/insightsPDF.js` ou `src/utils/insightsPDF.js`).

**Não altere nada dentro do arquivo.** Ele já contém o layout, os estilos e a função de download completos.

---

## Passo 3 — Importar e conectar ao botão

No componente da tela de Insights, importe e use assim:

```js
import { downloadInsightsPDF } from '@/lib/insightsPDF';
// ajuste o caminho conforme onde você colocou o arquivo

// No onClick do botão:
<button onClick={() => downloadInsightsPDF(montarDados())}>
  Baixar PDF
</button>
```

---

## Passo 4 — Montar o objeto de dados

Esta é a única parte que você precisa escrever: uma função `montarDados()` que lê os dados que já estão no estado/store/props da tela e os organiza no formato abaixo.

**Substitua cada valor pelo dado real da sua aplicação.** Os comentários explicam de onde vem cada campo.

```js
function montarDados() {
  // Exemplo com dados reais — adapte para seu estado/store/props
  return {

    barbearia: {
      nome:      loja.nome,           // nome da barbearia
      barbeiro:  usuario.nomeCompleto // nome do barbeiro logado
    },

    periodo:     filtroAtivo.label,   // ex: "Semana 12/05/2026" — o texto do período selecionado na tela
    dataGeracao: new Date().toLocaleDateString('pt-BR'), // data de hoje formatada

    // ── RECEITA ──────────────────────────────────────────────
    receita: {
      faturamentoTotal:    insights.receita.total,         // número  ex: 670
      variacaoSemana:      insights.receita.variacao,      // string  ex: "+100%" ou "-5%"
      ticketMedio:         insights.receita.ticketMedio,   // número  ex: 134
      totalAtendimentos:   insights.receita.atendimentos,  // número  ex: 5
      pagamentosPendentes: insights.receita.pendentes,     // número  ex: 4
      valorPresente:       insights.receita.presente ?? 0, // número  ex: 0

      // Lista dos principais serviços/produtos de receita
      // Marque destaque: true apenas no item de maior faturamento
      topServicos: insights.receita.servicos.map((s, i) => ({
        nome:         s.nome,
        categoria:    s.categoria,
        faturamento:  s.valor ?? null,   // null se não tiver valor individual
        participacao: s.participacao,    // ex: "Top Receita" | "~60% do mix" | "~40% do mix"
        destaque:     i === 0            // primeiro da lista é o destaque
      }))
    },

    // ── AGENDA ───────────────────────────────────────────────
    agenda: {
      total:         insights.agenda.total,
      confirmados:   insights.agenda.confirmados,
      cancelados:    insights.agenda.cancelados,
      noShow:        insights.agenda.noShow,
      taxaConclusao: insights.agenda.taxaConclusao, // número 0–100

      // Uma entrada por dia da semana, sempre 7 itens
      porDia: [
        { dia: 'Segunda-feira', agendamentos: insights.agenda.dias.seg ?? 0, concluidos: insights.agenda.diasConcluidos.seg ?? 0 },
        { dia: 'Terça-feira',   agendamentos: insights.agenda.dias.ter ?? 0, concluidos: insights.agenda.diasConcluidos.ter ?? 0 },
        { dia: 'Quarta-feira',  agendamentos: insights.agenda.dias.qua ?? 0, concluidos: insights.agenda.diasConcluidos.qua ?? 0 },
        { dia: 'Quinta-feira',  agendamentos: insights.agenda.dias.qui ?? 0, concluidos: insights.agenda.diasConcluidos.qui ?? 0 },
        { dia: 'Sexta-feira',   agendamentos: insights.agenda.dias.sex ?? 0, concluidos: insights.agenda.diasConcluidos.sex ?? 0 },
        { dia: 'Sábado',        agendamentos: insights.agenda.dias.sab ?? 0, concluidos: insights.agenda.diasConcluidos.sab ?? 0 },
        { dia: 'Domingo',       agendamentos: insights.agenda.dias.dom ?? 0, concluidos: insights.agenda.diasConcluidos.dom ?? 0 },
      ]
    },

    // ── CLIENTES ─────────────────────────────────────────────
    clientes: {
      total:        insights.clientes.total,
      ativos:       insights.clientes.ativos,
      novos:        insights.clientes.novos,
      taxaRetencao: insights.clientes.retencao,   // número 0–100
      satisfacao:   insights.clientes.satisfacao, // número 0–100

      lista: insights.clientes.lista.map(c => ({
        nome:        c.nomeCompleto,
        status:      c.ativo ? 'ATIVO' : 'INATIVO',
        faturamento: c.totalGasto ?? 0,
        observacao:  c.observacao ?? 'Cliente retido'
      }))
    },

    // ── EQUIPE ───────────────────────────────────────────────
    equipe: insights.equipe.map(b => ({
      nome:         b.nomeCompleto,
      avaliacao:    b.notaMedia,      // número 0–5
      agendamentos: b.totalAgendamentos,
      faturamento:  b.totalFaturado,
      status:       b.ativo ? 'ATIVO' : 'INATIVO'
    })),

    // ── FIDELIDADE ───────────────────────────────────────────
    fidelidade: {
      inscritos:           insights.fidelidade.totalInscritos,
      pontosResgatados:    insights.fidelidade.pontosResgatados,
      presentesMes:        insights.fidelidade.presentesMes,
      progressaoMedia:     insights.fidelidade.progressaoMedia ?? '0/10', // string ex: "3/10"
      clientesBonificados: insights.fidelidade.percentualBonificados ?? 0 // número 0–100
    }
  };
}
```

---

## Resumo do que fazer

| Passo | O que fazer |
|---|---|
| `npm install html2pdf.js` | Instalar a lib |
| Copiar `insightsPDF.js` | Colocar em `src/lib/` ou `src/utils/` |
| Importar `downloadInsightsPDF` | No componente da tela de Insights |
| Escrever `montarDados()` | Mapear os dados do seu estado para o formato acima |
| Conectar ao botão | `onClick={() => downloadInsightsPDF(montarDados())}` |

**Não mexa no `insightsPDF.js`.** Todo o layout, CSS e lógica de geração já estão prontos lá.

---

## O que o PDF vai gerar

O arquivo `insightsPDF.js` produz automaticamente um PDF A4 em dark theme com:

- Header com nome da barbearia, barbeiro e período
- Seção **Receita** — 4 cards + tabela de serviços + nota de destaque
- Seção **Agenda** — 5 KPIs + tabela por dia da semana
- Seção **Clientes** — 4 cards + tabela de clientes
- Seção **Equipe** — tabela de barbeiros com estrelas + nota de desempenho
- Seção **Fidelidade** — 4 cards + tabela de indicadores + nota de oportunidade
- Footer com nome da barbearia e data de geração

Cores condicionais já aplicadas automaticamente: valores negativos em amarelo, pendências destacadas, fidelidade sem inscritos aciona alerta laranja.
