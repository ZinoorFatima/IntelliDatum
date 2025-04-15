"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ViewDictionaryPage() {
  const router = useRouter();

  const [fileId, setFileId] = useState(null);
  const [dictionary, setDictionary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fileId");
    setFileId(id);
  }, []);

  useEffect(() => {
    const fetchDictionary = async () => {
      if (!fileId) return;
      try {
        const response = await fetch(`/api/files/get-dictionary?fileId=${fileId}`);
        const data = await response.json();
        if (data.success) {
          setDictionary(data.dictionary);
        } else {
          setError(data.message || "Failed to load dictionary");
        }
      } catch (err) {
        setError("Failed to fetch dictionary", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDictionary();
  }, [fileId]);

  const handleDownload = () => {
    if (!dictionary?.content) {
      setError("No dictionary content available");
      return;
    }

    const blob = new Blob([dictionary.content], {
      type: dictionary.type === "xml" ? "application/xml" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${dictionary.name || "dictionary"}.${dictionary.type === "xml" ? "xml" : "txt"}`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleEdit = () => {
    router.push(`/edit-dictionary?fileId=${fileId}`);
  };

  if (isLoading) return <div className="p-4 min-vh-100">Loading...</div>;
  if (error) return <div className="p-4 min-vh-100">Error: {error}</div>;
  if (!dictionary) return <div className="p-4 min-vh-100">No dictionary found</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Dictionary: {dictionary.name}</h1>
        <div>
          <button className="btn btn-warning me-2" onClick={handleEdit}>
            Edit
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
      <pre className="bg-light p-3 rounded">{dictionary.content}</pre>
    </div>
  );
}
