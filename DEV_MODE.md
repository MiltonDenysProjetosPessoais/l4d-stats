# 🧪 Modo Desenvolvimento - Dados de Exemplo

Este projeto inclui dados mock para facilitar o desenvolvimento e testes locais.

## 📌 Como usar

### 1. **Ativar o modo de desenvolvimento**

O modo dev é **automático** quando você roda localmente:
- Se a variável `DEV_MODE=true` estiver definida
- Ou se não estiver rodando em um ambiente Netlify (detecção automática por `!process.env.NETLIFY`)

### 2. **Executar em desenvolvimento**

```bash
npm run dev
```

Acesso: `http://localhost:5173`

## 👥 Jogadores de Exemplo

| Email | Nome | Status |
|-------|------|--------|
| john.doe@example.com | John Doe | Melhor rating geral |
| jane.smith@example.com | Jane Smith | Excelente em comunicação |
| alex.johnson@example.com | Alex Johnson | Melhor em mira e cobertura |
| chris.wilson@example.com | Chris Wilson | Especialista em infectado |
| sam.brown@example.com | Sam Brown | Iniciante |

## 📊 Dados de Teste Inclusos

### Rankings Esperados (por Overall):

1. **Alex Johnson** ~ 4.25 (melhor rating)
   - Mira: 4.5 | Cover: 4.5 | Comunicacao: 3.5 | Infectado: 2.0 | Nocao: 4.5

2. **John Doe** ~ 4.17
   - Mira: 4.33 | Cover: 4.33 | Comunicacao: 4.0 | Infectado: 3.33 | Nocao: 4.33

3. **Jane Smith** ~ 3.93
   - Mira: 3.33 | Cover: 3.33 | Comunicacao: 4.67 | Infectado: 4.33 | Nocao: 3.33

4. **Chris Wilson** ~ 3.33
   - Mira: 2.67 | Cover: 3.33 | Comunicacao: 2.67 | Infectado: 4.33 | Nocao: 2.67

5. **Sam Brown** ~ 2.5 (menor rating)
   - Mira: 2.5 | Cover: 2.5 | Comunicacao: 4.0 | Infectado: 3.0 | Nocao: 2.5

## 🔍 Como Validar Localmente

### 1. **Abra o portal com um dos usuários de exemplo**

Para logar como um dos usuários de teste em modo dev, use qualquer um dos emails acima.

### 2. **Compare as médias**

- Selecione um jogador no painel esquerdo
- Veja as médias individuais
- Compare com o ranking no painel direito

### ✅ Validações esperadas:

- [ ] **Médias do painel = Médias no ranking** (bug fixado!)
- [ ] **Overall = (Mira + Cover + Comunicacao + Infectado + Nocao) / 5**
- [ ] **Rankings ordenados por Overall decrescente**
- [ ] **Medalhas aparecem corretamente** (Ouro, Prata, Bronze)

## 📝 Modificar Dados de Exemplo

Os dados estão hardcoded em:
- `netlify/functions/players.mjs` - Lista de jogadores
- `netlify/functions/vote.mjs` - Votos entre jogadores

Para adicionar mais dados, edite os arrays `mockPlayers` e `mockVotes` nesses arquivos.

## 🚀 Build para Produção

```bash
npm run build
```

Em produção, a detecção automática desativa o modo dev e usa o banco de dados real (Netlify Blobs).

