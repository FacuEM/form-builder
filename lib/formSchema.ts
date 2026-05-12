import { z } from 'zod'

const IntroductionSchema = z
  .object({
    enabled: z.boolean().default(false),
    title: z.string().default('Introduction'),
    content: z.unknown().optional().nullable(),
  })
  .optional()

const ChoiceSchema = z.object({
  label: z.string().min(1).describe('Choice label text'),
  weight: z.number().int().default(0).describe('Scoring weight (0 = unscored)'),
})

const QuestionSchema = z.object({
  type: z
    .enum(['TEXT', 'LONG_TEXT', 'CHOICE', 'DROPDOWN', 'MULTI_SELECT', 'MEDIA', 'STATEMENT'])
    .describe('Question type'),
  text: z.string().min(1).describe('Question text shown to respondent'),
  description: z.string().optional().describe('Optional hint/description below the question'),
  required: z.boolean().default(false).describe('Whether an answer is required to advance'),
  textInputType: z
    .enum(['text', 'email', 'phone', 'url'])
    .optional()
    .describe('Input format for TEXT questions'),
  placeholder: z.string().optional().describe('Placeholder for TEXT / LONG_TEXT questions'),
  allowOther: z
    .boolean()
    .optional()
    .describe('Show a free-text "Other" option (CHOICE / MULTI_SELECT only)'),
  scored: z
    .boolean()
    .optional()
    .describe('Enable scoring via choice weights (CHOICE / DROPDOWN only)'),
  mediaTypes: z
    .string()
    .optional()
    .describe('Accepted MIME patterns, comma-separated (MEDIA only). e.g. "image/*,video/*"'),
  choices: z
    .array(ChoiceSchema)
    .optional()
    .describe('Choices in display order (CHOICE / DROPDOWN / MULTI_SELECT)'),
})

const WelcomeSchema = z
  .object({
    enabled: z.boolean().default(true),
    title: z.string().default('Welcome'),
    description: z.string().optional(),
    alertText: z.string().optional(),
  })
  .optional()

const ThankYouSchema = z
  .object({
    enabled: z.boolean().default(true),
    title: z.string().default('Thank you!'),
    message: z.string().default('Your response has been recorded.'),
  })
  .optional()

export const FormSchema = z.object({
  name: z.string().min(1).describe('Form title'),
  introduction: IntroductionSchema,
  welcome: WelcomeSchema,
  thankYou: ThankYouSchema,
  questions: z.array(QuestionSchema).describe('Questions in display order'),
})

export type FormJson = z.infer<typeof FormSchema>
