export type QuestionType = 'TEXT' | 'LONG_TEXT' | 'CHOICE' | 'DROPDOWN' | 'MULTI_SELECT' | 'STATEMENT' | 'WELCOME' | 'MEDIA'

export type TextInputType = 'text' | 'email' | 'phone' | 'url'

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
  textInputType?: TextInputType | null
  placeholder?: string | null
  allowOther?: boolean
  mediaTypes?: string | null
}

export interface Form {
  id: string
  title: string
  creatorId: string
  published: boolean
  closed: boolean
  welcomeEnabled: boolean
  welcomeTitle: string
  welcomeDescription?: string | null
  welcomeAlert?: string | null
  thankYouEnabled: boolean
  thankYouTitle: string
  thankYouMessage: string
  questions: Question[]
}
