// server.js - Backend complet Love Sofa
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// --- Bases de données en mémoire ---
let users = {};
let wallet = {};
let streams = [];
let messages = [];
let followers = {};
let gifts = [
  { id: 1, name: "Rose", cost: 20 },
  { id: 2, name: "Diamant", cost: 100 },
  { id: 3, name: "Cœur", cost: 50 }
];
let shorts = [
  { id: "s1", title: "Vidéo drôle", url: "https://example.com/short1.mp4" },
  { id: "s2", title: "Danse", url: "https://example.com/short2.mp4" }
];

// --- Utilitaires ---
function registerOrLogin(username) {
  let user = Object.values(users).find(u => u.username === username);
  if (!user) {
    const id = "u_" + (Object.keys(users).length + 1);
    users[id] = { id, username };
    wallet[id] = { coins: 100, diamonds: 0 };
    followers[id] = [];
    return users[id];
  }
  return user;
}

// --- Auth ---
app.post("/auth/register", (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ ok: false, error: "Username required" });
  const user = registerOrLogin(username);
  res.json({ ok: true, user });
});

app.post("/auth/login", (req, res) => {
  const { username } = req.body;
  if (!username) return res.json({ ok: false, error: "Username required" });
  const user = registerOrLogin(username);
  res.json({ ok: true, user });
});

// --- Wallet ---
app.get("/wallet/balance", (req, res) => {
  const { userId } = req.query;
  if (!wallet[userId]) return res.json({ ok: false, error: "User not found" });
  res.json(wallet[userId]);
});

app.post("/wallet/give", (req, res) => {
  const { fromUserId, toUserId, giftId } = req.body;
  const gift = gifts.find(g => g.id === giftId);
  if (!gift) return res.json({ ok: false, error: "Gift not found" });
  if (!wallet[fromUserId] || !wallet[toUserId]) return res.json({ ok: false, error: "User not found" });
  if (wallet[fromUserId].coins < gift.cost) return res.json({ ok: false, error: "Not enough coins" });

  wallet[fromUserId].coins -= gift.cost;
  wallet[toUserId].coins += gift.cost;
  res.json({ ok: true, from: wallet[fromUserId], to: wallet[toUserId], gift });
});

app.post("/wallet/testRecharge", (req, res) => {
  const { userId } = req.body;
  if (!wallet[userId]) return res.json({ ok: false, error: "User not found" });
  wallet[userId].coins += 500;
  res.json(wallet[userId]);
});

// --- Gifts ---
app.get("/gifts", (req, res) => {
  res.json(gifts);
});

// --- Followers ---
app.post("/profiles/follow", (req, res) => {
  const { followerId, followingId } = req.body;
  if (!users[followerId] || !users[followingId]) return res.json({ ok: false, error: "User not found" });
  if (!followers[followingId]) followers[followingId] = [];
  if (!followers[followingId].includes(followerId)) followers[followingId].push(followerId);
  res.json({ ok: true, followers: followers[followingId] });
});

app.get("/profiles/:id/followers", (req, res) => {
  res.json({ followers: followers[req.params.id] || [] });
});

app.get("/profiles/:id/following", (req, res) => {
  const uid = req.params.id;
  const following = Object.keys(followers).filter(f => followers[f].includes(uid));
  res.json({ following });
});

// --- Streams ---
app.get("/streams/live", (req, res) => {
  res.json({ streams });
});

app.post("/streams", (req, res) => {
  const { hostId, title } = req.body;
  const stream = { id: "st_" + (streams.length + 1), hostId, title, live: true };
  streams.push(stream);
  res.json({ ok: true, stream });
});

// --- Messages ---
app.get("/messages/:from/:to", (req, res) => {
  const { from, to } = req.params;
  const conv = messages.filter(m => 
    (m.from === from && m.to === to) || (m.from === to && m.to === from)
  );
  res.json({ messages: conv });
});

app.post("/messages", (req, res) => {
  const { fromUserId, toUserId, text } = req.body;
  const msg = { id: "m_" + (messages.length + 1), from: fromUserId, to: toUserId, text };
  messages.push(msg);
  res.json({ ok: true, msg });
});

// --- Shorts ---
app.get("/shorts", (req, res) => {
  res.json({ shorts });
});

// --- Demo Test ---
app.get("/tests/demo", (req, res) => {
  try {
    const alice = registerOrLogin("Alice");
    const bob = registerOrLogin("Bob");
    wallet[alice.id].coins += 500;
    followers[bob.id].push(alice.id);
    const gift = gifts[0];
    if (wallet[alice.id].coins >= gift.cost) {
      wallet[alice.id].coins -= gift.cost;
      wallet[bob.id].coins += gift.cost;
    }
    res.json({
      ok: true,
      users: { alice, bob },
      aliceWallet: wallet[alice.id],
      bobWallet: wallet[bob.id],
      followersOfBob: followers[bob.id],
      giftSent: gift
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.listen(PORT, () => console.log("✅ Server running on port", PORT));
