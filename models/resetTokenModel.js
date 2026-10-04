import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema({

    // bcrypt hash of the emailed 6-digit code; the code itself is never stored
    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
    },
    // MongoDB removes the document once this time has passed (TTL index)
    expiresAt:{
        type:Date,
        index:{ expires: 0 }
    },
    user_id:{
        type:String,
        require:true
    },
    // wrong guesses so far; the code is locked once this reaches 5
    attempts:{
        type:Number,
        default:0
    }
}, {
    timestamps:true
});

const resetToken = mongoose.models.reset_token|| mongoose.model('reset_token', ResetTokenSchema)


export default resetToken