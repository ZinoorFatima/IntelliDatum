import { writeFileController } from "../../../../controllers/fileController";
 import { connectDB } from "../../../lib/db";
 import multer from 'multer'; // For handling file uploads
 
 // Set up multer for file upload
 const storage = multer.memoryStorage();
 const upload = multer({ storage: storage });
 
 export async function POST(req) {
     try {
         // Initialize file upload middleware
         await new Promise((resolve, reject) => {
             upload.single('file')(req, {}, (err) => {
                 if (err) {
                     reject(err);
                 }
                 resolve();
             });
         });
 
         await connectDB();
         return writeFileController(req);
     } catch (error) {
         console.error("File upload error from API:", error);
         return new Response(
             JSON.stringify({ success: false, message: "Error during file upload", error: error.message }),
             { status: 500, headers: { "Content-Type": "application/json" } }
         );
     }
 }
 
 export async function GET() {
     return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
         status: 405,
         headers: { "Content-Type": "application/json" },
     });
 }