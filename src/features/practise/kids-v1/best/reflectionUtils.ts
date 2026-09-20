import type { DeepDiveAnswers } from './DeepDive';
import type { ReflectionTag, SavedReflection } from '../../../kids/store';

function deriveTag(feeling?: string): ReflectionTag {
  const f = (feeling ?? '').toLowerCase();
  if (/worr|scar|anxious|nervous/.test(f)) return 'calm';
  if (/ang|frustrat|upset|mad/.test(f)) return 'brave';
  if (/sad|lone|left out|excluded|miss/.test(f)) return 'belonging';
  if (/happy|excit|proud|hopeful|joy/.test(f)) return 'kind';
  return 'try_again';
}

function derivePathLabel(answers: DeepDiveAnswers): string {
  const raw = answers.other ?? answers.story ?? answers.thought ?? '';
  const trimmed = raw.trim();
  if (!trimmed) return 'Something I noticed today.';
  return trimmed.length > 60 ? trimmed.slice(0, 57) + '…' : trimmed;
}

export function buildSavedReflection(answers: DeepDiveAnswers): SavedReflection {
  return {
    id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sourceSessionId: answers.sessionId,
    createdAt: new Date().toISOString(),
    feeling: answers.feeling,
    body: Array.isArray(answers.body) ? answers.body.join(', ') : undefined,
    thought: answers.thought,
    whatHappened: answers.eyes,
    originalStory: answers.story,
    anotherWay: answers.other,
    pathLabel: derivePathLabel(answers),
    tag: deriveTag(answers.feeling),
    favourite: false,
    timesPlayed: 0,
  };
}
