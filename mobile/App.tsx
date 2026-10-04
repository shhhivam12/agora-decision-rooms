import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav, MainTab } from './src/ui/BottomNav';
import { CreateRoomScreen } from './src/ui/CreateRoomScreen';
import { FriendsScreen } from './src/ui/FriendsScreen';
import { HomeScreen } from './src/ui/HomeScreen';
import { OutingRoomScreen } from './src/ui/OutingRoomScreen';
import { ProfileScreen } from './src/ui/ProfileScreen';
import { LiveVoiceScreen } from './src/ui/LiveVoiceScreen';
import { RoomsScreen } from './src/ui/RoomsScreen';
import { colors } from './src/ui/theme';
import { initialVoiceInvite } from './src/initialVoiceInvite';
import { LanguageProvider, LanguageSwitch } from './src/i18n';

type Screen = MainTab | 'outing-room' | 'live-voice';

export function AppContent() {
  const [screen, setScreen] = useState<Screen>(
    initialVoiceInvite() ? 'live-voice' : 'home',
  );
  const openRoom = () => setScreen('outing-room');

  if (screen === 'live-voice') {
    return (
      <LiveVoiceScreen
        onLeave={() => setScreen('home')}
        onOpenDemo={openRoom}
      />
    );
  }

  if (screen === 'outing-room') {
    return <OutingRoomScreen onLeave={() => setScreen('rooms')} />;
  }

  const currentTab: MainTab = screen;
  return (
    <View style={styles.shell}>
      <View style={styles.page}>
        {screen === 'home' ? (
          <HomeScreen
            onCreateRoom={() => setScreen('create')}
            onOpenRoom={openRoom}
            onSeeRooms={() => setScreen('rooms')}
            onOpenVoice={() => setScreen('live-voice')}
          />
        ) : null}
        {screen === 'rooms' ? (
          <RoomsScreen
            onOpenRoom={openRoom}
            onCreateRoom={() => setScreen('create')}
          />
        ) : null}
        {screen === 'create' ? (
          <CreateRoomScreen onCreateRoom={openRoom} />
        ) : null}
        {screen === 'friends' ? <FriendsScreen /> : null}
        {screen === 'profile' ? (
          <ProfileScreen onOpenVoice={() => setScreen('live-voice')} />
        ) : null}
      </View>
      <BottomNav current={currentTab} onChange={setScreen} />
    </View>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={colors.canvas} />
        <SafeAreaView
          style={styles.safeArea}
          edges={['top', 'left', 'right', 'bottom']}
        >
          <LanguageSwitch />
          <AppContent />
        </SafeAreaView>
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.canvas },
  shell: { flex: 1, backgroundColor: colors.canvas },
  page: { flex: 1 },
});
