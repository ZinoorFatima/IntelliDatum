"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth.js";

export default function EditDictionaryPage() {
  const [fileId, setFileId] = useState(null);
  const { token } = useAuth()[0];
  const router = useRouter();

  const [dictionaryXml, setDictionaryXml] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [parsedLines, setParsedLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fileId");
    setFileId(id);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!fileId || !token) return;

      try {
        const response = await fetch(`/api/files/read-file-by-id?fileId=${fileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          const file = data.file;
          const dictionary = file.dictionaryFile || "";
          const content = file.fileContent || "";


          setDictionaryXml(dictionary);
          setFileContent(content);
          parseDictionaryXml(dictionary);
        } else {
          setError("Failed to load dictionary.");
        }
      } catch (err) {
        console.error(err);
        setError("Error loading dictionary.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId, token]);

  const parseDictionaryXml = (xml) => {
    const lines = xml.split("\n").map((line, index) => {
      const fieldMatch = line.match(/<field name="([^"]+)" type="([^"]+)"(.*?)\/>/);
      const recordMatch = line.match(/<record name="([^"]+)" id="([^"]+)"\s*>/);
  
      if (fieldMatch) {
        return {
          type: "field",
          index,
          originalLine: line,
          name: fieldMatch[1],
          fieldType: fieldMatch[2],
          rest: fieldMatch[3],
        };
      } else if (recordMatch) {
        return {
          type: "record",
          index,
          originalLine: line,
          recordName: recordMatch[1],
          recordId: recordMatch[2],
        };
      } else {
        return {
          type: "text",
          index,
          content: line,
        };
      }
    });
  
    setParsedLines(lines);
  };
  

  const handleFieldChange = (index, key, value) => {
    const updated = parsedLines.map((line) => {
      if (line.index === index) {
        return { ...line, [key]: value };
      }
      return line;
    });
    setParsedLines(updated);
  };
  

  const buildUpdatedXml = () => {
    return parsedLines
      .map((line) => {
        if (line.type === "field") {
          return `        <field name="${line.name}" type="${line.fieldType}"${line.rest} />`;
        } else if (line.type === "record") {
          return `  <record name="${line.recordName}" id="${line.recordId}">`;
        } else {
          return line.content;
        }
      })
      .join("\n");
  };
  

  const handleSave = async () => {
    setSaving(true);
    const updatedXml = buildUpdatedXml();

    try {
      const res = await fetch("/api/files/update-dictionary", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId, content: updatedXml }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.message || "Failed to save dictionary.");
      }
    } catch (err) {
      console.error(err);
      setError("Error saving dictionary.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">📝 Edit Dictionary</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Editable Dictionary (left) */}
        <div className="col-md-6">
          <h5>📚 Dictionary</h5>
          <pre className="bg-light p-3 rounded" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {parsedLines.map((line, i) => {
            if (line.type === "record") {
              return (
                <div key={i} className="d-flex align-items-center gap-2 mb-2">
                  <span className="text-muted">{"<record name=\""}</span>
                  <input
                    type="text"
                    value={line.recordName}
                    onChange={(e) => handleFieldChange(line.index, "recordName", e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "25%" }}
                  />
                  <span className="text-muted">{"\" id=\""}</span>
                  <input
                    type="text"
                    value={line.recordId}
                    onChange={(e) => handleFieldChange(line.index, "recordId", e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "20%" }}
                  />
                  <span className="text-muted">{"\">"}</span>
                </div>
              );
            } else if (line.type === "field") {
              return (
                <div key={i} className="d-flex align-items-center gap-2 mb-1">
                  <span className="text-muted">&lt;field name="</span>
                  <input
                    type="text"
                    value={line.name}
                    onChange={(e) => handleFieldChange(line.index, "name", e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "25%" }}
                  />
                  <span className="text-muted">" type="</span>
                  <input
                    type="text"
                    value={line.fieldType}
                    onChange={(e) => handleFieldChange(line.index, "fieldType", e.target.value)}
                    className="form-control form-control-sm"
                    style={{ width: "20%" }}
                  />
                  <span className="text-muted">{`"${line.rest} />`}</span>
                </div>
              );
            } else {
              return <div key={i}>{line.content}</div>;
            }
          })}

          </pre>
        </div>

        {/* Read-only File Content (right) */}
        <div className="col-md-6">
          <h5>📄 Original File</h5>
          <textarea
            className="form-control"
            rows={30}
            readOnly
            value={fileContent}
            style={{ height: "70vh" }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="btn btn-success mt-4"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
