import dotenv from 'dotenv'
dotenv.config()

const TROCIO_PORT = process.env.TROCIO_PORT || 3000

const defaultConfig = {
  TROCIO_URL: 'https://troc.io',
  TROCIO_OCD_API_KEY: '', // API key provide by https://opencagedata.com/
  TROCIO_ROOT_USER: '', // Root user email
  TROCIO_SECRET_STRING_COOKIE: '', // A secret string for secure cookies
  TROCIO_SMTP_PASS: '', // password of your SMTP server
  TROCIO_SMTP_USER: 'salut@troc.io',
  TROCIO_SMTP_HOST: 'smtp.hostinger.com',
  TROCIO_SMTP_PORT: 465,
  TROCIO_PORT,
  TROCIO_API_PORT: 5001,
  TROCIO_DB: 'mongodb://localhost:27017/trocio',
  TROCIO_BACKUP: '../dump',
  VITE_TROCIO_GOOGLE_CLIENT_ID: '',
  TROCIO_GOOGLE_CLIENT_SECRET: '',
}

export default { ...defaultConfig, ...process.env }
