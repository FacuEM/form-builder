import { FormPlayer } from '@/components/respondent/FormPlayer'
import type { Form } from '@/types'

// Hardcoded fixture — replaced by DB fetch in step 8
const FIXTURE_FORM: Form = {
  id: 'fixture',
  title: 'Demo Form',
  creatorId: 'demo',
  published: true,
  thankYouMessage: 'Thanks for your response.',
  questions: [
    {
      id: 'q1',
      formId: 'fixture',
      order: 0,
      text: 'What is your name?',
      type: 'TEXT',
      required: true,
      choices: [],
    },
    {
      id: 'q2',
      formId: 'fixture',
      order: 1,
      text: 'Tell us a bit about yourself.',
      type: 'LONG_TEXT',
      required: false,
      choices: [],
    },
    {
      id: 'q3',
      formId: 'fixture',
      order: 2,
      text: 'Which best describes your role?',
      type: 'CHOICE',
      required: true,
      choices: [
        { id: 'c1', questionId: 'q3', label: 'Engineer', order: 0 },
        { id: 'c2', questionId: 'q3', label: 'Designer', order: 1 },
        { id: 'c3', questionId: 'q3', label: 'Product', order: 2 },
        { id: 'c4', questionId: 'q3', label: 'Other', order: 3 },
      ],
    },
    {
      id: 'q4',
      formId: 'fixture',
      order: 3,
      text: 'How did you hear about us?',
      type: 'DROPDOWN',
      required: true,
      choices: [
        { id: 'c5', questionId: 'q4', label: 'Twitter / X', order: 0 },
        { id: 'c6', questionId: 'q4', label: 'Word of mouth', order: 1 },
        { id: 'c7', questionId: 'q4', label: 'Search engine', order: 2 },
        { id: 'c8', questionId: 'q4', label: 'Other', order: 3 },
      ],
    },
  ],
}

export default function FormPage() {
  return <FormPlayer form={FIXTURE_FORM} />
}
