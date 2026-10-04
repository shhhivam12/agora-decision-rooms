export type DemoPhase = 'ready' | 'listening' | 'organizing' | 'searching' | 'options' | 'approval' | 'executing' | 'verified';

export interface OutingOption {
  id: string; title: string; place: string; emoji: string;
  price: string; travel: string; fit: number; accent: string;
}

export const participants = [
  { id: 'you', name: 'You', initial: 'S', color: '#242523' },
  { id: 'priya', name: 'Priya', initial: 'P', color: '#697066' },
  { id: 'ayaan', name: 'Ayaan', initial: 'A', color: '#92998F' },
];

export const constraints = [
  { id: 'budget', owner: 'Ayaan', icon: '₹', value: 'Under ₹900 each', accent: '#E4E9E1' },
  { id: 'food', owner: 'Priya', icon: '🥗', value: 'Vegetarian-friendly', accent: '#E4E9E1' },
  { id: 'time', owner: 'You', icon: '◷', value: 'Wrap up by 10 PM', accent: '#E4E9E1' },
  { id: 'vibe', owner: 'Everyone', icon: '✦', value: 'Food + an activity', accent: '#E4E9E1' },
];

export const outingOptions: OutingOption[] = [
  { id: 'bowling-bites', title: 'Bowling + bites', place: 'Indiranagar Social', emoji: '🎳', price: '₹760 pp', travel: '18 min', fit: 94, accent: '#E4E9E1' },
  { id: 'paint-pizza', title: 'Paint + pizza', place: 'The Art Gully', emoji: '🎨', price: '₹890 pp', travel: '24 min', fit: 88, accent: '#E4E9E1' },
  { id: 'games-cafe', title: 'Games café', place: 'Dice & Dine', emoji: '🎲', price: '₹620 pp', travel: '31 min', fit: 82, accent: '#E4E9E1' },
];

export const activityByPhase: Record<DemoPhase, string[]> = {
  ready: [], listening: ['Caught Ayaan’s budget limit'],
  organizing: ['Built a shared brief from 4 constraints'],
  searching: ['Searching cost, travel time and open hours'],
  options: ['Searched 18 places', 'Found 3 complete matches'],
  approval: ['The room voted for Bowling + bites'],
  executing: ['Creating the shared calendar event'],
  verified: ['Calendar event verified for all 3 people'],
};

export function getWinningOption(votes: string[]): OutingOption | null {
  if (!votes.length) return null;
  const counts = votes.reduce<Record<string, number>>((all, id) => {
    all[id] = (all[id] ?? 0) + 1;
    return all;
  }, {});
  const winner = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  return outingOptions.find(option => option.id === winner) ?? null;
}
