// controllers/fileController.js
import fs from "fs";
import path from "path";
import  fileModel  from "../models/fileModel";  // Import the file model


export const writeFileController = async (req) => {
    try {
        const formData = await req.formData();  // Get form data

        const userId = formData.get("userId");  // Extract userId from form data
        const status = formData.get("status");  // Extract status from form data

        if (!userId) {
            return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
        }
        if (!status) {
            return new Response(JSON.stringify({ message: "Status is required" }), { status: 400 });
        }

        const file = formData.get("file");  // Extract main file from form data
        if (!file) {
            return new Response(JSON.stringify({ message: "File is required" }), { status: 400 });
        }

        const dictionaryFile = formData.get("dictionary");  // Extract dictionary file (optional)
        let dictionaryData = null;
        let dictionaryName = null;

        if (dictionaryFile) {
            // Save dictionary file to disk (or process it if needed)
            const dictionaryFilePath = path.join(process.cwd(), "uploads", dictionaryFile.name);
            await fs.promises.writeFile(dictionaryFilePath, Buffer.from(await dictionaryFile.arrayBuffer()));

            dictionaryData = await fs.promises.readFile(dictionaryFilePath, "utf-8");  // Read file contents
            dictionaryName = dictionaryFile.name;
        }

        // Check file size (example: 10MB limit)
        const fileSize = file.size;
        const MAX_SIZE = 10 * 1024 * 1024;  // 10MB
        if (fileSize > MAX_SIZE) {
            return new Response(JSON.stringify({ message: "File is too large. Maximum size allowed is 10MB" }), { status: 400 });
        }

        // Generate a unique file name
        const fileName = `${userId}-${Date.now()}-${file.name}`;
        const filePath = path.join(process.cwd(), "uploads", fileName);

        // Save the main file to disk
        await fs.promises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

        // Read file content as Buffer (for fileData)
        const fileData = await fs.promises.readFile(filePath);

        // Create a file record in the database
        const newFile = await new fileModel({
            userId,  // User who uploaded the file
            fileName,
            fileSize,
            status,  // Store the status sent with the form data
            dictionaryName,  // Store the dictionary file name
            dictionaryFile: dictionaryData,  // Store the dictionary file content (Base64/Plain Text/XML)
            fileData,  // Store the actual file data (Buffer)
            fileMimeType: file.type,  // Optional: MIME type of the uploaded file
        }).save();

        return new Response(
            JSON.stringify({
                success: true,
                message: "File uploaded successfully!",
                file: newFile,
            }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error in file upload:", error);
        return new Response(
            JSON.stringify({ success: false, message: "Error in file upload", error: error.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};

export const readFilesController = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        console.log("userId from query:", userId);

        if (!userId) {
            return new Response(
                JSON.stringify({ message: "User ID is required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Fetch fileName and status fields for the matching user
        const files = await fileModel.find({ userId });

        if (!files) {
            return new Response(
                JSON.stringify({ message: `No files found for userId: ${userId}` }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                files,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error reading files for user:", error);

        return new Response(
            JSON.stringify({
                success: false,
                message: "Error reading files",
                error: error.message,
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
