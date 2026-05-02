import mongoose from 'mongoose'

const UploadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf', 'document'], required: true },
  category: { type: String, enum: ['utility', 'gas', 'maintenance', 'others'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Upload || mongoose.model('Upload', UploadSchema)
