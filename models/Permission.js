import mongoose from 'mongoose'

const PermissionSchema = new mongoose.Schema({
  resource: { type: String, required: true, enum: ['upload', 'expense'] },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grantedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessLevel: { type: String, enum: ['view', 'edit'], default: 'view' },
  createdAt: { type: Date, default: Date.now },
})

PermissionSchema.index({ user: 1, resource: 1 })
PermissionSchema.index({ resourceId: 1 })

export default mongoose.models.Permission || mongoose.model('Permission', PermissionSchema)
