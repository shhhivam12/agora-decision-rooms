export const characterProfiles: Record<
  string,
  { name: string; role: string; shortRole: string; line: string }
> = {
  priya: {
    name: 'Priya',
    role: 'The planner',
    shortRole: 'Planner',
    line: 'Has a plan for the plan.',
  },
  ayaan: {
    name: 'Ayaan',
    role: 'Budget detective',
    shortRole: 'Budget sleuth',
    line: 'Checks the maths. Twice.',
  },
  maya: {
    name: 'Maya',
    role: 'The idea spark',
    shortRole: 'Idea spark',
    line: 'One idea? Make it seven.',
  },
  kabir: {
    name: 'Kabir',
    role: 'The peacemaker',
    shortRole: 'Peacemaker',
    line: 'Turns “maybe” into “let’s go”.',
  },
  you: {
    name: 'You',
    role: 'Room host',
    shortRole: 'Host',
    line: 'Bring the people. Start the plan.',
  },
};
export const crewIds = ['priya', 'ayaan', 'maya', 'kabir'];
