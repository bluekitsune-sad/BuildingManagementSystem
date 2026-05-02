import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0, max: 1000000 },
  category: { type: String, required: true, enum: ['utility', 'gas', 'maintenance', 'others'], trim: true },
  otherCategory: { type: String, trim: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
})

ExpenseSchema.index({ date: -1 })
ExpenseSchema.index({ category: 1 })

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
