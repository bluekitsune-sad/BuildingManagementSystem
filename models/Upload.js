import mongoose from 'mongoose'

const UploadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  filePublicId: { type: String },
  type: { type: String, enum: ['image', 'pdf'], required: true },
  category: { type: String, enum: ['utility', 'gas', 'maintenance', 'others'], required: true },
  otherCategory: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

UploadSchema.pre('save', function (next) {
  this.updatedAt = Date.now()
  next()
})

export default mongoose.models.Upload || mongoose.model('Upload', UploadSchema)
