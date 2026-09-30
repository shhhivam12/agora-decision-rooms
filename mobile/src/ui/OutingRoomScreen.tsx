import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { participants } from '../demo/demoEngine';
import { AgoraMark, BrandIcon } from './Brand';
import { colors } from './theme';

type Step = 'brief' | 'search' | 'compare' | 'vote' | 'approve' | 'execute' | 'receipt';
type Scenario = 'budget' | 'rain' | 'early';
const steps: Step[] = ['brief', 'search', 'compare', 'vote', 'approve', 'execute', 'receipt'];
const scenarios = {
  budget: { label: 'Budget squeeze', quote: 'Ayaan: Can we keep it under ₹700 each?', conflict: 'Bowling exceeds Ayaan’s budget. I’m comparing lower-cost plans.', limit: '₹700 / person', time: '7:00–9:30 PM', recommendation: 'Games café', reason: '₹620 each leaves ₹80 headroom and includes food and an activity.', costs: [760, 890, 620], eligible: [false, false, true] },
  rain: { label: 'Rain changes plans', quote: 'Priya: It’s raining. Can we stay indoors?', conflict: 'Weather changed the brief. All three demo alternatives below are indoors.', limit: '₹900 / person', time: '7:00–9:30 PM', recommendation: 'Bowling + bites', reason: 'Indoor activity, vegetarian options and the shortest journey.', costs: [760, 890, 620], eligible: [true, true, true] },
  early: { label: 'Leave early', quote: 'You: I need to be home by 9 PM.', conflict: 'We need a shorter plan with enough time to travel home.', limit: '₹900 / person', time: '6:30–8:00 PM', recommendation: 'Bowling + bites', reason: 'An 18-minute journey gives the room the largest travel buffer.', costs: [760, 890, 620], eligible: [true, true, true] },
};
const plans = ['Bowling + bites', 'Paint + pizza', 'Games café'];
const headings: Record<Step, string> = { brief: 'One room. Different needs.', search: 'Finding common ground', compare: 'The trade-offs, side by side', vote: 'Give everyone a say', approve: 'Here’s exactly what happens next', execute: 'Preparing your shared plan', receipt: 'A decision with a receipt' };

function Button({ label, onPress, testID, secondary = false }: { label: string; onPress: () => void; testID?: string; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} testID={testID} onPress={onPress} style={({ pressed }) => [s.button, secondary && s.secondary, pressed && { opacity: .7 }]}><Text style={[s.buttonText, secondary && { color: colors.surface }]}>{label}</Text></Pressable>;
}

export function OutingRoomScreen({ onLeave }: { onLeave: () => void }) {
  const [scenario, setScenario] = useState<Scenario>('budget');
  const [step, setStep] = useState<Step>('brief');
  const [following, setFollowing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [raised, setRaised] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [transcript, setTranscript] = useState(false);
  const [selected, setSelected] = useState('Games café');
  const [votes, setVotes] = useState<Record<string, string>>({});
  const [events, setEvents] = useState<string[]>(['Room opened • demo participants']);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const context = scenarios[scenario];
  const index = steps.indexOf(step);
  const everyoneVoted = participants.every(person => votes[person.id]);
  const approvedChoice = plans.reduce((best, plan) => Object.values(votes).filter(v => v === plan).length > Object.values(votes).filter(v => v === best).length ? plan : best, selected);
  const log = (message: string) => setEvents(items => [...items, message]);

  useEffect(() => {
    if (!following || !['brief', 'search', 'execute'].includes(step)) return;
    timer.current = setTimeout(() => {
      const next: Step = step === 'brief' ? 'search' : step === 'search' ? 'compare' : 'receipt';
      setStep(next);
      setEvents(items => [...items, next === 'search' ? 'Agent opened search • fixture provider' : next === 'compare' ? 'Agent opened comparison • 3 demo options' : 'Local demo receipt created • no external write']);
    }, 2200);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [following, step]);

  function chooseScenario(value: Scenario) {
    setScenario(value); setStep('brief'); setFollowing(false); setVotes({});
    setSelected(scenarios[value].recommendation);
    setEvents(['Room brief updated • ' + scenarios[value].label]);
  }

  return <View testID="outing-room-screen" style={s.screen}>
    <View style={s.header}><BrandIcon size={35} /><View style={s.headerCopy}><Text style={s.title}>Friday Fun Crew</Text><Text style={s.meta}>Group outing · 3 demo participants</Text></View><Text style={s.demo}>DEMO CALL</Text></View>
    {!expanded ? <View style={s.tiles}>{participants.map((person, i) => <View key={person.id} style={[s.tile, i === 1 && following && s.speaker]}>
      <View style={[s.avatar, { backgroundColor: person.color }]}><Text style={s.initial}>{person.initial}</Text></View>
      <Text style={s.camera}>Camera off</Text><View style={s.tileFooter}><Text style={s.name}>{person.name}{person.id === 'you' && raised ? ' ✋' : ''}</Text><Text style={s.signal}>{person.id === 'you' && muted ? 'Muted' : '· · ·'}</Text></View>
    </View>)}</View> : null}
    <View style={s.stageBar}><View style={s.dot} /><Text style={s.stageBarText}>SMART STAGE</Text><Text style={s.owner}>{following ? 'Agent presenting' : 'Agent paused'}</Text><Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Show participants' : 'Expand stage'} onPress={() => setExpanded(v => !v)}><Text style={s.expand}>{expanded ? 'Collapse' : 'Expand'}</Text></Pressable></View>
    <ScrollView style={s.scroll} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>TRY A CONVERSATION TWIST</Text>
      <View style={s.chips}>{(Object.keys(scenarios) as Scenario[]).map(key => <Pressable accessibilityRole="button" accessibilityState={{ selected: key === scenario }} key={key} onPress={() => chooseScenario(key)} style={[s.chip, key === scenario && s.chipActive]}><Text style={[s.chipText, key === scenario && { color: colors.ink }]}>{scenarios[key].label}</Text></Pressable>)}</View>
      <View testID="central-stage" style={s.stage}>
        <View style={s.presenter}><BrandIcon size={32} /><View style={s.headerCopy}><Text style={s.name}>RoundTable</Text><Text style={s.meta}>Shared workspace · simulated agent</Text></View><Text style={s.counter}>{index + 1} / 7</Text></View>
        <View style={s.progress}>{steps.map((item, i) => <View key={item} style={[s.segment, i <= index && { backgroundColor: colors.lime }]} />)}</View>
        <Text style={s.stageTitle}>{headings[step]}</Text>
        <Text style={s.quote}>{context.quote}</Text>
        {step === 'brief' && <>
          <View style={s.facts}><View style={s.fact}><Text style={s.factLabel}>BUDGET</Text><Text style={s.factValue}>{context.limit}</Text></View><View style={s.fact}><Text style={s.factLabel}>TIME WINDOW</Text><Text style={s.factValue}>{context.time}</Text></View></View>
          <View style={s.notice}><Text style={s.noticeTitle}>Something to resolve</Text><Text style={s.body}>{context.conflict}</Text></View>
          <Button testID="run-agent-demo" label="Let RoundTable work" onPress={() => { setFollowing(true); log('Agent collected preferences • vegetarian + food + activity'); }} />
        </>}
        {step === 'search' && <><View style={s.notice}><Text style={s.noticeTitle}>Searching demo options…</Text><Text style={s.body}>Checking cost, indoor seating and journey times against the room’s brief.</Text></View><Text style={s.caption}>Fixture data · no live venue search</Text></>}
        {step === 'compare' && <>
          {plans.map((plan, i) => <Pressable key={plan} accessibilityRole="button" accessibilityLabel={'Select ' + plan} accessibilityState={{ disabled: !context.eligible[i], selected: selected === plan }} disabled={!context.eligible[i]} onPress={() => setSelected(plan)} style={[s.option, selected === plan && s.optionSelected, !context.eligible[i] && { opacity: .5 }]}><View style={s.row}><Text style={s.optionTitle}>{plan}</Text><Text style={s.price}>₹{context.costs[i]}</Text></View><Text style={s.body}>{[18, 24, 31][i]} min travel · Indoor · Vegetarian</Text><Text style={s.caption}>{!context.eligible[i] ? 'Over budget — excluded' : selected === plan ? 'Selected for the room vote' : 'Tap to compare this plan'}</Text></Pressable>)}
          <Text style={s.recommendation}>Agent recommends {context.recommendation}: {context.reason}</Text>
          <Button label="Ask the room to vote" onPress={() => { setStep('vote'); log('Agent opened vote • ' + selected); }} />
        </>}
        {step === 'vote' && <><Text style={s.body}>Simulate each participant’s vote for {selected}. The decision waits for all three.</Text>{participants.map(person => <Button key={person.id} secondary label={votes[person.id] ? person.name + ' voted ✓' : 'Simulate ' + person.name + ' vote'} onPress={() => { setVotes(v => ({ ...v, [person.id]: selected })); }} />)}<Text style={s.recommendation}>{Object.keys(votes).length} / 3 votes recorded</Text>{everyoneVoted && <Button label="Review proposed action" onPress={() => { setStep('approve'); log('Votes counted • ' + approvedChoice); }} />}</>}
        {step === 'approve' && <><View style={s.notice}><Text style={s.noticeTitle}>{approvedChoice}</Text><Text style={s.body}>Friday · {context.time}{'\n'}Attendees: You, Priya, Ayaan{'\n'}Action: draft a shared calendar event{'\n'}No payment or reservation</Text></View><Text style={s.caption}>Demo approval only. No calendar account will be changed.</Text><Button label="Approve demo calendar action" onPress={() => { setStep('execute'); setFollowing(true); log('Host approved demo action'); }} /><Button secondary label="Back to comparison" onPress={() => { setStep('compare'); setVotes({}); }} /></>}
        {step === 'execute' && <View style={s.notice}><Text style={s.noticeTitle}>Preparing event details…</Text><Text style={s.body}>The approved plan stays visible while the agent prepares its local receipt.</Text></View>}
        {step === 'receipt' && <><View style={s.receipt}><Text style={s.receiptLabel}>DEMO COMPLETE ✓</Text><Text style={s.optionTitle}>{approvedChoice}</Text><Text style={s.body}>{context.time}{'\n'}3 simulated votes · host approval recorded{'\n'}Receipt: DEMO-CAL-2048</Text></View><Text style={s.caption}>Local simulation completed. No event was created in an external calendar.</Text><Button label="Try another decision" onPress={() => chooseScenario(scenario)} /></>}
        <View style={s.partner}><AgoraMark compact /></View>
      </View>
      <View style={s.log}><Text style={s.logTitle}>Agent activity</Text>{events.slice(-5).map((event, i) => <Text key={i} style={s.logItem}>• {event}</Text>)}</View>
      {transcript && <View style={s.log}><Text style={s.logTitle}>Conversation · demo transcript</Text><Text style={s.logItem}>{context.quote}</Text><Text style={s.logItem}>Priya: Vegetarian food, please.</Text><Text style={s.logItem}>RoundTable: {context.conflict}</Text></View>}
    </ScrollView>
    <View style={s.controls}>
      <Pressable accessibilityRole="button" accessibilityLabel={muted ? 'Unmute demo microphone' : 'Mute demo microphone'} onPress={() => setMuted(v => !v)} style={s.control}><Text style={s.controlIcon}>{muted ? '×' : '●'}</Text><Text style={s.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Raise hand" onPress={() => setRaised(v => !v)} style={[s.control, raised && s.controlActive]}><Text style={s.controlIcon}>✋</Text><Text style={s.controlLabel}>{raised ? 'Lower' : 'Hand'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Toggle transcript" onPress={() => setTranscript(v => !v)} style={[s.control, transcript && s.controlActive]}><Text style={s.controlIcon}>≡</Text><Text style={s.controlLabel}>Captions</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={following ? 'Pause agent' : 'Resume agent'} onPress={() => setFollowing(v => !v)} style={s.control}><Text style={s.controlIcon}>{following ? 'Ⅱ' : '▶'}</Text><Text style={s.controlLabel}>Agent</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Leave room" onPress={onLeave} style={[s.control, s.leave]}><Text style={s.controlIcon}>↙</Text><Text style={s.controlLabel}>Leave</Text></Pressable>
    </View>
  </View>;
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#101016' }, header: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 9 }, headerCopy: { flex: 1 }, title: { color: '#FFF', fontSize: 16, fontWeight: '800' }, meta: { color: '#A8A6B7', fontSize: 10, marginTop: 4 }, demo: { color: colors.lime, fontSize: 8, fontWeight: '800' },
  tiles: { flexDirection: 'row', gap: 7, paddingHorizontal: 12, paddingBottom: 14 }, tile: { flex: 1, height: 122, backgroundColor: '#252431', borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#333141' }, speaker: { borderColor: colors.lime }, avatar: { height: 40, width: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }, initial: { color: '#FFF', fontSize: 19, fontWeight: '800' }, camera: { color: '#A8A6B7', fontSize: 8, marginTop: 6 }, tileFooter: { position: 'absolute', bottom: 7, left: 7, right: 7, flexDirection: 'row', justifyContent: 'space-between' }, name: { color: '#FFF', fontSize: 12, fontWeight: '700' }, signal: { color: colors.lime, fontSize: 9 },
  stageBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, backgroundColor: '#1D1B28', gap: 7 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lime }, stageBarText: { color: '#FFF', fontSize: 10, letterSpacing: 1, fontWeight: '800' }, owner: { flex: 1, color: '#B0A9C5', fontSize: 9 }, expand: { color: colors.lime, fontSize: 10, padding: 4 }, scroll: { flex: 1 }, content: { padding: 13, paddingBottom: 25 }, eyebrow: { color: '#A8A6B7', fontSize: 8, letterSpacing: 1.2, marginVertical: 8 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }, chip: { padding: 9, borderRadius: 12, backgroundColor: '#292633' }, chipActive: { backgroundColor: colors.lime }, chipText: { color: '#D6D2E1', fontSize: 10, fontWeight: '700' },
  stage: { padding: 17, borderRadius: 24, backgroundColor: '#211E30', borderWidth: 1, borderColor: '#44395F' }, presenter: { flexDirection: 'row', alignItems: 'center', gap: 9 }, counter: { color: colors.lime, fontSize: 11 }, progress: { flexDirection: 'row', gap: 4, marginVertical: 19 }, segment: { height: 3, flex: 1, backgroundColor: '#454051', borderRadius: 2 }, stageTitle: { color: '#FFF', fontSize: 25, lineHeight: 30, fontWeight: '800' }, quote: { color: '#C6BCD8', fontSize: 12, lineHeight: 18, marginVertical: 13 }, facts: { flexDirection: 'row', gap: 8 }, fact: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#322C44' }, factLabel: { color: '#AC9DC8', fontSize: 8 }, factValue: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 6 }, notice: { padding: 15, borderRadius: 16, backgroundColor: '#3B3248', marginVertical: 12 }, noticeTitle: { color: '#FFE4A4', fontSize: 14, fontWeight: '800', marginBottom: 7 }, body: { color: '#D0C8DE', fontSize: 12, lineHeight: 19 }, button: { padding: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: colors.lime, marginTop: 10, minHeight: 48 }, secondary: { backgroundColor: '#403651' }, buttonText: { color: '#16131E', fontSize: 12, fontWeight: '800' }, caption: { color: '#AC9DC8', fontSize: 10, lineHeight: 15, marginTop: 9 }, option: { borderWidth: 1, borderColor: '#514762', padding: 13, borderRadius: 16, marginTop: 9 }, optionSelected: { borderColor: colors.lime, backgroundColor: '#322D42' }, row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }, optionTitle: { color: '#FFF', fontSize: 14, fontWeight: '800' }, price: { color: colors.lime, fontSize: 13, fontWeight: '800' }, recommendation: { color: colors.lime, fontSize: 12, lineHeight: 18, marginTop: 14 }, receipt: { padding: 16, backgroundColor: '#253B34', borderRadius: 16, gap: 10 }, receiptLabel: { color: colors.lime, fontSize: 10, fontWeight: '800' }, partner: { marginTop: 18 }, log: { marginTop: 14, padding: 14, borderRadius: 18, backgroundColor: '#1B1A24' }, logTitle: { color: '#FFF', fontSize: 12, fontWeight: '700', marginBottom: 7 }, logItem: { color: '#ACA5BB', fontSize: 11, lineHeight: 18, marginTop: 6 },
  controls: { flexDirection: 'row', padding: 10, gap: 7, backgroundColor: '#1D1B28', borderTopWidth: 1, borderColor: '#33303F' }, control: { flex: 1, minHeight: 55, borderRadius: 16, backgroundColor: '#302D3D', alignItems: 'center', justifyContent: 'center', gap: 4 }, controlActive: { backgroundColor: '#6250A3' }, controlIcon: { color: '#FFF', fontSize: 18 }, controlLabel: { color: '#DDD6E9', fontSize: 9 }, leave: { backgroundColor: '#B84756' },
});
