export type QuestionType = 'TEXT' | 'LONG_TEXT' | 'CHOICE' | 'DROPDOWN' | 'STATEMENT' | 'WELCOME'

export interface Choice {
  id: string
  questionId: string
  label: string
  order: number
  weight: number
}

export interface Question {
  id: string
  formId: string
  order: number
  text: string
  description?: string | null
  type: QuestionType
  required: boolean
  scored: boolean
  choices: Choice[]
}

export interface Form {
  id: string
  title: string
  creatorId: string
  published: boolean
  welcomeEnabled: boolean
  welcomeTitle: string
  welcomeDescription?: string | null
  welcomeAlert?: string | null
  thankYouEnabled: boolean
  thankYouTitle: string
  thankYouMessage: string
  questions: Question[]
}
