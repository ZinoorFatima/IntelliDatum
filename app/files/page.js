"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/auth";
import Swal from "sweetalert2";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import 'bootstrap/dist/css/bootstrap.min.css';

const Page = () => {
  const [auth] = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [processedText, setProcessedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const fetchUserId = async () => {
      if (!auth?.user) return;
      try {
        const response = await fetch(`/api/auth/get-user-id?email=${auth.user.email}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${auth.token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch user ID");
        const data = await response.json();
        setUserId(data.userId);
      } catch (err) {
        console.error("Failed to fetch user ID:", err);
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to fetch user ID' || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
      }
    };

    fetchUserId();
  }, [auth]);

  const handleFile = (file) => {
    if (!file.name.match(/\.(txt|csv)$/i)) {
      setError("Please upload a .txt or .csv file");
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: "Please upload a .txt or .csv file",
        confirmButtonColor: '#d33',
      });

      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select a file first!");
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error || 'Something went wrong.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    setIsLoading(true);
    setFileDetails({
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
      status: "Processing",
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const externalRes = await fetch(`${process.env.BACKEND_API}/process`, {

        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${auth?.token}` },
      });



      // Check for errors first
      if (!externalRes.ok) throw new Error(`Processing failed: ${externalRes.status}`);

      // Process the stream
      const reader = externalRes.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalOutput = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.replace("data: ", "").trim();

            // Check for "Final result" tag
            if (data.startsWith("Final result:base64")) {
              const encoded = data.replace("Final result:base64:", "").trim();
              const decoded = atob(encoded);
              finalOutput = decoded;
            } else {
              // Update progress display or store it if needed
              result = data;
              // Optionally show in UI: e.g., setProgress(data)
              setFileDetails(prev => ({
                ...prev,
                status: result
              }));

            }
          }
        }
      }

      // After stream finishes, set final output
      setProcessedText(finalOutput || result); // fallback to progress if no final result
      setFileDetails((prev) => ({ ...prev, status: "Completed" }));


      if (userId) {
        const dbFormData = new FormData();
        dbFormData.append("file", selectedFile);
        dbFormData.append("userId", userId);
        dbFormData.append("status", "Success"); // Set status based on processing success


        if (externalData.content) {
          const dictionaryBlob = new Blob([externalData.content], { type: "text/plain" });
          dbFormData.append("dictionary", dictionaryBlob, `${selectedFile.name}_dictionary.txt`);
        }

        await fetch("/api/files/write-file", {
          method: "POST",
          body: dbFormData,
        });


        if (!dbResponse.ok) {
          throw new Error("Failed to save file to database");

        }

        const dbData = await dbResponse.json();
        console.log("File saved to database:", dbData);


      }
    } catch (err) {
      console.log("Upload error:", err);
      setError(err.message);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error || 'Something went wrong.',
        confirmButtonColor: '#d33',
      });
      setFileDetails((prev) => ({ ...prev, status: "Failed" }));

      if (userId) {
        try {
          const dbFormData = new FormData();
          dbFormData.append("file", selectedFile);
          dbFormData.append("userId", userId);
          dbFormData.append("status", "Failed");
          const dictionaryBlob = new Blob([""], { type: "text/plain" });
          dbFormData.append("dictionary", dictionaryBlob, "");

          console.log("STATUS : FAILED CALLING WRITE API: ");
          for (let [key, value] of dbFormData.entries()) {
            console.log(`${key}:`, value);
          }


          await fetch("/api/files/write-file", {
            method: "POST",
            body: dbFormData,
          });
        } catch (dbError) {
          console.error("Failed to save failed status:", dbError);
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: dbError || 'Something went wrong.',
            confirmButtonColor: '#d33',
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-success-subtle min-vh-100 py-5 text-dark">
      <div className="container">
        <h1 className="text-center text-success fw-bold mb-5">Upload File</h1>

        {/* Drop Zone */}
        <div
          className={`border border-success rounded-4 bg-white p-5 text-center shadow ${isDragActive ? "border-3" : "border-2"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current.click()}
          style={{ cursor: "pointer" }}
        >
          <CloudArrowUpIcon style={{ width: "40px", height: "40px", color: "#198754" }} />
          <p className="mt-3 mb-1 fw-semibold">Drag & Drop or Click to Upload</p>
          <p className="text-muted">Only .txt and .csv files supported</p>
          {selectedFile && <p className="fw-bold text-success mt-2">{selectedFile.name}</p>}
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>


        {/* Process Button */}
        <div className="text-center mt-4">
          <button
            className="btn btn-success fw-semibold px-4 py-2"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Process"}
          </button>
          {error && <div className="text-danger mt-2 fw-semibold">{error}</div>}
        </div>

        {/* File Info */}
        {fileDetails && (
          <div className="card bg-white shadow-sm rounded-4 mt-5">
            <div className="card-body">
              <div className="row fw-bold border-bottom pb-2 mb-3 text-success">
                <div className="col">File Name</div>
                <div className="col">Size</div>
                <div className="col">Status</div>
              </div>
              <div className="row">
                <div className="col">{fileDetails.name}</div>
                <div className="col">{fileDetails.size}</div>
                <div className="col">
                  <span className={`fw-semibold ${fileDetails.status === "Processed"
                    ? "text-success"
                    : fileDetails.status === "Failed"
                      ? "text-danger"
                      : "text-warning"
                    }`}>
                    {fileDetails.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Button */}
        {processedText && (
          <div className="text-center mt-5">
            <button
              className="btn btn-info text-white fw-semibold px-4 py-2"
              onClick={() => {
                const blob = new Blob([processedText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `processed_${fileDetails.name}`;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }, 0);
              }}
            >
              Download Processed Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
