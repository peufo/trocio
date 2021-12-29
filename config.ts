import dotenv from 'dotenv'
dotenv.config()

const dev = process.env.NODE_ENV == 'development'
const TROCIO_PORT = process.env.TROCIO_PORT || 3000
const WINDOWS_IPV4 = process.env.WINDOWS_IPV4 || 'localhost'

const defaultConfig = {
  TROCIO_OCD_API_KEY: '', // API key provide by https://opencagedata.com/
  TROCIO_ADMIN: '', // Root user mail address
  TROCIO_SECRET_STRING_COOKIE: '', // A secret string for secure cookies
  TROCIO_SMTP_PASS: '', // password of your SMTP server
  TROCIO_SMTP_USER: 'postmaster@trocio.ch',
  TROCIO_SMTP_HOST: 'mail.infomaniak.com',
  TROCIO_SMTP_PORT: 587,
  TROCIO_PORT,
  TROCIO_API_PORT: 5001,
  TROCIO_DB: `mongodb://${WINDOWS_IPV4}:27017/trocio`,
  TROCIO_BACKUP: '../dump',
  TROCIO_DEV: dev,
  VITE_TROCIO_GOOGLE_CLIENT_ID: '',
  TROCIO_GOOGLE_CLIENT_SECRET: '',
}

export default { ...defaultConfig, ...process.env }
