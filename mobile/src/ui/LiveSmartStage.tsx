import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import {
  AppText as Text,
  AppTextInput as TextInput,
  AppPressable as Pressable,
  useLanguage,
} from '../i18n';
import type { VoiceRoom } from '../VoiceRoomApi';
import type {
  MeetingPlan,
  MemberPreference,
  PlanningTool,
  StageCommand,
} from '../liveStageTypes';
import { RoomLoader } from './RoomLoader';
import { colors } from './theme';

const tools: { id: PlanningTool; label: string; hint: string }[] = [
  { id: 'venues', label: 'Find venues', hint: 'Places for your group' },
  {
    id: 'reservations',
    label: 'Reservations & hours',
    hint: 'Check a selected venue',
  },
  { id: 'weather', label: 'Rain check', hint: 'Forecast for your plan' },
  {
    id: 'travel',
    label: 'Travel time',
    hint: 'Driving from your meeting town',
  },
];
function Button({
  label,
  onPress,
  disabled = false,
  dark = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={[s.button, dark && s.darkButton, disabled && s.disabled]}
    >
      <Text style={[s.buttonText, dark && s.darkText]}>{label}</Text>
    </Pressable>
  );
}
function SourceLink({ url, label }: { url?: string | null; label: string }) {
  const { t } = useLanguage();
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => Linking.openURL(url)}
    >
      <Text translate={false} style={s.link}>
        {t(label)} ↗
      </Text>
    </Pressable>
  );
}

export function LiveSmartStage({
  room,
  ownUid,
  command,
  busy,
  error,
  onNavigate,
}: {
  room: VoiceRoom;
  ownUid: string;
  command: (value: StageCommand) => Promise<boolean>;
  busy: boolean;
  error: string | null;
  onNavigate?: () => void;
}) {
  const stage = room.stage;
  const { t, language } = useLanguage();
  const [editingPlan, setEditingPlan] = useState(false);
  const [draft, setDraft] = useState<MeetingPlan | null>(null);
  const [editingPreference, setEditingPreference] = useState(false);
  const [preference, setPreference] = useState<MemberPreference>({});
  const [budget, setBudget] = useState('');
  const [request, setRequest] = useState('');
  const [typing, setTyping] = useState(false);
  const [formError, setFormError] = useState('');
  const [panel, setPanel] = useState<
    'plan' | 'checks' | 'options' | 'decision'
  >('checks');
  const [activeCheck, setActiveCheck] = useState<PlanningTool>('weather');
  const latestCheck = Object.values(stage?.checks || {})
    .filter(c => !!c)
    .sort((a, b) => b!.checkedAt - a!.checkedAt)[0];
  const latestKey = latestCheck
    ? `${latestCheck.tool}:${latestCheck.checkedAt}:${latestCheck.status}`
    : '';
  const latestTool = latestCheck?.tool;
  useEffect(() => {
    if (latestTool) setActiveCheck(latestTool);
  }, [latestKey, latestTool]);
  useEffect(() => {
    onNavigate?.();
  }, [panel, latestKey, onNavigate]);
  if (!stage) return null;
  const host = room.hostUid === ownUid;
  const selected = stage.venues.find(v => v.id === stage.selectedId);
  const checking = Object.values(stage.checks).some(
    c => c?.status === 'checking',
  );
  const supporters = room.members.filter(
    m => stage.votes[m.uid] === stage.selectedId && stage.selectedId,
  );
  const consensus = !!selected && supporters.length === room.members.length;
  const lowestBudget = Math.min(
    ...Object.values(stage.preferences).map(p => p.budget || Infinity),
  );
  const planForm = draft || stage.plan;
  function editPlan() {
    setPanel('plan');
    setDraft({ ...stage!.plan });
    setFormError('');
    setEditingPlan(true);
  }
  async function savePlan() {
    if (!planForm.city.trim()) {
      setFormError('Enter the city for your plan.');
      return;
    }
    if (planForm.date && !/^\d{4}-\d{2}-\d{2}$/.test(planForm.date)) {
      setFormError('Use YYYY-MM-DD for the date.');
      return;
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(planForm.time)) {
      setFormError('Use HH:MM in 24-hour time.');
      return;
    }
    if (await command({ action: 'plan', plan: planForm })) {
      setEditingPlan(false);
      setDraft(null);
      setFormError('');
    }
  }
  function editPreference() {
    const current = stage!.preferences[ownUid] || {};
    setPreference({ ...current });
    setBudget(current.budget ? String(current.budget) : '');
    setEditingPreference(true);
  }
  async function savePreference() {
    const value = Number(budget);
    if (budget && (!Number.isInteger(value) || value < 1 || value > 100000)) {
      setFormError('Enter a budget between ₹1 and ₹100,000.');
      return;
    }
    if (
      await command({
        action: 'preference',
        preference: { ...preference, budget: budget ? value : null },
      })
    ) {
      setEditingPreference(false);
      setFormError('');
    }
  }
  async function sendRequest() {
    if (
      request.trim() &&
      (await command({ action: 'request', text: request.trim() }))
    ) {
      setRequest('');
      setTyping(false);
      onNavigate?.();
    }
  }
  return (
    <View style={s.stage}>
      <View style={s.top}>
        <View style={s.heading}>
          <Text style={s.title}>Live Smart Stage</Text>
        </View>
        <View style={s.badge}>
          <Text style={s.badgeText}>SHARED</Text>
        </View>
      </View>
      <View style={s.planSummary}>
        <Text translate={false} style={s.name}>
          {stage.plan.city || t('City needed')} ·{' '}
          {stage.plan.date || t('Today')} · {stage.plan.time}
        </Text>
        {!!selected && (
          <Text translate={false} numberOfLines={1} style={s.small}>
            {t('Proposed')}: {selected.name}
          </Text>
        )}
      </View>
      <View style={s.steps}>
        {(['plan', 'checks', 'options', 'decision'] as const).map((item, i) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={['Plan', 'Checks', 'Options', 'Decision'][i]}
            accessibilityState={{ selected: panel === item }}
            onPress={() => {
              setPanel(item);
              setFormError('');
            }}
            style={[s.panelTab, panel === item && s.darkButton]}
          >
            <Text style={[s.step, panel === item && s.darkText]}>
              {['Plan', 'Checks', 'Options', 'Decision'][i]}
            </Text>
          </Pressable>
        ))}
      </View>
      {panel === 'plan' && (
        <>
          <View style={s.section}>
            <Text style={s.label}>THE GROUP PLAN</Text>
            {!!stage.suggestedPlan && (
              <View style={s.preference}>
                <Text translate={false} style={s.small}>
                  {stage.suggestedPlan.name} · {stage.suggestedPlan.plan.city} ·{' '}
                  {stage.suggestedPlan.plan.date}
                </Text>
                {host ? (
                  <Button
                    label="Apply suggested details"
                    disabled={busy}
                    onPress={() =>
                      command({
                        action: 'plan',
                        plan: stage.suggestedPlan!.plan,
                      })
                    }
                  />
                ) : (
                  <Text style={s.small}>
                    Waiting for the host to apply these details.
                  </Text>
                )}
              </View>
            )}
            {stage.plan.city ? (
              <>
                <Text translate={false} style={s.subtitle}>
                  {stage.plan.city}
                </Text>
                <Text translate={false} style={s.body}>
                  {stage.plan.date || t('Today')} · {stage.plan.time} ·{' '}
                  {room.members.length}{' '}
                  {t(room.members.length === 1 ? 'person' : 'people')}
                </Text>
                <Text translate={false} style={s.small}>
                  {t('Meeting town centre')}:{' '}
                  {stage.plan.origin || t('Not set')}
                </Text>
              </>
            ) : (
              <Text style={s.body}>
                Set a city so the assistant can check real planning details.
              </Text>
            )}
            {host && !editingPlan && (
              <Button
                label={
                  stage.plan.city
                    ? 'Edit meeting details'
                    : 'Set meeting details'
                }
                onPress={editPlan}
                disabled={busy}
              />
            )}
            {!host && (
              <Text style={s.small}>
                The host sets the city, date and meeting town.
              </Text>
            )}
            {editingPlan && (
              <View style={s.form}>
                {(['city', 'origin', 'date', 'time'] as const).map(
                  (field, i) => {
                    const labels = [
                      'City for your outing',
                      'Meeting town (centre)',
                      'Date (YYYY-MM-DD)',
                      'Time (HH:MM)',
                    ];
                    return (
                      <View key={field}>
                        <Text style={s.small}>{labels[i]}</Text>
                        <TextInput
                          accessibilityLabel={labels[i]}
                          value={planForm[field]}
                          onChangeText={value =>
                            setDraft({ ...planForm, [field]: value })
                          }
                          maxLength={
                            field === 'date' ? 10 : field === 'time' ? 5 : 80
                          }
                          placeholder={
                            [
                              'e.g. Bengaluru',
                              'e.g. Bengaluru',
                              'Leave blank for today',
                              '18:00',
                            ][i]
                          }
                          style={s.input}
                        />
                      </View>
                    );
                  },
                )}
                <Text style={s.small}>
                  Travel starts at the named town centre. Forecasts cover the
                  next seven days.
                </Text>
                <View style={s.row}>
                  <Button
                    label="Save meeting details"
                    dark
                    onPress={savePlan}
                    disabled={busy}
                  />
                  <Button
                    label="Cancel"
                    onPress={() => {
                      setEditingPlan(false);
                      setFormError('');
                    }}
                  />
                </View>
              </View>
            )}
          </View>
          <View style={s.section}>
            <Text style={s.label}>EVERYONE'S PREFERENCES</Text>
            {room.members.map(member => {
              const p = stage.preferences[member.uid];
              const bits = [
                p?.budget ? `₹${p.budget}` : '',
                p?.diet ? t(p.diet) : '',
                p?.setting ? t(p.setting) : '',
                p?.note,
              ].filter(Boolean);
              return (
                <View style={s.preference} key={member.uid}>
                  <Text translate={false} style={s.name}>
                    {member.name}
                  </Text>
                  <Text translate={false} style={s.small}>
                    {bits.join(' · ') || t('Listening for preferences…')}
                  </Text>
                </View>
              );
            })}
            {Number.isFinite(lowestBudget) && (
              <Text translate={false} style={s.small}>
                {t('Group budget ceiling')}: ₹{lowestBudget} {t('per person')} ·{' '}
                {t('Venue prices unverified')}
              </Text>
            )}
            {!editingPreference ? (
              <Button
                label="Edit my preferences"
                onPress={editPreference}
                disabled={busy}
              />
            ) : (
              <View style={s.form}>
                <Text style={s.small}>Your budget per person (₹)</Text>
                <TextInput
                  accessibilityLabel="Your budget per person"
                  style={s.input}
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="e.g. 700"
                />
                <View style={s.row}>
                  {(['Vegetarian', 'No vegetarian requirement'] as const).map(
                    diet => (
                      <Button
                        key={diet}
                        label={diet}
                        dark={preference.diet === diet}
                        onPress={() =>
                          setPreference({
                            ...preference,
                            diet: preference.diet === diet ? '' : diet,
                          })
                        }
                      />
                    ),
                  )}
                </View>
                <View style={s.row}>
                  {(['Indoors preferred', 'Outdoors preferred'] as const).map(
                    setting => (
                      <Button
                        key={setting}
                        label={setting}
                        dark={preference.setting === setting}
                        onPress={() =>
                          setPreference({
                            ...preference,
                            setting:
                              preference.setting === setting ? '' : setting,
                          })
                        }
                      />
                    ),
                  )}
                </View>
                <TextInput
                  accessibilityLabel="Other planning needs"
                  style={s.input}
                  value={preference.note || ''}
                  maxLength={160}
                  placeholder="Other planning needs"
                  onChangeText={note => setPreference({ ...preference, note })}
                />
                <View style={s.row}>
                  <Button
                    label="Save my preferences"
                    dark
                    onPress={savePreference}
                    disabled={busy}
                  />
                  <Button
                    label="Cancel"
                    onPress={() => {
                      setEditingPreference(false);
                      setFormError('');
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        </>
      )}
      {panel === 'checks' && (
        <>
          <View style={s.section}>
            <View style={s.toolGrid}>
              {tools.map(tool => (
                <Pressable
                  key={tool.id}
                  accessibilityRole="button"
                  accessibilityLabel={tool.label}
                  onPress={() => setActiveCheck(tool.id)}
                  style={[s.tool, activeCheck === tool.id && s.selected]}
                >
                  <Text numberOfLines={1} style={s.toolTitle}>
                    {tool.label}
                  </Text>
                  <Text numberOfLines={1} style={s.small}>
                    {stage.checks[tool.id]
                      ? t(
                          stage.checks[tool.id]!.status === 'ready'
                            ? 'Ready'
                            : stage.checks[tool.id]!.status === 'error'
                            ? 'Needs attention'
                            : 'Checking…',
                        )
                      : tool.hint}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Button
              label={
                stage.checks[activeCheck]?.status === 'error'
                  ? 'Retry selected check'
                  : 'Run selected check'
              }
              dark
              disabled={
                busy || stage.checks[activeCheck]?.status === 'checking'
              }
              onPress={() => command({ action: 'check', tool: activeCheck })}
            />
            {tools.map(tool => {
              const check = stage.checks[tool.id];
              if (!check || tool.id !== activeCheck) return null;
              return (
                <View
                  key={tool.id}
                  style={[s.check, check.status === 'error' && s.checkError]}
                >
                  <View style={s.row}>
                    <Text style={s.toolTitle}>{tool.label}</Text>
                    {check.status === 'checking' && (
                      <RoomLoader size={22} label="Checking planning source" />
                    )}
                  </View>
                  <Text style={s.body}>
                    {language === 'hi' && check.summaryHi
                      ? check.summaryHi
                      : check.summary}
                  </Text>
                  {check.detail && (
                    <Text translate={false} style={s.small}>
                      {language === 'hi' && check.detailHi
                        ? check.detailHi
                        : check.detail}
                    </Text>
                  )}
                  {check.status !== 'checking' && (
                    <Text translate={false} style={s.meta}>
                      {check.provider || t('Check unavailable')} ·{' '}
                      {new Date(check.checkedAt * 1000).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  )}
                  <View style={s.row}>
                    <SourceLink url={check.source} label="View source" />
                    <SourceLink url={check.website} label="Venue website" />
                  </View>
                  {!!check.phone && (
                    <Text translate={false} selectable style={s.small}>
                      {t('Venue phone')}: {check.phone}
                    </Text>
                  )}
                  {check.status === 'error' && (
                    <>
                      {!!check.needs?.some(need => need !== 'venue') &&
                        (host ? (
                          <Button
                            label="Fix meeting details"
                            onPress={editPlan}
                            disabled={busy}
                          />
                        ) : (
                          <Text style={s.small}>
                            Ask the host to update the meeting details.
                          </Text>
                        ))}
                      {check.needs?.includes('venue') && (
                        <Button
                          label="Choose a venue"
                          onPress={() => setPanel('options')}
                        />
                      )}
                      {!!stage.pendingChecks?.[tool.id] && (
                        <Text style={s.small}>
                          This check will retry when the missing details are
                          supplied. You can say them or enter them in Plan.
                        </Text>
                      )}
                      {!!check.previousResult && (
                        <View style={s.preference}>
                          <Text style={s.name}>
                            Previous result · not a fresh check
                          </Text>
                          <Text translate={false} style={s.small}>
                            {language === 'hi' && check.previousResult.summaryHi
                              ? check.previousResult.summaryHi
                              : check.previousResult.summary}
                          </Text>
                          <Text translate={false} style={s.meta}>
                            {new Date(
                              check.previousResult.checkedAt * 1000,
                            ).toLocaleTimeString()}{' '}
                            · {check.previousResult.provider}
                          </Text>
                          <SourceLink
                            url={check.previousResult.source}
                            label="View source"
                          />
                        </View>
                      )}
                    </>
                  )}
                </View>
              );
            })}
            {!typing ? (
              <Button label="Type a request" onPress={() => setTyping(true)} />
            ) : (
              <View style={s.requestRow}>
                <TextInput
                  style={[s.input, s.requestInput]}
                  accessibilityLabel="Ask the planning assistant"
                  placeholder="e.g. Delhi, tomorrow"
                  value={request}
                  maxLength={1500}
                  onChangeText={setRequest}
                  onSubmitEditing={sendRequest}
                />
                <Button
                  label="Ask the assistant"
                  onPress={sendRequest}
                  disabled={busy || !request.trim()}
                  dark
                />
              </View>
            )}
            {stage.voiceDelivery === 'failed' && (
              <Text style={s.small}>
                The result is on the Stage. The spoken update could not be
                delivered.
              </Text>
            )}
            {!stage.checks[activeCheck] && (
              <Text style={s.small}>
                Speak or type your request. If speech is missed, typed requests
                use the same shared checks.
              </Text>
            )}
          </View>
        </>
      )}
      {panel === 'options' && (
        <>
          <View style={s.section}>
            <Text style={s.label}>COMPARE & PROPOSE</Text>
            {!stage.venues.length ? (
              <>
                <Text style={s.body}>
                  Find venues to build your group's shortlist.
                </Text>
                <Button
                  label="Find venues"
                  dark
                  disabled={busy}
                  onPress={() => {
                    setPanel('checks');
                    setActiveCheck('venues');
                    command({ action: 'check', tool: 'venues' });
                  }}
                />
              </>
            ) : (
              stage.venues.map(venue => (
                <View
                  key={venue.id}
                  style={[s.venue, venue.id === stage.selectedId && s.selected]}
                >
                  <View style={s.row}>
                    <Text translate={false} style={s.venueTitle}>
                      {venue.name}
                    </Text>
                    {venue.id === stage.selectedId && (
                      <Text style={s.small}>Proposed</Text>
                    )}
                  </View>
                  <Text translate={false} style={s.small}>
                    {t(venue.kind === 'cafe' ? 'Cafe' : 'Restaurant')} ·{' '}
                    {t(
                      venue.vegetarian === 'yes' || venue.vegetarian === 'only'
                        ? 'Vegetarian options listed'
                        : 'Dietary options unverified',
                    )}
                  </Text>
                  <Text style={s.small}>
                    Price and indoor seating unverified
                  </Text>
                  <View style={s.row}>
                    <Button
                      label={
                        venue.id === stage.selectedId
                          ? 'Proposed venue'
                          : 'Propose this venue'
                      }
                      onPress={() =>
                        command({ action: 'select', venueId: venue.id })
                      }
                      disabled={busy || venue.id === stage.selectedId}
                    />
                    <SourceLink url={venue.source} label="Venue listing" />
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      )}
      {panel === 'decision' && !selected && (
        <Text style={s.body}>
          Choose a venue in Options, then everyone can vote here.
        </Text>
      )}
      {panel === 'decision' && selected && (
        <View style={s.decision}>
          <Text style={s.label}>YOUR PEOPLE. YOUR DECISION.</Text>
          <Text translate={false} style={s.subtitle}>
            {selected.name}
          </Text>
          <Text style={s.body}>
            Each participant votes from their own device. New details reset the
            votes.
          </Text>
          {room.members.map(member => (
            <View style={s.voteRow} key={member.uid}>
              <Text translate={false} style={s.name}>
                {member.name}
              </Text>
              <Text style={s.small}>
                {stage.votes[member.uid] === selected.id
                  ? 'Supports plan'
                  : stage.votes[member.uid] === 'changes'
                  ? 'Needs changes'
                  : 'Waiting for vote'}
              </Text>
            </View>
          ))}
          <View style={s.row}>
            <Button
              label="Support this plan"
              dark
              disabled={busy || checking || stage.votes[ownUid] === selected.id}
              onPress={() =>
                command({
                  action: 'vote',
                  support: true,
                  version: stage.decisionVersion,
                })
              }
            />
            <Button
              label="Needs changes"
              disabled={busy || checking}
              onPress={() =>
                command({
                  action: 'vote',
                  support: false,
                  version: stage.decisionVersion,
                })
              }
            />
          </View>
          {host && !stage.approved && (
            <Button
              label="Confirm group plan"
              dark
              disabled={busy || checking || !consensus}
              onPress={() =>
                command({ action: 'approve', version: stage.decisionVersion })
              }
            />
          )}
          {!consensus && (
            <Text style={s.small}>
              Everyone must support the proposed venue before the host confirms.
            </Text>
          )}
          {stage.approved && (
            <View style={s.receipt}>
              <Text style={s.subtitle}>Group plan confirmed</Text>
              <Text translate={false} selectable style={s.small}>
                {stage.approved.id}
              </Text>
              <Text style={s.body}>
                No booking has been made. Confirm availability and prices with
                the venue.
              </Text>
              <SourceLink
                url={
                  stage.approved.venue.website || stage.approved.venue.source
                }
                label="Contact the venue"
              />
            </View>
          )}
        </View>
      )}
      {stage.notice !== stage.checks[activeCheck]?.summary && (
        <Text accessibilityLiveRegion="polite" style={s.notice}>
          {stage.notice}
        </Text>
      )}
      {!!(error || formError) && (
        <Text accessibilityLiveRegion="assertive" style={s.error}>
          {error || formError}
        </Text>
      )}
      {panel === 'checks' && (
        <Text style={s.meta}>
          Results may be cached for up to three minutes.
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  stage: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 10,
  },
  top: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  heading: { flex: 1 },
  kicker: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.3,
    lineHeight: 16,
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  badge: {
    borderRadius: 30,
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeText: {
    color: colors.inverse,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    padding: 4,
    gap: 3,
  },
  panelTab: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 9,
  },
  planSummary: { gap: 4 },
  requestRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  requestInput: { flex: 1, minWidth: 0 },
  step: { color: colors.ink, fontSize: 11, fontWeight: '600' },
  body: { color: colors.inkSoft, fontSize: 13, lineHeight: 20 },
  small: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  section: {
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 16,
    gap: 10,
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 25,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' },
  button: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 13,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 17,
  },
  darkButton: { backgroundColor: colors.ink, borderColor: colors.ink },
  darkText: { color: colors.inverse },
  disabled: { opacity: 0.45 },
  form: { gap: 10 },
  input: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.canvas,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 13,
  },
  preference: {
    backgroundColor: colors.canvas,
    borderRadius: 16,
    padding: 11,
    gap: 2,
  },
  name: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  toolGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tool: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 18,
    padding: 10,
    gap: 3,
  },
  toolTitle: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  check: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 19,
    padding: 13,
    gap: 8,
  },
  checkError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  link: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '600',
    textDecorationLine: 'underline',
    paddingVertical: 4,
  },
  meta: { color: colors.muted, fontSize: 9, lineHeight: 15 },
  venue: {
    padding: 13,
    gap: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
  },
  selected: { borderColor: colors.ink, backgroundColor: colors.canvas },
  venueTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  decision: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 21,
    padding: 14,
    gap: 12,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receipt: {
    borderTopWidth: 1,
    borderColor: colors.line,
    paddingTop: 14,
    gap: 7,
  },
  notice: { color: colors.muted, fontSize: 11, lineHeight: 18 },
  error: { color: colors.danger, fontSize: 12, lineHeight: 19 },
});
