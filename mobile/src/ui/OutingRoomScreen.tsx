import { AppText as Text, AppPressable as Pressable } from '../i18n';
import React, { useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { participants } from '../demo/demoEngine';
import { AgoraMark, BrandIcon } from './Brand';
import { colors } from './theme';
import { Icon, IconName } from './Icon';
import { Avatar } from './Portrait';
import { characterBusts } from './CharacterSources';
import { CharacterArt } from './CharacterArt';
import { RoomLoader } from './RoomLoader';
import { CaptionScroller } from './CaptionScroller';

type Step =
  | 'brief'
  | 'search'
  | 'compare'
  | 'vote'
  | 'approve'
  | 'execute'
  | 'receipt';
type Scenario = 'budget' | 'rain' | 'early';
const steps: Step[] = [
  'brief',
  'search',
  'compare',
  'vote',
  'approve',
  'execute',
  'receipt',
];
const scenarios = {
  budget: {
    label: 'Budget squeeze',
    quote: 'Ayaan: Can we keep it under ₹700 each?',
    conflict: 'Bowling exceeds Ayaan’s budget. I’m comparing lower-cost plans.',
    limit: '₹700 / person',
    time: '7:00–9:30 PM',
    recommendation: 'Games café',
    reason: '₹620 each leaves ₹80 headroom and includes food and an activity.',
    costs: [760, 890, 620],
    eligible: [false, false, true],
  },
  rain: {
    label: 'Rain changes plans',
    quote: 'Priya: It’s raining. Can we stay indoors?',
    conflict:
      'Weather changed the brief. All three demo alternatives below are indoors.',
    limit: '₹900 / person',
    time: '7:00–9:30 PM',
    recommendation: 'Bowling + bites',
    reason: 'Indoor activity, vegetarian options and the shortest journey.',
    costs: [760, 890, 620],
    eligible: [true, true, true],
  },
  early: {
    label: 'Leave early',
    quote: 'You: I need to be home by 9 PM.',
    conflict: 'We need a shorter plan with enough time to travel home.',
    limit: '₹900 / person',
    time: '6:30–8:00 PM',
    recommendation: 'Bowling + bites',
    reason: 'An 18-minute journey gives the room the largest travel buffer.',
    costs: [760, 890, 620],
    eligible: [true, true, true],
  },
};
const plans = ['Bowling + bites', 'Paint + pizza', 'Games café'];
const headings: Record<Step, string> = {
  brief: 'One room. Different needs.',
  search: 'Finding common ground',
  compare: 'The trade-offs, side by side',
  vote: 'Give everyone a say',
  approve: 'Here’s exactly what happens next',
  execute: 'Preparing your shared plan',
  receipt: 'A decision with a receipt',
};

function Button({
  label,
  onPress,
  testID,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  testID?: string;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: colors.ink }]}>
        {label}
      </Text>
      <Icon
        name="arrow"
        size={18}
        color={secondary ? colors.ink : colors.inverse}
      />
    </Pressable>
  );
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
  const [events, setEvents] = useState<string[]>([
    'Room opened • demo participants',
  ]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageScroll = useRef<ScrollView>(null);
  const context = scenarios[scenario];
  const index = steps.indexOf(step);
  const everyoneVoted = participants.every(person => votes[person.id]);
  const approvedChoice = plans.reduce(
    (best, plan) =>
      Object.values(votes).filter(v => v === plan).length >
      Object.values(votes).filter(v => v === best).length
        ? plan
        : best,
    selected,
  );
  const log = (message: string) => setEvents(items => [...items, message]);

  useEffect(() => {
    stageScroll.current?.scrollTo({ y: 0, animated: false });
  }, [step, scenario]);

  useEffect(() => {
    if (!following || !['brief', 'search', 'execute'].includes(step)) return;
    timer.current = setTimeout(() => {
      const next: Step =
        step === 'brief' ? 'search' : step === 'search' ? 'compare' : 'receipt';
      setStep(next);
      setEvents(items => [
        ...items,
        next === 'search'
          ? 'Agent opened search • fixture provider'
          : next === 'compare'
          ? 'Agent opened comparison • 3 demo options'
          : 'Local demo receipt created • no external write',
      ]);
    }, 2200);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [following, step]);

  function chooseScenario(value: Scenario) {
    setScenario(value);
    setStep('brief');
    setFollowing(false);
    setVotes({});
    setSelected(scenarios[value].recommendation);
    setEvents(['Room brief updated • ' + scenarios[value].label]);
  }

  const controls: {
    label: string;
    caption: string;
    icon: IconName;
    active?: boolean;
    action: () => void;
    leave?: boolean;
  }[] = [
    {
      label: muted ? 'Unmute demo microphone' : 'Mute demo microphone',
      caption: muted ? 'Unmute' : 'Mic',
      icon: muted ? 'muted' : 'mic',
      active: muted,
      action: () => setMuted(v => !v),
    },
    {
      label: 'Raise hand',
      caption: raised ? 'Lower' : 'Hand',
      icon: 'hand',
      active: raised,
      action: () => setRaised(v => !v),
    },
    {
      label: 'Toggle transcript',
      caption: 'Captions',
      icon: 'captions',
      active: transcript,
      action: () => setTranscript(v => !v),
    },
    {
      label: following ? 'Pause agent' : 'Resume agent',
      caption: 'Agent',
      icon: following ? 'pause' : 'play',
      action: () => setFollowing(v => !v),
    },
    {
      label: 'Leave room',
      caption: 'Leave',
      icon: 'leave',
      leave: true,
      action: onLeave,
    },
  ];
  return (
    <View testID="outing-room-screen" style={s.screen}>
      <View style={s.callHead}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Leave decision room"
          onPress={onLeave}
          style={s.back}
        >
          <Icon name="back" color={colors.inverse} size={22} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>Friday Fun Crew</Text>
          <Text style={s.meta}>Agora Decision Rooms · Group outing</Text>
        </View>
        <View style={s.demo}>
          <Text style={s.demoText}>DEMO</Text>
        </View>
      </View>
      {!expanded && (
        <View style={s.tiles}>
          {participants.map((person, i) => (
            <View
              key={person.id}
              style={[s.tile, i === 1 && following && s.speaker]}
            >
              <Image
                accessible={false}
                source={characterBusts[person.id]}
                resizeMode="contain"
                style={s.portrait}
              />
              <View style={s.tileBadge}>
                <Icon
                  name={person.id === 'you' && muted ? 'muted' : 'waveform'}
                  color={colors.inverse}
                  size={16}
                />
              </View>
              <View style={s.tileFooter}>
                <Text style={s.name}>
                  {person.name}
                  {person.id === 'you' && raised ? ' · Hand up' : ''}
                </Text>
                <Text style={s.avatarLabel}>Avatar · camera off</Text>
              </View>
            </View>
          ))}
        </View>
      )}
      <View style={s.stageBar}>
        <Icon name="rooms" size={17} />
        <Text style={s.stageBarText}>Smart Stage</Text>
        <View style={s.presenting}>
          <View
            style={[s.dot, following && { backgroundColor: colors.green }]}
          />
          <Text style={s.owner}>{following ? 'Presenting' : 'Paused'}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show participants' : 'Expand stage'}
          onPress={() => setExpanded(v => !v)}
          style={s.expand}
        >
          <Icon name="expand" size={17} />
          <Text style={s.expandText}>{expanded ? 'Collapse' : 'Expand'}</Text>
        </Pressable>
      </View>
      <ScrollView
        ref={stageScroll}
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.chips}>
          {(Object.keys(scenarios) as Scenario[]).map(key => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={scenarios[key].label}
              accessibilityState={{ selected: key === scenario }}
              key={key}
              onPress={() => chooseScenario(key)}
              style={[s.chip, key === scenario && s.chipActive]}
            >
              <Text
                style={[
                  s.chipText,
                  key === scenario && { color: colors.inverse },
                ]}
              >
                {scenarios[key].label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View testID="central-stage" style={s.stage}>
          <View style={s.presenter}>
            <BrandIcon size={35} />
            <View style={{ flex: 1 }}>
              <Text style={s.presenterName}>Room assistant</Text>
              <Text style={s.presenterMeta}>
                Shared workspace · Guided demo
              </Text>
            </View>
            <Text style={s.counter}>{index + 1} / 7</Text>
          </View>
          <View style={s.progress}>
            {steps.map((item, i) => (
              <View
                key={item}
                style={[
                  s.segment,
                  i <= index && { backgroundColor: colors.ink },
                ]}
              />
            ))}
          </View>
          <Text style={s.stageTitle}>{headings[step]}</Text>
          <Text style={s.quote}>{context.quote}</Text>
          {(step === 'brief' || step === 'compare' || step === 'receipt') && (
            <CharacterArt
              scene={
                step === 'brief'
                  ? 'discussion'
                  : step === 'compare'
                  ? 'compare'
                  : 'agreed'
              }
              height={125}
              style={s.storyArt}
            />
          )}
          {step === 'brief' && (
            <>
              <View style={s.facts}>
                <View style={s.fact}>
                  <Text style={s.factLabel}>BUDGET</Text>
                  <Text style={s.factValue}>{context.limit}</Text>
                </View>
                <View style={s.fact}>
                  <Text style={s.factLabel}>TIME WINDOW</Text>
                  <Text style={s.factValue}>{context.time}</Text>
                </View>
              </View>
              <View style={s.notice}>
                <Text style={s.noticeTitle}>Something to resolve</Text>
                <Text style={s.body}>{context.conflict}</Text>
              </View>
              <Button
                testID="run-agent-demo"
                label="Let the room work"
                onPress={() => {
                  setFollowing(true);
                  log(
                    'Agent collected preferences · vegetarian + food + activity',
                  );
                }}
              />
            </>
          )}
          {step === 'search' && (
            <>
              <View style={s.notice}>
                <RoomLoader size={52} label="Searching demo options" />
                <Text style={[s.noticeTitle, { marginTop: 12 }]}>
                  Searching demo options…
                </Text>
                <Text style={s.body}>
                  Checking cost, indoor seating and journey times against the
                  room’s brief.
                </Text>
              </View>
              <Text style={s.caption}>Fixture data · no live venue search</Text>
            </>
          )}
          {step === 'compare' && (
            <>
              {plans.map((plan, i) => (
                <Pressable
                  key={plan}
                  accessibilityRole="button"
                  accessibilityLabel={'Select ' + plan}
                  accessibilityState={{
                    disabled: !context.eligible[i],
                    selected: selected === plan,
                  }}
                  disabled={!context.eligible[i]}
                  onPress={() => setSelected(plan)}
                  style={[
                    s.option,
                    selected === plan && s.optionSelected,
                    !context.eligible[i] && { opacity: 0.78 },
                  ]}
                >
                  <View style={s.optionTop}>
                    <View style={s.optionIcon}>
                      <Icon
                        name={(['coffee', 'rooms', 'people'] as IconName[])[i]}
                        size={20}
                      />
                    </View>
                    <Text style={s.optionTitle}>{plan}</Text>
                    <Text style={s.price}>₹{context.costs[i]}</Text>
                  </View>
                  <Text style={s.optionMeta}>
                    {[18, 24, 31][i]} min travel · Indoor · Vegetarian
                  </Text>
                  <View style={s.optionBottom}>
                    <Text style={s.optionStatus}>
                      {!context.eligible[i]
                        ? 'Over budget · excluded'
                        : selected === plan
                        ? 'Selected for the vote'
                        : 'Available to the room'}
                    </Text>
                    {selected === plan && <Icon name="check" size={16} />}
                  </View>
                </Pressable>
              ))}
              <Text style={s.recommendation}>
                Recommended: {context.recommendation}. {context.reason}
              </Text>
              <Button
                label="Ask the room to vote"
                onPress={() => {
                  setStep('vote');
                  log('Agent opened vote · ' + selected);
                }}
              />
            </>
          )}
          {step === 'vote' && (
            <>
              <Text style={s.body}>
                A demo vote for {selected}. Everyone gets a say before the room
                moves on.
              </Text>
              <View style={s.voteList}>
                {participants.map(person => (
                  <Pressable
                    key={person.id}
                    accessibilityRole="button"
                    accessibilityLabel={
                      votes[person.id]
                        ? person.name + ' voted ✓'
                        : 'Simulate ' + person.name + ' vote'
                    }
                    onPress={() =>
                      setVotes(v => ({ ...v, [person.id]: selected }))
                    }
                    style={s.voteRow}
                  >
                    <Avatar id={person.id} size={38} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.voteName}>{person.name}</Text>
                      <Text style={s.voteMeta}>
                        {votes[person.id]
                          ? 'Vote recorded'
                          : 'Tap to simulate this vote'}
                      </Text>
                    </View>
                    {votes[person.id] ? (
                      <Icon name="check" size={20} />
                    ) : (
                      <View style={s.voteCircle} />
                    )}
                  </Pressable>
                ))}
              </View>
              <Text style={s.voteCount}>
                {Object.keys(votes).length} / 3 votes recorded
              </Text>
              {everyoneVoted && (
                <Button
                  label="Review proposed action"
                  onPress={() => {
                    setStep('approve');
                    log('Votes counted · ' + approvedChoice);
                  }}
                />
              )}
            </>
          )}
          {step === 'approve' && (
            <>
              <View style={s.notice}>
                <Icon name="calendar" size={24} />
                <Text style={[s.noticeTitle, { marginTop: 12 }]}>
                  {approvedChoice}
                </Text>
                <Text style={s.body}>
                  Friday · {context.time}
                  {'\n'}Attendees: You, Priya, Ayaan{'\n'}Action: draft a shared
                  calendar event{'\n'}No payment or reservation
                </Text>
              </View>
              <Text style={s.caption}>
                Demo approval only. No calendar account will be changed.
              </Text>
              <Button
                label="Approve demo calendar action"
                onPress={() => {
                  setStep('execute');
                  setFollowing(true);
                  log('Host approved demo action');
                }}
              />
              <Button
                secondary
                label="Back to comparison"
                onPress={() => {
                  setStep('compare');
                  setVotes({});
                }}
              />
            </>
          )}
          {step === 'execute' && (
            <View style={s.notice}>
              <RoomLoader size={52} label="Preparing event details" />
              <Text style={[s.noticeTitle, { marginTop: 12 }]}>
                Preparing event details…
              </Text>
              <Text style={s.body}>
                The approved plan stays visible while the agent prepares its
                local receipt.
              </Text>
            </View>
          )}
          {step === 'receipt' && (
            <>
              <View style={s.receipt}>
                <View style={s.receiptIcon}>
                  <Icon name="check" size={27} color={colors.inverse} />
                </View>
                <Text style={s.receiptLabel}>DECIDED TOGETHER</Text>
                <Text style={s.receiptTitle}>{approvedChoice}</Text>
                <Text style={s.body}>
                  {context.time}
                  {'\n'}3 simulated votes · host approval recorded{'\n'}Receipt:
                  DEMO-CAL-2048
                </Text>
              </View>
              <Text style={s.caption}>
                Local simulation completed. No event was created in an external
                calendar.
              </Text>
              <Button
                label="Try another decision"
                onPress={() => chooseScenario(scenario)}
              />
            </>
          )}
          <View style={s.partner}>
            <AgoraMark compact />
          </View>
        </View>
        {transcript && (
          <View style={s.log}>
            <Text style={s.logTitle}>Conversation</Text>
            <Text style={s.logCaption}>DEMO TRANSCRIPT</Text>
            <CaptionScroller>
              <View style={s.bubble}>
                <Text style={s.logItem}>{context.quote}</Text>
              </View>
              <View style={s.bubble}>
                <Text style={s.logItem}>Priya: Vegetarian food, please.</Text>
              </View>
              <View style={s.agentBubble}>
                <Text style={s.agentText}>
                  Room assistant: {context.conflict}
                </Text>
              </View>
            </CaptionScroller>
          </View>
        )}
        <View style={s.log}>
          <Text style={s.logTitle}>Room activity</Text>
          {events.slice(-5).map((event, i) => (
            <View key={i} style={s.logRow}>
              <View style={s.logDot} />
              <Text style={s.logItem}>{event}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={s.controlWrap}>
        <View style={s.controls}>
          {controls.map(control => (
            <Pressable
              key={control.label}
              accessibilityRole="button"
              accessibilityLabel={control.label}
              accessibilityState={
                control.active === undefined ? {} : { selected: control.active }
              }
              onPress={control.action}
              style={[
                s.control,
                control.active && s.controlActive,
                control.leave && s.leave,
              ]}
            >
              <Icon
                name={control.icon}
                size={21}
                color={
                  control.leave || control.active ? colors.ink : colors.inverse
                }
              />
              <Text
                style={[
                  s.controlLabel,
                  (control.leave || control.active) && { color: colors.ink },
                ]}
              >
                {control.caption}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  callHead: {
    backgroundColor: colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 19,
    paddingTop: 22,
    paddingBottom: 21,
  },
  back: {
    width: 39,
    height: 39,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.darkLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.inverse,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: -0.5,
  },
  meta: { color: colors.inverseMuted, fontSize: 9, marginTop: 5 },
  demo: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.darkLine,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  demoText: { color: colors.inverseMuted, fontSize: 7, letterSpacing: 1 },
  tiles: {
    backgroundColor: colors.ink,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 15,
    paddingBottom: 18,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  tile: {
    flex: 1,
    height: 146,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.darkLine,
  },
  speaker: { borderColor: colors.inverse, borderWidth: 2 },
  portrait: { width: '100%', height: 102, marginTop: 3 },
  tileBadge: {
    position: 'absolute',
    top: 9,
    left: 9,
    height: 28,
    width: 28,
    borderRadius: 15,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileFooter: { position: 'absolute', left: 10, right: 5, bottom: 10 },
  name: { color: colors.ink, fontSize: 12, fontWeight: '500' },
  avatarLabel: { color: colors.muted, fontSize: 8, marginTop: 4 },
  storyArt: { marginTop: 15, marginBottom: 10 },
  stageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 19,
    paddingTop: 21,
    paddingBottom: 10,
  },
  stageBarText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.4,
    color: colors.ink,
  },
  presenting: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.mutedLight,
  },
  owner: { fontSize: 9, color: colors.muted },
  expand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  expandText: { fontSize: 9, color: colors.muted },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 5, paddingBottom: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 17 },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 99,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { fontSize: 9, color: colors.muted },
  stage: { padding: 21, borderRadius: 30, backgroundColor: colors.surface },
  presenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  presenterName: { fontSize: 13, fontWeight: '500', color: colors.ink },
  presenterMeta: { fontSize: 8, color: colors.muted, marginTop: 4 },
  counter: { fontSize: 10, color: colors.muted },
  progress: { flexDirection: 'row', gap: 5, marginVertical: 22 },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.line,
  },
  stageTitle: {
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -1,
    fontWeight: '500',
    color: colors.ink,
  },
  quote: {
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 12,
    marginBottom: 18,
  },
  facts: { flexDirection: 'row', gap: 8 },
  fact: {
    flex: 1,
    padding: 15,
    borderRadius: 19,
    backgroundColor: colors.surfaceMuted,
  },
  factLabel: { fontSize: 7, letterSpacing: 1.1, color: colors.muted },
  factValue: {
    fontSize: 12,
    color: colors.ink,
    fontWeight: '500',
    marginTop: 8,
  },
  notice: {
    padding: 18,
    borderRadius: 23,
    backgroundColor: colors.canvas,
    marginVertical: 14,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.ink,
    marginBottom: 8,
  },
  body: { fontSize: 12, lineHeight: 20, color: colors.muted },
  button: {
    minHeight: 51,
    borderRadius: 28,
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.inverse,
    flex: 1,
  },
  secondary: { backgroundColor: colors.surfaceMuted },
  caption: { fontSize: 9, lineHeight: 16, color: colors.muted, marginTop: 9 },
  option: {
    borderWidth: 1,
    borderColor: colors.line,
    padding: 15,
    borderRadius: 24,
    marginTop: 10,
  },
  optionSelected: { borderColor: colors.ink, backgroundColor: colors.canvas },
  optionTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  optionIcon: {
    height: 34,
    width: 34,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: { fontSize: 14, fontWeight: '500', color: colors.ink, flex: 1 },
  price: { fontSize: 15, letterSpacing: -0.4, color: colors.ink },
  optionMeta: { fontSize: 10, color: colors.muted, marginTop: 12 },
  optionBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
  },
  optionStatus: { fontSize: 9, color: colors.muted, flex: 1 },
  recommendation: {
    fontSize: 12,
    lineHeight: 20,
    color: colors.ink,
    marginTop: 18,
    paddingHorizontal: 3,
  },
  voteList: { marginTop: 18 },
  voteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  voteName: { fontSize: 14, fontWeight: '500', color: colors.ink },
  voteMeta: { fontSize: 10, color: colors.muted, marginTop: 4 },
  voteCircle: {
    height: 18,
    width: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  voteCount: { fontSize: 12, color: colors.ink, marginTop: 20 },
  receipt: {
    borderRadius: 24,
    padding: 21,
    backgroundColor: colors.canvas,
    gap: 14,
    marginTop: 9,
  },
  receiptIcon: {
    width: 50,
    height: 50,
    borderRadius: 26,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptLabel: { fontSize: 8, letterSpacing: 1.2, color: colors.muted },
  receiptTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.7,
  },
  partner: { marginTop: 20 },
  log: { paddingHorizontal: 5, paddingVertical: 22 },
  logTitle: {
    fontSize: 16,
    letterSpacing: -0.5,
    color: colors.ink,
    fontWeight: '500',
    marginBottom: 11,
  },
  logCaption: {
    fontSize: 8,
    letterSpacing: 1.4,
    color: colors.muted,
    marginBottom: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingVertical: 7,
  },
  logDot: {
    width: 4,
    height: 4,
    borderRadius: 3,
    backgroundColor: colors.mutedLight,
    marginTop: 7,
  },
  logItem: { flex: 1, fontSize: 10, lineHeight: 17, color: colors.muted },
  bubble: {
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    marginBottom: 9,
    maxWidth: '92%',
  },
  agentBubble: {
    padding: 17,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignSelf: 'flex-end',
    maxWidth: '92%',
  },
  agentText: { fontSize: 11, lineHeight: 18, color: colors.inverse },
  controlWrap: {
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.canvas,
  },
  controls: {
    height: 70,
    borderRadius: 40,
    backgroundColor: colors.ink,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  control: {
    width: 52,
    height: 53,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  controlActive: { backgroundColor: colors.canvas },
  controlLabel: { fontSize: 8, color: colors.inverseMuted },
  leave: { backgroundColor: colors.surfaceMuted },
});
