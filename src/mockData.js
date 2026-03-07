// Dados de exemplo para desenvolvimento local
export const mockPlayers = [
  {
    email: "john.doe@example.com",
    name: "John Doe",
    registeredAt: "2025-01-01T10:00:00Z",
  },
  {
    email: "jane.smith@example.com",
    name: "Jane Smith",
    registeredAt: "2025-01-02T10:00:00Z",
  },
  {
    email: "alex.johnson@example.com",
    name: "Alex Johnson",
    registeredAt: "2025-01-03T10:00:00Z",
  },
  {
    email: "chris.wilson@example.com",
    name: "Chris Wilson",
    registeredAt: "2025-01-04T10:00:00Z",
  },
  {
    email: "sam.brown@example.com",
    name: "Sam Brown",
    registeredAt: "2025-01-05T10:00:00Z",
  },
];

export const mockVotes = [
  // Votos para John Doe
  {
    voter: "jane.smith@example.com",
    player: "john.doe@example.com",
    mira: 4,
    cover: 5,
    comunicacao: 4,
    infectado: 3,
    nocao: 4,
    createdAt: "2025-01-06T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "john.doe@example.com",
    mira: 5,
    cover: 4,
    comunicacao: 5,
    infectado: 4,
    nocao: 5,
    createdAt: "2025-01-06T11:00:00Z",
  },
  {
    voter: "chris.wilson@example.com",
    player: "john.doe@example.com",
    mira: 4,
    cover: 4,
    comunicacao: 3,
    infectado: 3,
    nocao: 4,
    createdAt: "2025-01-06T12:00:00Z",
  },

  // Votos para Jane Smith
  {
    voter: "john.doe@example.com",
    player: "jane.smith@example.com",
    mira: 3,
    cover: 4,
    comunicacao: 5,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-07T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "jane.smith@example.com",
    mira: 4,
    cover: 3,
    comunicacao: 5,
    infectado: 5,
    nocao: 4,
    createdAt: "2025-01-07T11:00:00Z",
  },
  {
    voter: "sam.brown@example.com",
    player: "jane.smith@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 4,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-07T12:00:00Z",
  },

  // Votos para Alex Johnson
  {
    voter: "john.doe@example.com",
    player: "alex.johnson@example.com",
    mira: 5,
    cover: 5,
    comunicacao: 4,
    infectado: 2,
    nocao: 5,
    createdAt: "2025-01-08T10:00:00Z",
  },
  {
    voter: "jane.smith@example.com",
    player: "alex.johnson@example.com",
    mira: 4,
    cover: 4,
    comunicacao: 3,
    infectado: 2,
    nocao: 4,
    createdAt: "2025-01-08T11:00:00Z",
  },

  // Votos para Chris Wilson
  {
    voter: "john.doe@example.com",
    player: "chris.wilson@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 3,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-09T10:00:00Z",
  },
  {
    voter: "jane.smith@example.com",
    player: "chris.wilson@example.com",
    mira: 2,
    cover: 3,
    comunicacao: 2,
    infectado: 5,
    nocao: 2,
    createdAt: "2025-01-09T11:00:00Z",
  },
  {
    voter: "sam.brown@example.com",
    player: "chris.wilson@example.com",
    mira: 3,
    cover: 4,
    comunicacao: 3,
    infectado: 4,
    nocao: 3,
    createdAt: "2025-01-09T12:00:00Z",
  },

  // Votos para Sam Brown
  {
    voter: "john.doe@example.com",
    player: "sam.brown@example.com",
    mira: 2,
    cover: 2,
    comunicacao: 4,
    infectado: 3,
    nocao: 2,
    createdAt: "2025-01-10T10:00:00Z",
  },
  {
    voter: "alex.johnson@example.com",
    player: "sam.brown@example.com",
    mira: 3,
    cover: 3,
    comunicacao: 4,
    infectado: 3,
    nocao: 3,
    createdAt: "2025-01-10T11:00:00Z",
  },
];

