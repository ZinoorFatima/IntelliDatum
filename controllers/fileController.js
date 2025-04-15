// controllers/fileController.js
import fs from "fs";
import path from "path";
import  fileModel  from "../models/fileModel";  // Import the file model


export const writeFileController = async (req) => {
    try {
        const formData = await req.formData();

        const userId = formData.get("userId");
        const status = formData.get("status");

        if (!userId) {
            return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
        }
        if (!status) {
            return new Response(JSON.stringify({ message: "Status is required" }), { status: 400 });
        }

        const file = formData.get("file");
        if (!file) {
            return new Response(JSON.stringify({ message: "File is required" }), { status: 400 });
        }

        // Read file as Buffer from memory
        const fileData = Buffer.from(await file.arrayBuffer());
        const fileSize = file.size;
        const MAX_SIZE = 10 * 1024 * 1024;

        if (fileSize > MAX_SIZE) {
            return new Response(JSON.stringify({ message: "File is too large. Max 10MB allowed." }), { status: 400 });
        }

        // Optional: handle dictionary file
        const dictionaryFile = formData.get("dictionary");
        let dictionaryData = null;
        let dictionaryName = null;

        if (dictionaryFile && dictionaryFile.size > 0) {
            dictionaryData = (await dictionaryFile.text()).toString();  // Read as plain text
            dictionaryName = dictionaryFile.name;
        }

        const fileName = `${userId}-${Date.now()}-${file.name}`;

        // Save to MongoDB
        const newFile = await new fileModel({
            userId,
            fileName,
            fileSize,
            status,
            dictionaryName,
            dictionaryFile: dictionaryData,
            fileData,
            fileMimeType: file.type,
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

        // Fetch fileName, status, and dictionary fields for the matching user
        const files = await fileModel.find({ userId }).select("fileName status dictionaryName dictionaryFile");

        if (!files || files.length === 0) {
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

export const updateDictionaryController = async (request) => {
    try {
      console.log("Update Dictionary API called");
  
      const body = await request.json();
      const { fileId, content } = body;
  
      if (!fileId || !content) {
        return new Response(
          JSON.stringify({ success: false, message: "fileId and content are required" }),
          { status: 400 }
        );
      }
  
      const file = await fileModel.findById(fileId);
  
      if (!file) {
        return new Response(
          JSON.stringify({ success: false, message: "File not found" }),
          { status: 404 }
        );
      }
  
      file.dictionaryFile = content;
      await file.save();
  
      return new Response(
        JSON.stringify({ success: true, message: "Dictionary updated successfully" }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in update dictionary:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update dictionary", error: error.message }),
        { status: 500 }
      );
    }
  };