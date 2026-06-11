import {} from '../models/user_models.js'

export const register = async(req,res) =>{
     try {
        const data = req.body
        const { email } = data

        const randomotp = Math.floor(1000 + Math.random() * 9000)

        const expiryTime = Date.now() + 5 * 60 * 1000;

        const checkuser = await user_models.findOneAndUpdate({ email: email },
            { $set: 
                { 'user.userotp': randomotp, 'user.otpExpire': expiryTime } }
        )

        if (checkuser) {
            const { isverify, isDelete } = checkuser.user    

            if (isDelete) return res.status(200).send({ status: true, msg: "Your Account is delete" })
            if (isverify) return res.status(200).send({ status: true, msg: "Account verify . Pls login this account" })

            if (!isverify) {
                userotpsend(checkuser.email, checkuser.name, randomotp)
                return res.status(200).send({ status: true, msg: "resend otp pls...", id: checkuser._id, name: checkuser.name, email: checkuser.email })
            }
        }
        data.role = "user"
        data.user = { otpExpire: expiryTime, userotp: randomotp }

        const DB = await user_models.create(data)
        userotpsend(data.email, data.name, randomotp)

        return res.status(201).send({
            status: true, msg: "Successful create user",
            id: DB._id, name: DB.name, email: DB.email
        })

    }
    catch(err){console.log(err.message)}
}