import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const uploadDir = path.join(__dirname, '..', 'uploads', 'professors')

function ensureUploadDir() {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir()
      cb(null, uploadDir)
    } catch (err) {
      cb(err)
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    const safeExt = ext && ext.length <= 10 ? ext : ''
    const random = Math.random().toString(16).slice(2)
    cb(null, `${Date.now()}-${random}${safeExt}`)
  },
})

const fileFilter = (req, file, cb) => {
  if (!file?.mimetype) return cb(null, false)
  if (file.mimetype.startsWith('image/')) return cb(null, true)
  cb(new Error('Only image files are allowed'))
}

export const professorImageUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})
