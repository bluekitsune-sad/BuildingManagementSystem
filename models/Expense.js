import mongoose from 'mongoose'

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
})

ExpenseSchema.index({ date: -1 })
ExpenseSchema.index({ category: 1 })

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
