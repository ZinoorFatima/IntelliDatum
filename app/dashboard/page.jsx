"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";

import {
  Eye,
  Pencil,
  Trash,
  Download,
  Upload,
  EyeOff,
  Slash,
  FileX,
} from "lucide-react";

import Swal from "sweetalert2";




export default function DashboardPage() {
  const [auth, setAuth] = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
      const storedAuth = localStorage.getItem("auth");
      if (!storedAuth) {
        router.push('/');
      } else {
        const parsed = JSON.parse(storedAuth);
        setAuth(parsed);
        setAuthChecked(true); 
      }
    }, [router, setAuth]);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!auth.user) return;

      try {
        const response = await fetch(
          `/api/auth/get-user-id?email=${auth.user.email}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );

        const data = await response.json();

        if (data.success) {
          setUserId(data.userId);
        } else {
          setError(data.message || "Error fetching user ID");
          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: error || 'Something went wrong.',
            confirmButtonColor: '#d33',
          });
        }


      } catch (err) {
        console.log("Failed to fetch user ID", err);
      }
    };

    if (authChecked) {
      fetchUserId();
    }
  }, [auth, authChecked]);

  useEffect(() => {
    const fetchFiles = async () => {

      if(user){
        setLoadingUser(false);
      }
      if (!userId) return;
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/files/read-file?userId=${userId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${auth.token}` },
          }
        );

        const data = await response.json();
        if (data.success) {
          setFiles(
            data.files.map((file) => ({
              ...file,
              dictionary: {
                name: file.dictionaryName,
                content: file.dictionaryFile,
                type: file.dictionaryFile?.trim().startsWith("<")
                  ? "xml"
                  : "text",
              },
            }))
          );
        } else {

          Swal.fire({
            icon: 'error',
            title: 'Oops!',
            text: data.message || 'Something went wrong.',
            confirmButtonColor: '#d33',
          });
          setError(data.message || "Error fetching files");
        }
      } catch (err) {
        setError("Failed to fetch files");
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: data.message || 'Something went wrong.',
          confirmButtonColor: '#d33',
        });
        console.error(err);

      } finally {
        setIsLoading(false);
      }
    };

    if (authChecked && userId) {
      fetchFiles();
    }
  }, [user, authChecked, userId, auth.token]);

  const handleView = (fileId, dictionary) => {

    if (!dictionary?.content) {
      setError("No dictionary content available");
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: error || 'Something went wrong.',
        confirmButtonColor: '#d33',
      });
      return;
    }


    router.push(`/view-dictionary?fileId=${fileId}`);
  };

  const handleDownload = (dictionary) => {
    if (!dictionary?.content) return null;

    const blob = new Blob([dictionary.content], {
      type: dictionary.type === "xml" ? "application/xml" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${
      dictionary.name || "dictionary"
    }.${dictionary.type === "xml" ? "xml" : "txt"}`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/files/delete-file?fileId=${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await response.json();
      if (data.success) {
        setFiles((prev) => prev.filter((file) => file._id !== fileId));
      } else {
        console.log("Failed to delete file");
      }
    } catch (err) {
      console.log("Error deleting file", err);
    }
  };

  const total = files.length;
  const success = files.filter((f) => f.status === "Success").length;
  const failed = files.filter((f) => f.status === "Failed").length;

  if (loadingUser) return null;

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#d1e7dd",
        color: "#fff",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
        }}
      >
        <h1
          style={{
            fontWeight: "700",
            fontSize: "2.5rem",
            color: "#198754",
            flex: "1 1 auto",
            minWidth: "200px",
          }}
        >

          Dashboard
        </h1>
        <button
          onClick={() => router.push("/files")}
          style={{
            backgroundColor: "#198754",
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            border: "none",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Upload size={18} style={{ marginRight: "0.5rem" }} /> Upload File
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: "center", margin: "2rem" }}>
          <div className="spinner-border text-success" role="status" />
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {[{ label: "Total Files", value: total }, { label: "Success", value: success }, { label: "Failed", value: failed }].map((stat, idx) => (
          <div
            key={idx}
            style={{
              flex: "1 1 150px",
              minWidth: "150px",
              backgroundColor: "#198754",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center",
              boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ margin: 0, fontWeight: "500" }}>{stat.label}</p>
            <h2 style={{ margin: 0, fontWeight: "700" }}>{stat.value}</h2>
          </div>
        ))}
      </div>

      {/* File Table */}
      <div
        style={{
          backgroundColor: "#198754",
          borderRadius: "12px",
          padding: "1rem",
          overflowX: "auto",
        }}
      >
        {files.length > 0 ? (

          <table
            style={{
              width: "100%",
              color: "#fff",
              borderCollapse: "collapse",
            }}
          >

            <thead>
              <tr style={{ borderBottom: "1px solid #D3E6DC" }}>
                <th style={{ textAlign: "left", padding: "0.75rem" }}>
                  File Name
                </th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem" }}>Dictionary</th>
                <th style={{ padding: "0.75rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const isDisabled =
                  file.status === "Failed" || !file.dictionary?.content;
                return (
                  <tr key={file._id} style={{ borderBottom: "1px solid #D3E6DC" }}>
                    <td style={{ padding: "0.75rem", color: "#e0f2f1" }}>
                      {file.fileName}
                    </td>
                    <td style={{ textAlign: "center" }}>

                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          backgroundColor:
                            file.status === "Success"
                              ? "#144E37"
                              : file.status === "Failed"
                              ? "#dc3545"
                              : "#144E37",
                          color: "#fff",
                          fontSize: "0.9rem",
                        }}
                      >

                        {file.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#e0f2f1" }}>
                      {file.dictionary?.name || "N/A"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      <button
                        onClick={() => handleView(file._id, file.dictionary)}
                        disabled={isDisabled}
                        style={{
                          background: "none",
                          border: "none",
                          color: isDisabled ? "#9ca3af" : "#fff",
                          marginRight: "0.5rem",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDisabled ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/edit-dictionary?fileId=${file._id}`)
                        }
                        disabled={isDisabled}
                        style={{
                          background: "none",
                          border: "none",
                          color: isDisabled ? "#9ca3af" : "#fff",
                          marginRight: "0.5rem",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDisabled ? <Slash size={18} /> : <Pencil size={18} />}
                      </button>
                      <button
                        onClick={() => handleDownload(file.dictionary)}
                        disabled={isDisabled}
                        style={{
                          background: "none",
                          border: "none",
                          color: isDisabled ? "#9ca3af" : "#fff",
                          marginRight: "0.5rem",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                      >
                        {isDisabled ? <FileX size={18} /> : <Download size={18} />}
                      </button>
                      <button
                        onClick={() => handleDelete(file._id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                        }}
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          !isLoading && (
            <div style={{ color: "#bbf7d0", padding: "1rem" }}>
              No files found. Upload some files to get started!
            </div>
          )
        )}
      </div>
    </div>
  );
}
