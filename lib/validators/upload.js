import { z } from 'zod'

export const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim(),
  fileUrl: z.string().min(1, 'File URL is required').trim(),
  type: z.enum(['image', 'pdf', 'document']),
  category: z.enum(['utility', 'gas', 'maintenance', 'others']),
  visibleTo: z.array(z.string()).default([]),
})

export const uploadUpdateSchema = uploadSchema.partial()
