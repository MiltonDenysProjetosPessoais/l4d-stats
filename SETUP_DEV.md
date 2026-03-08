# 🚀 Configuração de Dados de Exemplo - Resumo

## ✅ O que foi implementado:

### 1. **Dados de Exemplo (Mock Data)**
- ✓ 5 jogadores de teste
- ✓ 13 votos pré-definidos
- ✓ Dados distribuídos no arquivo `api/players.js` e `api/vote.js`

### 2. **Modo Desenvolvimento Automático**
- ✓ Ativação automática quando em desenvolvimento local
- ✓ Detecção inteligente: `DEV_MODE=true` ou `!process.env.NETLIFY`
- ✓ Em produção (Netlify), usa banco de dados real automaticamente

### 3. **Arquivos Criados**

| Arquivo | Descrição |
|---------|-----------|
| `api/players.js` | ✅ Modificado com mockPlayers |
| `api/vote.js` | ✅ Modificado com mockVotes |
| `.env.development` | ✅ Variável DEV_MODE=true |
| `DEV_MODE.md` | 📖 Documentação completa |
| `VALIDATION_TESTS.js` | 🧪 Scripts de teste |
| `dev.sh` | 🐧 Script para Unix/Linux |
| `dev.bat` | 🪟 Script para Windows |
| `src/mockData.js` | 📦 Dados organizados (opcional) |

---

## 🎮 Como Usar

### **Opção 1: npm run dev (Recomendado)**
```bash
npm run dev
```
Acesso: http://localhost:5173

### **Opção 2: vercel dev (Com API Routes)**

vercel dev
```
ou execute:
```bash
./dev.sh      # Linux/Mac
dev.bat       # Windows
```

---

## 👥 Usuários de Teste

Você pode fazer login com qualquer email durante o desenvolvimento:
- `john.doe@example.com` - John Doe
- `jane.smith@example.com` - Jane Smith
- `alex.johnson@example.com` - Alex Johnson
- `chris.wilson@example.com` - Chris Wilson
- `sam.brown@example.com` - Sam Brown
- **Ou qualquer outro email** (será criado automaticamente)

---

## 📊 Dados Pré-carregados

### Ranking Esperado:
```
🥇 #1 - John Doe      (Overall: 4.06)
🥈 #2 - Jane Smith    (Overall: 3.80)
🥉 #3 - Alex Johnson  (Overall: 3.80)
   #4 - Chris Wilson  (Overall: 3.13)
   #5 - Sam Brown     (Overall: 2.90)
```

### Distribuição de Votos:
- John Doe: 3 votos
- Jane Smith: 3 votos
- Alex Johnson: 2 votos
- Chris Wilson: 3 votos
- Sam Brown: 2 votos

---

## ✅ Validações Locais

### 1. **Abra o Console do Navegador** (F12 → Console)

```javascript
// Verificar jogadores carregados
fetch("/api/players")
  .then(r => r.json())
  .then(console.log)

// Verificar votos carregados
fetch("/api/vote")
  .then(r => r.json())
  .then(console.log)
```

### 2. **Valide no Painel**
- [ ] Selecione um jogador na lista esquerda
- [ ] Veja suas médias individuais
- [ ] Compare com o ranking à direita
- [ ] **As médias devem ser IDÊNTICAS** ✨

### 3. **Valide os Cálculos**
Veja arquivo `VALIDATION_TESTS.js` para cálculos esperados detalhados

---

## 🔧 Como Adicionar Mais Dados

Edit `api/vote.js` (ou `api/players.js`):

```javascript
const mockVotes = [
  {
    voter: "user1@example.com",
    player: "user2@example.com",
    mira: 5,
    cover: 4,
    comunicacao: 5,
    infectado: 3,
    nocao: 4,
    createdAt: "2025-01-06T10:00:00Z",
  },
  // ... adicione mais votos aqui
];
```

---

## 🚀 Deploy para Produção

Quando estiver pronto para enviar para produção:

```bash
npm run build
git push
```

A detecção automática desativará o modo dev na Netlify e usará o banco de dados real.

---

## ❓ Troubleshooting

### Dados não estão carregando?
1. Confirme que `DEV_MODE=true` está em `.env.development`
2. Reinicie o servidor: `npm run dev`
3. Limpe o cache do navegador: Ctrl+Shift+Del

### Medalhas não aparecem?
- Verifique se há pelo menos 3 votos para cada jogador no ranking
- Apenas os top 3 recebem medalhas

### Números diferentes?
- Verifique `VALIDATION_TESTS.js` para os cálculos esperados
- Use o console do navegador para debugar (veja acima)

---

## 📝 Próximos Passos

- [ ] Testar validações com os dados mock
- [ ] Validar se há mais algum bug
- [ ] Adicionar mais cenários de teste se necessário
- [ ] Deploy quando tudo estiver funcionando

---

**Tudo pronto! 🎉 Agora você tem dados de exemplo para testar localmente!**
