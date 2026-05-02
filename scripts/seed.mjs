import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config({ path: '.env' })

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in .env')
  process.exit(1)
}

// ── Schema Definitions (duplicated for standalone script) ──

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident'], default: 'resident' },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }],
  createdAt: { type: Date, default: Date.now },
})

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
})

const UploadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf', 'document'], required: true },
  category: { type: String, enum: ['utility', 'gas', 'maintenance', 'others'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema)
const Upload = mongoose.models.Upload || mongoose.model('Upload', UploadSchema)

// ── Seed Data ──

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI, { bufferCommands: false })
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Expense.deleteMany({})
    await Upload.deleteMany({})
    console.log('Cleared existing data')

    // Create users
    const hashedAdmin = await bcrypt.hash('admin123', 10)
    const hashedResident1 = await bcrypt.hash('resident123', 10)
    const hashedResident2 = await bcrypt.hash('resident123', 10)

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@building.com',
      password: hashedAdmin,
      role: 'admin',
    })

    const resident1 = await User.create({
      name: 'John Doe',
      email: 'john@building.com',
      password: hashedResident1,
      role: 'resident',
    })

    const resident2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@building.com',
      password: hashedResident2,
      role: 'resident',
    })

    console.log('Created 3 users (admin@building.com / john@building.com / jane@building.com)')
    console.log('Default password for all: check console output above')

    // Create uploads
    const upload1 = await Upload.create({
      title: 'Electricity Bill - January 2026',
      fileUrl: '/uploads/electricity-jan.pdf',
      type: 'pdf',
      category: 'utility',
      uploadedBy: admin._id,
      visibleTo: [resident1._id, resident2._id],
    })

    const upload2 = await Upload.create({
      title: 'Gas Payment Receipt - February 2026',
      fileUrl: '/uploads/gas-feb.pdf',
      type: 'pdf',
      category: 'gas',
      uploadedBy: admin._id,
      visibleTo: [resident1._id],
    })

    const upload3 = await Upload.create({
      title: 'Elevator Maintenance Report',
      fileUrl: '/uploads/elevator-maintenance.pdf',
      type: 'document',
      category: 'maintenance',
      uploadedBy: admin._id,
      visibleTo: [resident1._id, resident2._id],
    })

    console.log('Created 3 uploads')

    // Create expenses
    await Expense.create([
      {
        title: 'Building Insurance',
        amount: 1200,
        category: 'insurance',
        createdBy: admin._id,
        date: new Date('2026-01-15'),
      },
      {
        title: 'Electricity Bill - January',
        amount: 450,
        category: 'utility',
        createdBy: admin._id,
        date: new Date('2026-01-20'),
      },
      {
        title: 'Elevator Repair',
        amount: 800,
        category: 'maintenance',
        createdBy: admin._id,
        date: new Date('2026-02-05'),
      },
      {
        title: 'Water Supply Charges',
        amount: 320,
        category: 'utility',
        createdBy: admin._id,
        date: new Date('2026-02-10'),
      },
      {
        title: 'Gas Payment - February',
        amount: 180,
        category: 'gas',
        createdBy: admin._id,
        date: new Date('2026-02-15'),
      },
      {
        title: 'Lobby Cleaning Service',
        amount: 250,
        category: 'maintenance',
        createdBy: admin._id,
        date: new Date('2026-03-01'),
      },
    ])

    console.log('Created 6 expenses')

    console.log('\nSeeding completed successfully!')
    console.log('\nLogin credentials:')
    console.log('  Admin:    admin@building.com / admin123')
    console.log('  Resident: john@building.com  / resident123')
    console.log('  Resident: jane@building.com  / resident123')

    process.exit(0)
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

seedData()
