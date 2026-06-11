import mongoose from 'mongoose'
import { validname, validEmail, validpassword } from '../validation/validation.js'
import bcrypt from 'bcrypt'
import {uploadProfileImg} from '../images/upload.js'

export const userSchema = new mongoose.Schema({
    name: {
        type: String, trim: true, required: [true, 'Name is required'], validate: [validname, 'Invalid name']
    },
    email: {
        type: String, trim: true, required: [true, 'email is required'], lowercase: true, validate: [validEmail, 'Invalid email']
    },
    gender: {
        type: String, enum: ['Male', 'Female', 'Other'], trim: true, required: true
    },
    role: {
        type: String, enum: ['user', 'admin'], trim: true, required: true
    },
    profileImg: {
        type: String,
        default: ''
    },

    password: {
        type: String, trim: true, required: [true, 'password is required'],
        validate: [validpassword, 'Invalid password . Please give one lowercase and one uppercase letter with one special character and one number']

    },

    user: {
        isDelete: { type: Boolean, default: false },
        otpExpire: { type: Number, default: 0 },
        isVerify: { type: Boolean, default: false },
        userotp: { type: Number, default: null, trim: true },
    },
})

userSchema.pre('save', async function () {
    if(this.profileImg){
        this.profileImg = await uploadProfileImg(this.profileImg.path)
    }
    this.password = await bcrypt.hash(this.password, 10)
})

export default mongoose.model('usedsrs', userSchema)