import mongoose from "mongoose";

const usersSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: true,
    trim: true,
  },
  LastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  profilePicture: {
    data: Buffer, // Stores binary image data
    contentType: String, // MIME type (e.g., image/jpeg)
  },
}, {
  timestamps: true,
  // Never serialize the password hash, even if a whole user document ends up in a response
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
  },
});

const User = mongoose.models.User || mongoose.model("User", usersSchema);

export default User;
