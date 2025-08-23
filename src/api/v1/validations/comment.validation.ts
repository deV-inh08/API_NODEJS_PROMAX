import z from 'zod'

export const CreateCommentSchema = z.object({
  body: z.object({
    productId: z.string().trim(),
    content: z.string().trim(),
    parentCommentId: z.string().trim().optional()
  })
})

export type CreateCommentZodType = z.infer<typeof CreateCommentSchema>['body']
