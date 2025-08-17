const express = require("express");
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
