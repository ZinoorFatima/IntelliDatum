import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  fileSize: Number,
  status: {
    type: String,
    default: 'Uploaded',
  },
  dictionaryName: String,
  dictionaryFile: String, // Store as base64 or plain XML string
  fileData: Buffer,        // Store the actual uploaded file
  fileMimeType: String,    // Optional: for serving or validating later
}, { timestamps: true });

export default mongoose.models.File || mongoose.model('File', fileSchema);
