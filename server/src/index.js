import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import routes from './routes/routes.js'

dotenv.config() 

const app = express()
const PORT = 1234

 app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MongoDBUrl)
    .then(() => console.log('MongoDB connected ...'))
    .catch((err) => console.log('MongoDB error =>', err.message))

app.use('/', routes)

app.listen(PORT, () => console.log('server is running', PORT))