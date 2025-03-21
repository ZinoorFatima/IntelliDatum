"use client";
import React, { useState } from "react";

const Page = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [processedText, setProcessedText] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) return alert("Please select a file!");

    setFileDetails({
      name: selectedFile.name,
      size: `${(selectedFile.size / 1024).toFixed(2)} KB`,
      status: "Processing...",
    });

    // Read file content
    const reader = new FileReader();
    reader.onload = async (e) => {
      const fileText = e.target.result;

      // Send file content to API
      try {
        const response = await fetch("http://54.83.150.182:5000/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: fileText }),
        });

        const data = await response.json();
        setProcessedText(data.output);
        setFileDetails((prev) => ({ ...prev, status: "Completed" }));
      } catch (error) {
        console.error("Error sending file:", error);
        setFileDetails((prev) => ({ ...prev, status: "Failed" }));
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDownload = () => {
    const blob = new Blob([processedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "processed_text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          backgroundColor: "#C0D7BA",
          marginTop: "5%",
          width: "80%",
          height: "50px",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <h3 style={{ color: "#484848" }}>Upload File</h3>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          width: "80%",
          height: "100%",
          border: "2px solid #000",
          marginTop: "20px",
          borderRadius: "10px",
        }}
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <form onSubmit={handleSubmit}>
            <input type="file" accept=".txt" onChange={handleFileChange} style={{ marginBottom: "10px" }} />
            <button
              type="submit"
              style={{
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#C0D7BA",
                borderRadius: "10px",
              }}
            >
              Submit
            </button>
          </form>
          {selectedFile && (
            <div style={{ marginTop: "10px" }}>
              <strong>Selected File:</strong> {selectedFile.name}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#fff",
          width: "80%",
          height: "100%",
          border: "2px solid #000",
          marginTop: "5px",
          borderRadius: "10px",
          marginBottom: "20%",
        }}
      >
        <div style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                marginBottom: "10px",
              }}
            >
              <div style={{ width: "40%" }}>Filename</div>
              <div style={{ width: "30%" }}>File Size</div>
              <div style={{ width: "30%" }}>Status</div>
            </div>
            {fileDetails && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <div style={{ width: "40%" }}>{fileDetails.name}</div>
                <div style={{ width: "30%" }}>{fileDetails.size}</div>
                <div style={{ width: "30%" }}>{fileDetails.status}</div>
                {processedText && (
                  <div style={{ marginTop: "20px" }}>
                    <button
                      onClick={handleDownload}
                      style={{
                        padding: "10px",
                        cursor: "pointer",
                        backgroundColor: "#C0D7BA",
                        borderRadius: "10px",
                        
                      }}
                    >
                      Download Processed File
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default Page;
