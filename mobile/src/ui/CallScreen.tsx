import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { AgentState } from 'agora-agent-client-toolkit';
import type { Turn } from '../CallState';
import { AgoraMark, BrandIcon } from './Brand';
import { colors, radii } from './theme';

interface Props {
  agentState: AgentState;
  micMuted: boolean;
  turns: Turn[];
  onToggleMic: () => void;
  onEnd: () => void;
}

export function CallScreen({ agentState, micMuted, turns, onToggleMic, onEnd }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BrandIcon size={42} />
        <View style={styles.headerCopy}><Text style={styles.title}>RoundTable live</Text><Text style={styles.subtitle}>Everyone can see this transcript</Text></View>
        <View style={styles.state}><View style={styles.stateDot} /><Text style={styles.stateText}>{String(agentState)}</Text></View>
      </View>

      <View style={styles.stage}>
        <View style={styles.stageTop}><Text style={styles.stageLabel}>VOICE CENTRAL STAGE</Text><AgoraMark compact /></View>
        <Text style={styles.stageTitle}>{micMuted ? 'Room audio paused' : 'Listening to the room…'}</Text>
        <Text style={styles.stageBody}>Live Agora speech becomes visible, attributed context before the agent recommends or acts.</Text>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        data={turns}
        keyExtractor={turn => `${turn.turnId}-${turn.type}`}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.type === 'agent' ? styles.agentBubble : styles.userBubble]}>
            <Text style={styles.role}>{item.type === 'agent' ? 'ROUNDTABLE' : 'YOU'}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>≋</Text><Text style={styles.emptyTitle}>Say what matters to you</Text><Text style={styles.emptyBody}>Constraints and preferences will appear here as the conversation begins.</Text></View>}
      />

      <View style={styles.controls}>
        <Pressable onPress={onToggleMic} style={[styles.control, micMuted && styles.controlActive]}><Text style={styles.controlIcon}>{micMuted ? '×' : '●'}</Text><Text style={styles.controlText}>{micMuted ? 'Unmute' : 'Mute'}</Text></Pressable>
        <Pressable style={[styles.control, styles.endControl]} onPress={onEnd}><Text style={styles.endIcon}>↙</Text><Text style={[styles.controlText, styles.endText]}>Leave</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas, padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', minHeight: 58 },
  headerCopy: { flex: 1, marginLeft: 11 },
  title: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  subtitle: { color: colors.muted, fontSize: 8, marginTop: 3 },
  state: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: radii.pill, backgroundColor: colors.greenSoft, paddingHorizontal: 9, paddingVertical: 7 },
  stateDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  stateText: { color: colors.green, fontSize: 7, fontWeight: '900', textTransform: 'uppercase' },
  stage: { borderRadius: 27, backgroundColor: colors.ink, padding: 18, marginTop: 8 },
  stageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stageLabel: { color: colors.lime, fontSize: 8, letterSpacing: 1.2, fontWeight: '900' },
  stageTitle: { color: colors.surface, fontSize: 21, fontWeight: '900', marginTop: 16 },
  stageBody: { color: '#AFA8B8', fontSize: 9, lineHeight: 14, marginTop: 6 },
  list: { flex: 1, marginTop: 10 },
  listContent: { paddingBottom: 12 },
  bubble: { padding: 14, borderRadius: 20, marginVertical: 5, maxWidth: '86%' },
  agentBubble: { backgroundColor: colors.brandSoft, alignSelf: 'flex-start', borderBottomLeftRadius: 6 },
  userBubble: { backgroundColor: colors.lime, alignSelf: 'flex-end', borderBottomRightRadius: 6 },
  role: { fontSize: 7, color: colors.brandDark, letterSpacing: 1, fontWeight: '900', marginBottom: 5 },
  text: { fontSize: 13, lineHeight: 18, color: colors.ink, fontWeight: '600' },
  empty: { alignItems: 'center', padding: 35 },
  emptyIcon: { color: colors.brand, fontSize: 31, fontWeight: '900' },
  emptyTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 10 },
  emptyBody: { color: colors.muted, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 6 },
  controls: { flexDirection: 'row', gap: 9, paddingTop: 8 },
  control: { flex: 1, minHeight: 55, borderRadius: 19, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  controlActive: { backgroundColor: colors.yellowSoft },
  endControl: { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft },
  controlIcon: { color: colors.brand, fontSize: 14, fontWeight: '900' },
  controlText: { color: colors.ink, fontSize: 11, fontWeight: '900' },
  endIcon: { color: colors.danger, fontSize: 17, fontWeight: '900' },
  endText: { color: colors.danger },
});
