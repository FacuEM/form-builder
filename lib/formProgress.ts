const VERSION = 1
const KEY_PREFIX = 'form_progress_v1__'

export type Stage = 'introduction' | 'welcome' | 'questions' | 'done'

export interface SavedProgress {
  v: number
  index: number
  answers: Record<string, string>
  responseId: string | null
  stage: Stage
  updatedAt: number
}

function key(formId: string): string {
  return `${KEY_PREFIX}${formId}`
}

export function loadProgress(formId: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(key(formId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as SavedProgress
    if (parsed.v !== VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export function saveProgress(formId: string, snapshot: Omit<SavedProgress, 'v' | 'updatedAt'>): void {
  try {
    const payload: SavedProgress = { ...snapshot, v: VERSION, updatedAt: Date.now() }
    localStorage.setItem(key(formId), JSON.stringify(payload))
  } catch {
    // ignore quota / privacy-mode failures
  }
}

export function clearProgress(formId: string): void {
  try {
    localStorage.removeItem(key(formId))
  } catch {
    // ignore
  }
}
