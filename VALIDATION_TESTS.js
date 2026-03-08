/*
 * EXEMPLOS DE VALIDAÇÃO - Cálculos Esperados
 *
 * Este arquivo documenta como validar os cálculos do ranking localmente
 */

// ============================================
// DADOS DE EXEMPLO CARREGADOS
// ============================================

const STATS = ["mira", "cover", "comunicacao", "infectado", "nocao"];

// Jogadores de teste
const players = [
  { email: "john.doe@example.com", name: "John Doe" },
  { email: "jane.smith@example.com", name: "Jane Smith" },
  { email: "alex.johnson@example.com", name: "Alex Johnson" },
  { email: "chris.wilson@example.com", name: "Chris Wilson" },
  { email: "sam.brown@example.com", name: "Sam Brown" },
];

// ============================================
// FUNÇÃO DE CÁLCULO (do seu código)
// ============================================

function getPlayerStats(playerEmail, allVotes) {
  const pVotes = allVotes.filter((v) => v.player === playerEmail);
  if (pVotes.length === 0) {
    return { votesCount: 0, averages: {}, overall: 0 };
  }

  const averages = {};
  for (const stat of STATS) {
    const total = pVotes.reduce((sum, v) => sum + (v[stat] || 0), 0);
    averages[stat] = total / pVotes.length;
  }

  const overall =
    STATS.reduce((sum, stat) => sum + averages[stat], 0) / STATS.length;

  return { votesCount: pVotes.length, averages, overall };
}

// ============================================
// TESTES - Copie e cole no Console do Navegador
// ============================================

/*
1. VERIFICAR SE OS DADOS ESTÃO CARREGADOS

Abra o DevTools (F12) e cole:

fetch("/.netlify/functions/players").then(r => r.json()).then(console.log)
fetch("/.netlify/functions/vote").then(r => r.json()).then(console.log)

fetch("/api/vote").then(r => r.json()).then(console.log)
// Deve retornar 13 votos

*/

// ============================================
// CÁLCULOS ESPERADOS
// ============================================

const testData = {
  // Votos para John Doe (3 votos)
  johnDoeVotes: [
    { mira: 4, cover: 5, comunicacao: 4, infectado: 3, nocao: 4 },
    { mira: 5, cover: 4, comunicacao: 5, infectado: 4, nocao: 5 },
    { mira: 4, cover: 4, comunicacao: 3, infectado: 3, nocao: 4 },
  ],
  // Esperado:
  // mira: (4+5+4)/3 = 13/3 = 4.33
  // cover: (5+4+4)/3 = 13/3 = 4.33
  // comunicacao: (4+5+3)/3 = 12/3 = 4.00
  // infectado: (3+4+3)/3 = 10/3 = 3.33
  // nocao: (4+5+4)/3 = 13/3 = 4.33
  // overall: (4.33 + 4.33 + 4.00 + 3.33 + 4.33) / 5 = 20.32 / 5 = 4.064

  // Votos para Jane Smith (3 votos)
  janeSmithVotes: [
    { mira: 3, cover: 4, comunicacao: 5, infectado: 4, nocao: 3 },
    { mira: 4, cover: 3, comunicacao: 5, infectado: 5, nocao: 4 },
    { mira: 3, cover: 3, comunicacao: 4, infectado: 4, nocao: 3 },
  ],
  // Esperado:
  // mira: (3+4+3)/3 = 10/3 = 3.33
  // cover: (4+3+3)/3 = 10/3 = 3.33
  // comunicacao: (5+5+4)/3 = 14/3 = 4.67
  // infectado: (4+5+4)/3 = 13/3 = 4.33
  // nocao: (3+4+3)/3 = 10/3 = 3.33
  // overall: (3.33 + 3.33 + 4.67 + 4.33 + 3.33) / 5 = 18.99 / 5 = 3.798

  // Votos para Alex Johnson (2 votos)
  alexJohnsonVotes: [
    { mira: 5, cover: 5, comunicacao: 4, infectado: 2, nocao: 5 },
    { mira: 4, cover: 4, comunicacao: 3, infectado: 2, nocao: 4 },
  ],
  // Esperado:
  // mira: (5+4)/2 = 9/2 = 4.50
  // cover: (5+4)/2 = 9/2 = 4.50
  // comunicacao: (4+3)/2 = 7/2 = 3.50
  // infectado: (2+2)/2 = 4/2 = 2.00
  // nocao: (5+4)/2 = 9/2 = 4.50
  // overall: (4.50 + 4.50 + 3.50 + 2.00 + 4.50) / 5 = 19.00 / 5 = 3.80

  // Votos para Chris Wilson (3 votos)
  chrisWilsonVotes: [
    { mira: 3, cover: 3, comunicacao: 3, infectado: 4, nocao: 3 },
    { mira: 2, cover: 3, comunicacao: 2, infectado: 5, nocao: 2 },
    { mira: 3, cover: 4, comunicacao: 3, infectado: 4, nocao: 3 },
  ],
  // Esperado:
  // mira: (3+2+3)/3 = 8/3 = 2.67
  // cover: (3+3+4)/3 = 10/3 = 3.33
  // comunicacao: (3+2+3)/3 = 8/3 = 2.67
  // infectado: (4+5+4)/3 = 13/3 = 4.33
  // nocao: (3+2+3)/3 = 8/3 = 2.67
  // overall: (2.67 + 3.33 + 2.67 + 4.33 + 2.67) / 5 = 15.67 / 5 = 3.134

  // Votos para Sam Brown (2 votos)
  samBrownVotes: [
    { mira: 2, cover: 2, comunicacao: 4, infectado: 3, nocao: 2 },
    { mira: 3, cover: 3, comunicacao: 4, infectado: 3, nocao: 3 },
  ],
  // Esperado:
  // mira: (2+3)/2 = 5/2 = 2.50
  // cover: (2+3)/2 = 5/2 = 2.50
  // comunicacao: (4+4)/2 = 8/2 = 4.00
  // infectado: (3+3)/2 = 6/2 = 3.00
  // nocao: (2+3)/2 = 5/2 = 2.50
  // overall: (2.50 + 2.50 + 4.00 + 3.00 + 2.50) / 5 = 14.50 / 5 = 2.90
};

// ============================================
// RANKING ESPERADO (ordem decrescente de overall)
// ============================================

const expectedRanking = [
  {
    rank: 1,
    name: "John Doe",
    overall: 4.064,
    medal: "🥇 Ouro",
  },
  {
    rank: 2,
    name: "Jane Smith",
    overall: 3.798,
    medal: "🥈 Prata",
  },
  {
    rank: 3,
    name: "Alex Johnson",
    overall: 3.80,
    medal: "🥉 Bronze",
  },
  {
    rank: 4,
    name: "Chris Wilson",
    overall: 3.134,
    medal: "-",
  },
  {
    rank: 5,
    name: "Sam Brown",
    overall: 2.90,
    medal: "-",
  },
];

// ============================================
// COMO TESTAR NO NAVEGADOR
// ============================================

/*
1. Abra http://localhost:5173 (modo dev)

2. Faça login com qualquer email de exemplo (p.ex: "user@test.com")

3. Abra o DevTools (F12) -> Console

fetch("/.netlify/functions/players")

// Verificar dados carregados
fetch("/api/players")
  .then(r => r.json())
    return fetch("/.netlify/functions/vote")
    console.log("JOGADORES:", players);
    return fetch("/api/vote")
      .then(r => r.json())
      .then(votes => {
        console.log("VOTOS:", votes);

        // Calcular ranking
        const ranking = players
          .map(p => {
            const pVotes = votes.filter(v => v.player === p.email);
            if (pVotes.length === 0) return null;

            const averages = {};
            ["mira", "cover", "comunicacao", "infectado", "nocao"].forEach(stat => {
              const total = pVotes.reduce((sum, v) => sum + (v[stat] || 0), 0);
              averages[stat] = total / pVotes.length;
            });

            const overall = Object.values(averages).reduce((a, b) => a + b, 0) / 5;

            return {
              name: p.name,
              votesCount: pVotes.length,
              averages,
              overall,
            };
          })
          .filter(p => p && p.votesCount > 0)
          .sort((a, b) => b.overall - a.overall);

        console.log("RANKING CALCULADO:", ranking);
        console.table(ranking);
      });
  });

5. Compare com o ranking exibido no painel direito

6. Valide:
   ✓ Os nomes estão na ordem correta?
   ✓ Os overalls coincidem?
   ✓ As medalhas aparecem para os top 3?

*/

export { testData, expectedRanking };

