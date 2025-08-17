const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- Stockage en mémoire (pour test uniquement) ---
const users = {};
const streams = [];
const messages = [];
const wallets = {};

// --- Auth ---
app.post("/auth/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ ok: false, error: "username required" });

  const id = "u_" + username.toLowerCase();
  users[id] = { id, username };

  // Init wallet si pas déjà
  if (!wallets[id]) wallets[id] = { coins: 1000, diamonds: 5 };

  res.json({ ok: true, user: users[id] });
});

// --- Streams ---
app.get("/streams", (req, res) => {
  res.json({ streams });
});

app.post("/streams", (req, res) => {
  const { hostId, title } = req.body;
  if (!hostId || !title) return res.json({ ok: false });

  const id = "s_" + (streams.length + 1);
  streams.push({ id, hostId, title, live: true });
  res.json({ ok: true, id });
});

// --- Messages ---
app.get("/messages/:from/:to", (req, res) => {
  const { from, to } = req.params;
  const chat = messages.filter(
    (m) =>
      (m.from === from && m.to === to) ||
      (m.from === to && m.to === from)
  );
  res.json({ messages: chat });
});

app.post("/messages", (req, res) => {
  const { fromUserId, toUserId, text } = req.body;
  if (!fromUserId || !toUserId || !text) return res.json({ ok: false });

  const msg = { id: "m_" + (messages.length + 1), from: fromUserId, to: toUserId, text };
  messages.push(msg);
  res.json({ ok: true, msg });
});

// --- Wallet ---
app.get("/wallet/balance/:userId", (req, res) => {
  const { userId } = req.params;
  const w = wallets[userId] || { coins: 0, diamonds: 0 };
  res.json(w);
});

app.post("/wallet/give", (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;
  if (!fromUserId || !toUserId || !amount) return res.json({ ok: false });

  if (!wallets[fromUserId] || wallets[fromUserId].coins < amount) {
    return res.json({ ok: false, error: "not enough coins" });
  }

  wallets[fromUserId].coins -= amount;
  if (!wallets[toUserId]) wallets[toUserId] = { coins: 0, diamonds: 0 };
  wallets[toUserId].coins += amount;

  res.json({ ok: true });
});

// --- Démarrage ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});  const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🚀 Route d'accueil
app.get("/", (req, res) => {
  res.send("Bienvenue sur 🚀 Love Sofa API !");
});

// 👤 Utilisateurs
app.get("/users", (req, res) => {
  res.json([
    { id: 1, name: "Alice", coins: 120 },
    { id: 2, name: "Bob", coins: 75 }
  ]);
});

app.post("/users", (req, res) => {
  const user = req.body;
  res.json({ message: "Utilisateur créé", user });
});

// 🎥 Streaming
app.get("/streams", (req, res) => {
  res.json([
    { id: 1, title: "Live DJ Party", viewers: 254 },
    { id: 2, title: "Rencontre speed dating", viewers: 132 }
  ]);
});

// 💬 Messages
app.get("/messages", (req, res) => {
  res.json([
    { from: "Alice", to: "Bob", text: "Salut 👋" },
    { from: "Bob", to: "Alice", text: "Coucou 😍" }
  ]);
});

// 🎁 Cadeaux
app.get("/gifts", (req, res) => {
  res.json([
    { id: 1, name: "Rose 🌹", cost: 10 },
    { id: 2, name: "Cœur ❤️", cost: 25 }
  ]);
});

app.post("/gifts/send", (req, res) => {
  const { fromUser, toUser, giftId } = req.body;
  res.json({
    message: `🎁 Cadeau ${giftId} envoyé de ${fromUser} à ${toUser}`
  });
});

// ✅ Lancement serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur Love Sofa démarré sur le port ${PORT}`);
});
