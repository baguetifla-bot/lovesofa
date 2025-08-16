import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TextInput, Button, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API = const API = 'https://ton-backend.onrender.com';

// --- Simple store (in-app) ---
const Store = React.createContext({});

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!username) return;
    setLoading(true);
    try {
      const r = await fetch(API + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username }) });
      const data = await r.json();
      if (data && data.ok) onLogin(data.user);
      else alert('Login error');
    } catch(e) {
      alert(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex:1, padding:16, justifyContent:'center' }}>
      <Text style={{ fontSize:22, fontWeight:'700', marginBottom:12 }}>Love Sofa</Text>
      <Text style={{ marginBottom:8 }}>Entre un pseudo pour te connecter</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="ex: alice" style={{ borderWidth:1, padding:10, borderRadius:8 }} />
      <View style={{ height:10 }} />
      <Button title={loading ? "Connexion..." : "Se connecter"} onPress={submit} />
    </SafeAreaView>
  );
}

function HomeScreen() {
  const { user } = React.useContext(Store);
  const profiles = [
    { id: 'u_alice', name: 'Alice', tags: 'Recommandé' },
    { id: 'u_bob', name: 'Bob', tags: 'À proximité' },
    { id: 'u_charlie', name: 'Charlie', tags: 'Nouveau' },
  ];
  return (
    <SafeAreaView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>Découvrir</Text>
      <FlatList
        data={profiles}
        keyExtractor={(item)=>item.id}
        renderItem={({item}) => (
          <View style={{ padding:12, borderWidth:1, borderRadius:8, marginTop:10 }}>
            <Text style={{ fontWeight:'600' }}>{item.name}</Text>
            <Text>{item.tags}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function LiveScreen() {
  const [streams, setStreams] = useState([]);
  const { user } = React.useContext(Store);

  async function refresh() {
    try {
      const r = await fetch(API + '/streams');
      const data = await r.json();
      setStreams(data.streams || []);
    } catch(e) { alert(String(e)); }
  }

  async function goLive() {
    try {
      const r = await fetch(API + '/streams', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ hostId: user.id, title: 'Mon Live' }) });
      const data = await r.json();
      if (data.ok) refresh();
    } catch(e) { alert(String(e)); }
  }

  useEffect(()=>{ refresh(); }, []);

  return (
    <SafeAreaView style={{ flex:1, padding:16 }}>
      <Button title="Démarrer un live (mock)" onPress={goLive} />
      <View style={{ height:12 }} />
      <Button title="Rafraîchir" onPress={refresh} />
      <FlatList
        style={{ marginTop:16 }}
        data={streams}
        keyExtractor={(i)=>i.id}
        renderItem={({item}) => (
          <View style={{ padding:12, borderWidth:1, borderRadius:8, marginBottom:10 }}>
            <Text style={{ fontWeight:'600' }}>{item.title}</Text>
            <Text>Host: {item.hostId}</Text>
            <Text>Statut: {item.live ? 'EN DIRECT' : 'OFF'}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function MessagesScreen() {
  const { user } = React.useContext(Store);
  const [peer, setPeer] = useState('');
  const [text, setText] = useState('');
  const [list, setList] = useState([]);

  async function load() {
    if (!peer) return;
    const r = await fetch(API + '/messages/' + user.id + '/' + peer);
    const data = await r.json();
    setList(data.messages || []);
  }
  async function send() {
    if (!peer || !text) return;
    const r = await fetch(API + '/messages', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fromUserId: user.id, toUserId: peer, text }) });
    const data = await r.json();
    setText('');
    load();
  }

  return (
    <SafeAreaView style={{ flex:1, padding:16 }}>
      <Text>Peer userId (ex: u_bob)</Text>
      <TextInput value={peer} onChangeText={setPeer} placeholder="u_bob" style={{ borderWidth:1, padding:8, borderRadius:8, marginBottom:8 }} />
      <Button title="Charger" onPress={load} />
      <View style={{ height:8 }} />
      <FlatList
        data={list}
        keyExtractor={(i)=>i.id}
        renderItem={({item}) => (
          <View style={{ padding:8, borderWidth:1, borderRadius:8, marginBottom:6 }}>
            <Text>{item.from === user.id ? 'Moi' : item.from}: {item.text}</Text>
          </View>
        )}
      />
      <View style={{ flexDirection:'row', gap:8, marginTop:8 }}>
        <TextInput value={text} onChangeText={setText} placeholder="Ton message" style={{ flex:1, borderWidth:1, padding:8, borderRadius:8 }} />
        <Button title="Envoyer" onPress={send} />
      </View>
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const { user, setUser } = React.useContext(Store);
  const [balance, setBalance] = useState({ coins: 0, diamonds: 0 });
  const [tipAmount, setTipAmount] = useState('100');
  const [target, setTarget] = useState('');

  async function load() {
    const r = await fetch(API + '/wallet/balance/' + user.id);
    const data = await r.json();
    setBalance({ coins: data.coins, diamonds: data.diamonds });
  }
  async function tip() {
    if (!target) { alert('Cible (userId) requise'); return; }
    const amt = parseInt(tipAmount || '0', 10);
    const r = await fetch(API + '/wallet/give', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fromUserId: user.id, toUserId: target, amount: amt }) });
    const data = await r.json();
    if (!data.ok) alert('Erreur: ' + JSON.stringify(data));
    load();
  }
  useEffect(()=>{ load(); }, []);

  return (
    <SafeAreaView style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:'700' }}>Mon profil</Text>
      <Text>ID: {user.id}</Text>
      <Text>Pseudo: {user.username}</Text>
      <View style={{ height:10 }} />
      <Text>Coins: {balance.coins} — Diamonds: {balance.diamonds}</Text>
      <View style={{ height:14 }} />
      <Text>Envoyer des coins (tip)</Text>
      <TextInput value={target} onChangeText={setTarget} placeholder="userId du streamer (ex: u_bob)" style={{ borderWidth:1, padding:8, borderRadius:8, marginBottom:8 }} />
      <TextInput value={tipAmount} onChangeText={setTipAmount} placeholder="montant" keyboardType="numeric" style={{ borderWidth:1, padding:8, borderRadius:8, marginBottom:8 }} />
      <Button title="Envoyer" onPress={tip} />
      <View style={{ height:10 }} />
      <Button title="Rafraîchir solde" onPress={load} />
    </SafeAreaView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <Store.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Live" component={LiveScreen} />
          <Tab.Screen name="Messages" component={MessagesScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </Store.Provider>
  );
}
