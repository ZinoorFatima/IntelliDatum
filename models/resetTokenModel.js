import mongoose from "mongoose";

const ResetTokenSchema = new mongoose.Schema({

    token:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
    },
    expiresAt:{
        type:Date,
    },
    user_id:{
        type:String,
        require:true
    }
}, {
    timestamps:true
});

const resetToken = mongoose.models.reset_token|| mongoose.model('reset_token', ResetTokenSchema)


export default resetToken