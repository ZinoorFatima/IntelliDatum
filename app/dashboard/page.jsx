"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/auth";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
export default function DashboardPage() {
  const [auth] = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      if (!auth.user) return;

      try {
        const response = await fetch(`/api/auth/get-user-id?email=${auth.user.email}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${auth.token}`,
          },
        });

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
        setError("Failed to fetch user ID");
        console.error(err);
      }
    };

    fetchUserId();
  }, [auth]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/files/read-file?userId=${userId}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${auth.token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setFiles(data.files.map(file => ({
            ...file,
            dictionary: {
              name: file.dictionaryName,
              content: file.dictionaryFile,
              type: file.dictionaryFile?.trim().startsWith("<") ? "xml" : "text"
            }
          })));
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

    fetchFiles();
  }, [userId, auth.token]);

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

    // Navigate to view page with dictionary data
    router.push(`/view-dictionary?fileId=${fileId}`);
  };

  const handleDownload = (dictionary) => {
    if (!dictionary?.content) {
      setError("No dictionary content available");
      return;
    }

    const blob = new Blob([dictionary.content], {
      type: dictionary.type === "xml" ? "application/xml" : "text/plain"
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

  const total = files.length;
  const success = files.filter((f) => f.status === "Success").length;
  const failed = files.filter((f) => f.status === "Failed").length;

  return (
    <div className="d-flex min-vh-100 text-dark bg-light">
      {/* Sidebar */}
      <aside className="bg-success text-white p-4" style={{ width: "250px" }}>
        <h1 className="h3 fw-bold mb-5">Intellidatum</h1>
        <nav className="nav flex-column">
          <a href="/dashboard" className="nav-link text-white">Dashboard</a>
          <a href="/files" className="nav-link text-white">Files</a>
          <a href="/profile" className="nav-link text-white">Profile</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <h2 className="display-5 fw-bold mb-4">📊 Dashboard</h2>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError(null)}
              aria-label="Close"
            ></button>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center my-4">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <p className="card-title fw-semibold">Total Files</p>
                <h3 className="text-success fw-bold">{total}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <p className="card-title fw-semibold">Success</p>
                <h3 className="text-success fw-bold">{success}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center">
              <div className="card-body">
                <p className="card-title fw-semibold">Failed</p>
                <h3 className="text-danger fw-bold">{failed}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Files Table */}
        {files.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered bg-white shadow-sm">
              <thead className="table-success">
                <tr>
                  <th>File Name</th>
                  <th>Status</th>
                  <th>Dictionary</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file._id}>
                    <td>{file.fileName}</td>
                    <td>
                      <span
                        className={`badge ${file.status === "Success"
                          ? "bg-success-subtle text-success-emphasis"
                          : "bg-danger-subtle text-danger-emphasis"
                          }`}
                      >
                        {file.status}
                      </span>
                    </td>
                    <td>
                      {file.dictionary?.name || "N/A"}
                    </td>
                    <td>
                      <button
                        onClick={() => handleView(file._id, file.dictionary)}
                        className="btn btn-primary btn-sm me-2"
                        disabled={!file.dictionary?.content}
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/edit-dictionary?fileId=${file._id}`)}
                        className="btn btn-warning btn-sm me-2"
                        disabled={!file.dictionary?.content}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDownload(file.dictionary)}
                        className="btn btn-success btn-sm"
                        disabled={!file.dictionary?.content}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !isLoading && (
            <div className="alert alert-info">
              No files found. Upload some files to get started!
            </div>
          )
        )}
      </main>
    </div>
  );
}