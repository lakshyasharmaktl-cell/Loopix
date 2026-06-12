import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
  
export const user_authentication = (req, res, next) => {
    try {
        const token =  req.headers['x-api-key']  


        if(!token) return res.status(400).send({ status: false, msg: "token is required!" })
            const decoded = jwt.verify(token, process.env.JWT_token)
        if(!decoded) return res.status(400).send({ status: false, msg: "invalid token" })
        next()
    }
    catch (e) { error(e, res) }
}
 

export const user_authorization = (req, res, next) => {
    try {
        const token = req.headers['x-api-key']
        const id = req.params.id;

        

        if (!id) return res.status(400).send({ status: false, msg: "id is required!" })
        if (!token) return res.status(400).send({ status: false, msg: "token is required!" })

        const decoded = jwt.verify(token, process.env.JWT_token)
        if (!decoded.userId == id) return res.status(400).send({ status: false, msg: "invalid token" })

        next()
    }
    catch (err) { error(err, res) }
}