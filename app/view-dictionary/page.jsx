// app/view-dictionary/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ViewDictionaryPage() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");
  const [dictionary, setDictionary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDictionary = async () => {
      try {
        const response = await fetch(`/api/files/get-dictionary?fileId=${fileId}`);
        const data = await response.json();
        if (data.success) {
          setDictionary(data.dictionary);
        } else {
          setError(data.message || "Failed to load dictionary");
        }
      } catch (err) {
        setError("Failed to fetch dictionary");
      } finally {
        setIsLoading(false);
      }
    };

    if (fileId) fetchDictionary();
  }, [fileId]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!dictionary) return <div>No dictionary found</div>;

  return (
    <div className="container mt-4">
      <h1>Dictionary: {dictionary.name}</h1>
      <pre className="bg-light p-3 rounded">
        {dictionary.content}
      </pre>
    </div>
  );
}