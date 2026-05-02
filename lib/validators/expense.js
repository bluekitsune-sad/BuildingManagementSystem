import { z } from 'zod'

const expenseBaseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be under 100 characters').trim(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0').max(1000000, 'Amount exceeds maximum'),
  category: z.enum(['utility', 'gas', 'maintenance', 'others']),
  otherCategory: z.string().max(50, 'Must be under 50 characters').optional().or(z.literal('')),
  date: z.string().or(z.date()).optional(),
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

export const expenseSchema = expenseBaseSchema

export const expenseUpdateSchema = expenseBaseSchema.innerType().partial().superRefine((data, ctx) => {
  if (data.category === 'others' && (!data.otherCategory || !data.otherCategory.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Category name is required when "Others" is selected',
      path: ['otherCategory'],
    })
  }
})
