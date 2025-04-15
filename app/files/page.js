"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/auth";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Download } from "lucide-react";

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
      }
    };

    fetchUserId();
  }, [auth]);

  const handleFile = (file) => {
    if (!file.name.match(/\.(txt|csv)$/i)) {
      setError("Only .txt and .csv files are supported.");
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

      if (!externalRes.ok) throw new Error("Failed to fetch");
      const externalData = await externalRes.json();

      setProcessedText(externalData.content || externalData.message);
      setFileDetails((prev) => ({ ...prev, status: "Processed" }));

      if (userId) {
        const dbFormData = new FormData();
        dbFormData.append("file", selectedFile);
        dbFormData.append("userId", userId);
        dbFormData.append("status", "Success");

        if (externalData.content) {
          const dictionaryBlob = new Blob([externalData.content], { type: "text/plain" });
          dbFormData.append("dictionary", dictionaryBlob, `${selectedFile.name}_dictionary.txt`);
        }

        await fetch("/api/files/write-file", {
          method: "POST",
          body: dbFormData,
        });
      }
    } catch (err) {
      console.log("Upload error:", err);
      setError(err.message);
      setFileDetails((prev) => ({ ...prev, status: "Failed" }));

      if (userId) {
        try {
          const dbFormData = new FormData();
          dbFormData.append("file", selectedFile);
          dbFormData.append("userId", userId);
          dbFormData.append("status", "Failed");
          dbFormData.append("dictionary", new Blob([""], { type: "text/plain" }));

          await fetch("/api/files/write-file", {
            method: "POST",
            body: dbFormData,
          });
        } catch (dbError) {
          console.error("Failed to save failed status:", dbError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
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
                <div className="col d-flex align-items-center gap-2">Status</div>
              </div>
              <div className="row align-items-center">
                <div className="col">{fileDetails.name}</div>
                <div className="col">{fileDetails.size}</div>
                <div className="col d-flex align-items-center justify-content-between">
                  <span className={`fw-semibold ${fileDetails.status === "Processed"
                    ? "text-success"
                    : fileDetails.status === "Failed"
                      ? "text-danger"
                      : "text-warning"
                    }`}>
                    {fileDetails.status}
                  </span>

                  {/* Download button styled and aligned right */}
                  {fileDetails.status === "Processed" && processedText && (
                    <button
                      className="btn btn-success btn-sm d-flex align-items-center gap-1"
                      onClick={handleDownload}
                      title="Download Processed File"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Preview */}
        {processedText && (
          <div className="text-center mt-5">
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #ddd", maxHeight: "200px", overflowY: "auto" }}>
              <h4>Preview</h4>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{processedText}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
