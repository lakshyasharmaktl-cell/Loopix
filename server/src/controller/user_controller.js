import user_models from '../models/user_models.js'
import bcrypt from 'bcrypt'
import {userotpsend} from '../mail/nodemailer.js'
import jwt from "jsonwebtoken";

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

export const verify_otp = async(req,res)=>{
   try {

        const { id } = req.params;
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({ status: false, msg: "Pls provide otp" })
        }

        const user = await user_models.findById(id);
        if (!user) {
            return res.status(404).json({ status: false, mmsg: "user not found" })
        }

        const { userotp, otpExpire, isVerify } = user?.user;

        if (isVerify) {
            return res.status(409).json({ status: false, msg: "Accont is already verified . pls login..." })
        }

        if (Date.now() > otpExpire) { 
            return res.status(410).json({ status: false, msg: "Otp has a expired . Pls req a new otp.." })
        }

        if (String(otp) != String(userotp)) {
            return res.status(401).json({ status: false, msg: "Invalid OTP" }) 
        }

        await user_models.findOneAndUpdate({ _id: id },
            { $set: { 'user.isVerify': true, 'user.userotp': null, 'user.otpExpire': null } },
        )

        return res.status(200).json({ status: true, msg: "Account verified successfully. pls login." });

    }
    catch(err){console.log(err.message)
    }
}

export const login = async(req,res)=>{
    try {

        const { email, password } = req.body

        if (!email) return res.status(400).send({ status: false, msg: "Email is required..." })
        if (!password) return res.status(400).send({ status: false, msg: "password is required..." })

        const checkuser = await user_models.findOne({ email: email, 'user.isDelete': false, role: "user" })
        if (!checkuser) return res.status(404).send({ status: false, msg: "user not found . pls sign up your account" })

        if (!(checkuser.user.isVerify)) return res.status(400).send({ status: false, msg: "Account not Verify pls Verify Otp" })

        const comparepass = await bcrypt.compare(password, checkuser.password)

        if (!comparepass) return res.status(400).send({ status: false, msg: "wrong password" })

        const token = await jwt.sign({ id: checkuser._id }, process.env.JWT_token, { expiresIn: process.env.Expire_id })
        const DB = {
            name: checkuser.name,
            email: checkuser.email,
            id: checkuser._id,
            token

        }

        res.status(200).send({ status: true, msg: "login successfully", token, DB })
    }
    catch(err){console.log(err.message)}
}

export const friends = async (req, res) => {
try {
const { requestId, action } = req.body;


const currentUserId = req.user.id;

const currentUser = await User.findById(currentUserId);
const senderUser = await User.findById(requestId);

if (!currentUser || !senderUser) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

const requestExists = currentUser.friendRequests.includes(requestId);

if (!requestExists) {
  return res.status(400).json({
    success: false,
    message: "Friend request not found",
  });
}

// ACCEPT REQUEST
if (action === "accept") {

  currentUser.friendRequests =
    currentUser.friendRequests.filter(
      (id) => id.toString() !== requestId
    );

  currentUser.friends.push(requestId);

  senderUser.friends.push(currentUserId);

  await currentUser.save();
  await senderUser.save();

  return res.status(200).json({
    success: true,
    message: "Friend request accepted",
  });
}

// REJECT REQUEST
if (action === "reject") {

  currentUser.friendRequests =
    currentUser.friendRequests.filter(
      (id) => id.toString() !== requestId
    );

  await currentUser.save();

  return res.status(200).json({
    success: true,
    message: "Friend request rejected",
  });
}

return res.status(400).json({
  success: false,
  message: "Invalid action",
});


} catch (err) {
console.log(err.message);


return res.status(500).json({
  success: false,
  message: "Server Error",
});


}
};
