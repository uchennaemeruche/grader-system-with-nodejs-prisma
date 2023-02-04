import { AppServer } from './app'
import dotenv from 'dotenv'

dotenv.config()

const PORT = Number(process.env.PORT) | 4000
const app = new AppServer(PORT, 'localhost')

app.createServer().then(app.start)
