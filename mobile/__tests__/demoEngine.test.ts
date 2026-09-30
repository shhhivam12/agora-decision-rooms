import { getWinningOption } from '../src/demo/demoEngine';

describe('group decision engine', () => {
  it('selects the option with the most votes', () => {
    expect(getWinningOption(['bowling-bites', 'games-cafe', 'bowling-bites'])?.id).toBe('bowling-bites');
  });
  it('returns no winner before voting', () => expect(getWinningOption([])).toBeNull());
  it('breaks a tie deterministically', () => {
    expect(getWinningOption(['games-cafe', 'bowling-bites'])?.id).toBe('bowling-bites');
  });
});
