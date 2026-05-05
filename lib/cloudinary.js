import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function validateUploadFile(file) {
  if (!file) return { valid: false, error: 'No file provided' }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, and PDF files are allowed' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be under 10MB' }
  }
  return { valid: true }
}

export async function uploadToCloudinary(buffer, resourceType, mimeType, folder = 'building-management') {
  const base64 = buffer.toString('base64')

  const dataUri = `data:${mimeType};base64,${base64}`
  
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
      resource_type: resourceType,
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    type: result.resource_type === 'image' ? 'image' : 'pdf',
  }
}

export async function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId)
}

export default cloudinary
