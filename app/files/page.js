"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/auth";

const Page = () => {
  const [auth] = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [processedText, setProcessedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!auth?.user) return;

      try {
        const response = await fetch(`/api/auth/get-user-id?email=${auth.user.email}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(txt|csv)$/i)) {
      setError("Please upload a .txt or .csv file");
      return;
    }

    setError(null);
    setSelectedFile(file);
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
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      status: "Processing...",
    });

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Send to external processing API
      const externalRes = await fetch(`${process.env.BACKEND_API}/process`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      if (!externalRes.ok) throw new Error(`Processing failed: ${externalRes.status}`);
      const externalData = await externalRes.json();

      setProcessedText(externalData.content || externalData.message);
      setFileDetails((prev) => ({ ...prev, status: "Completed" }));

      // Save to DB if user is logged in
      if (userId) {
        const dbFormData = new FormData();
        dbFormData.append("file", selectedFile);
        dbFormData.append("userId", userId);
        dbFormData.append("status", "Success"); // Set status based on processing success
        
        // Only include dictionary if processing was successful
        if (externalData.content) {
          const dictionaryBlob = new Blob([externalData.content], { type: "text/plain" });
          dbFormData.append("dictionary", dictionaryBlob, `${selectedFile.name}_dictionary.txt`);
        }

        const dbResponse = await fetch("/api/files/write-file", {
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
      console.error("Upload error:", err);
      setError(err.message);
      setFileDetails((prev) => ({ ...prev, status: "Failed" }));

      // If processing failed but we have a user, save with failed status
      if (userId) {
        try {
          const dbFormData = new FormData();
          dbFormData.append("file", selectedFile);
          dbFormData.append("userId", userId);
          dbFormData.append("status", "Failed");
          
          await fetch("/api/auth/write-file", {
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
    if (!processedText) return;

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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "20px" }}>
      <div style={{ backgroundColor: "#198754", width: "80%", padding: "15px", borderRadius: "10px", textAlign: "center", marginBottom: "20px" }}>
        <h3 style={{ color: "#f8f9fa", margin: 0 }}>File Processing App</h3>
      </div>

      <div style={{ backgroundColor: "#fff", width: "80%", border: "2px solid #ddd", borderRadius: "10px", padding: "20px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            style={{ marginBottom: "15px", padding: "10px", border: "1px solid #ddd", borderRadius: "5px" }}
            disabled={isLoading}
          />

          {error && (
            <div style={{ color: "#dc3545", marginBottom: "15px", padding: "10px", backgroundColor: "#f8d7da", borderRadius: "5px" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              padding: "12px",
              cursor: isLoading ? "not-allowed" : "pointer",
              backgroundColor: isLoading ? "#6c757d" : "#198754",
              borderRadius: "5px",
              color: "#fff",
              border: "none",
              fontWeight: "bold",
            }}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Upload & Process"}
          </button>
        </form>
      </div>

      <div style={{ backgroundColor: "#fff", width: "80%", border: "2px solid #ddd", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", padding: "10px 0", borderBottom: "1px solid #eee" }}>
          <div style={{ width: "40%" }}>Filename</div>
          <div style={{ width: "30%" }}>Size</div>
          <div style={{ width: "30%" }}>Status</div>
        </div>

        {fileDetails && (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "15px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ width: "40%" }}>{fileDetails.name}</div>
            <div style={{ width: "30%" }}>{fileDetails.size}</div>
            <div style={{ width: "30%", color: fileDetails.status === "Completed" ? "#198754" : fileDetails.status === "Failed" ? "#dc3545" : "#6c757d" }}>
              {fileDetails.status}
            </div>
          </div>
        )}

        {processedText && (
          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleDownload}
              style={{ padding: "12px", cursor: "pointer", backgroundColor: "#17a2b8", borderRadius: "5px", color: "#fff", border: "none", fontWeight: "bold", width: "100%" }}
            >
              Download Processed Data
            </button>

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #ddd", maxHeight: "200px", overflowY: "auto" }}>
              <h4>Preview:</h4>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{processedText.length > 500 ? `${processedText.substring(0, 500)}...` : processedText}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;