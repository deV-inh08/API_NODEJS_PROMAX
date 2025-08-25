import z from 'zod'

export const CreateCommentSchema = z.object({
  body: z.object({
    productId: z.string().trim(),
    content: z.string().trim(),
    parentCommentId: z.string().trim().optional()
  })
})

export type CreateCommentZodType = z.infer<typeof CreateCommentSchema>['body']

export const DeleteCommentSchema = z.object({
  body: z.object({
    commentId: z.string().trim(),
    productId: z.string().trim()
  })
})

export type DeleteComentZodType = z.infer<typeof DeleteCommentSchema>['body']
