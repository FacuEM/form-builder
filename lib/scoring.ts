import type { Question } from '@/types'

export function isScorable(q: Question): boolean {
  return q.scored && (q.type === 'CHOICE' || q.type === 'DROPDOWN')
}

export function weightForAnswer(question: Question, value: string | undefined): number | null {
  if (!isScorable(question) || value == null) return null
  const choice = question.choices.find((c) => c.label === value)
  return choice ? choice.weight : null
}

export function totalScore(
  questions: Question[],
  answers: { questionId: string; value: string }[],
): number {
  const map = Object.fromEntries(answers.map((a) => [a.questionId, a.value]))
  let total = 0
  for (const q of questions) {
    const w = weightForAnswer(q, map[q.id])
    if (w != null) total += w
  }
  return total
}

export function hasAnyScoredQuestion(questions: Question[]): boolean {
  return questions.some(isScorable)
}
