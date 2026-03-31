import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { prologEngine } from './prolog/PrologEngine';

// Importar archivo .pl como texto
const GAME_PROLOG = require('./prolog/game.pl');

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // En web/Expo, los assets .pl se importan como modulos de texto
        // Si falla, poner el codigo Prolog como string directamente
        const prologCode = typeof GAME_PROLOG === 'string'
          ? GAME_PROLOG
          : await fetch(GAME_PROLOG).then(r => r.text());

        await prologEngine.loadProgram(prologCode);
        setReady(true);
      } catch (e: any) {
        setError(e.message);
      }
    })();
  }, []);

  if (error) return <Text style={{color:'red', padding:20}}>{error}</Text>;
  if (!ready) return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size="large" />
      <Text>Iniciando motor Prolog...</Text>
    </View>
  );

  return (
    <NavigationContainer>
      {/* Tu navegación aquí */}
    </NavigationContainer>
  );
}
