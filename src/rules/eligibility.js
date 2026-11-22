// Operating rule 2 (eligibility): experience level must meet the class level.
// A "Beginner" class is open to everyone; "Advanced" needs Advanced experience.

export const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export function checkEligibility(participantLevel, classLevel) {
  const have = LEVELS.indexOf(participantLevel);
  const need = LEVELS.indexOf(classLevel);

  if (have === -1) {
    return { ok: false, code: 'LEVEL_MISSING', message: 'Choose your experience level.' };
  }
  if (need === -1 || have >= need) {
    return { ok: true, code: 'OK', message: '' };
  }
  return {
    ok: false,
    code: 'LEVEL_TOO_LOW',
    message: `Needs ${classLevel} experience or above. Your level is set to ${participantLevel}.`,
  };
}
