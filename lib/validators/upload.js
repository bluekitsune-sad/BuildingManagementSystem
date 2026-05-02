import { z } from 'zod'

const uploadBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim(),
  category: z.enum(['utility', 'gas', 'maintenance', 'others']),
  otherCategory: z.string().max(50, 'Must be under 50 characters').optional().or(z.literal('')),
  fileUrl: z.string().url('Must be a valid URL'),
  filePublicId: z.string().optional(),
  visibleTo: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  if (data.category === 'others' && (!data.otherCategory || !data.otherCategory.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Category name is required when "Others" is selected',
      path: ['otherCategory'],
    })
  }
})

export const uploadSchema = uploadBaseSchema

export const uploadUpdateSchema = uploadBaseSchema.innerType().partial().superRefine((data, ctx) => {
  if (data.category === 'others' && (!data.otherCategory || !data.otherCategory.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Category name is required when "Others" is selected',
      path: ['otherCategory'],
    })
  }
})
