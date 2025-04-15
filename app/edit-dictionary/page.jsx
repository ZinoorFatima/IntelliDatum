"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth.js";
import Swal
  from "sweetalert2";
export default function EditDictionaryPage() {
  const [fileId, setFileId] = useState(null);
  const { token } = useAuth()[0];
  const router = useRouter();

  const [dictionary, setDictionary] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fileId");
    setFileId(id);
  }, []);

  useEffect(() => {
    const fetchDictionary = async () => {
      if (!fileId || !token) return;

      try {
        const response = await fetch(`/api/files/read-file-by-id?fileId=${fileId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          const file = data.file;
          const contentType = file.dictionaryFile?.trim().startsWith("<") ? "xml" : "text";
          setDictionary({
            name: file.dictionaryName,
            type: contentType,
            content: file.dictionaryFile,
          });
          setContent(file.dictionaryFile);
        } else {
          setError("Failed to load dictionary.");
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: 'Failed to load dictionary',
            confirmButtonColor: '#d33',
          });
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dictionary.");
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to load dictionary',
          confirmButtonColor: '#d33',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDictionary();
  }, [fileId, token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/files/update-dictionary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId,
          content,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError("Failed to load dictionary.");
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to save to dictionary',
          confirmButtonColor: '#d33',
        });
      }
    } catch (err) {
      console.error(err);
      setError("Error saving dictionary.");
      ;
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Failed to save to dictionary',
        confirmButtonColor: '#d33',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">📝 Edit Dictionary - {dictionary?.name}</h2>

      <textarea
        className="form-control mb-3"
        rows={20}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="btn btn-success"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
