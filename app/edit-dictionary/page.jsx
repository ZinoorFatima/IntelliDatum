"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useAuth } from "../context/auth.js";
import Swal
  from "sweetalert2";
export default function EditDictionaryPage() {
  const [fileId, setFileId] = useState(null);
  const { token } = useAuth()[0];
  const router = useRouter();

  const [dictionaryXml, setDictionaryXml] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [dictionaryName, setDictionaryName] = useState("");

  const [parsedLines, setParsedLines] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(null);
  const [delimiter, setDelimiter] = useState(null);
  const [currentRecordId, setCurrentRecordId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const parseDictionaryXml = useCallback((xml) => {
    const lines = xml.split("\n").map((line, index) => {
      const fieldMatch = line.match(/<field name="([^"]+)" type="([^"]+)"(.*?)\/>/);
      const recordMatch = line.match(/<record name="([^"]+)" id="([^"]+)"\s*>/);
      const separatorMatch = line.match(/<field-info separator="(.+?)"/);

      console.log(dictionaryXml);

      if (separatorMatch) {
        setDelimiter(separatorMatch[1]);
      }

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
  }, [dictionaryXml]);

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
          setFileName(file.fileName || "File");
          setDictionaryName(file.dictionaryName || "Dictionary");

          parseDictionaryXml(dictionary);
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

    fetchData();
  }, [fileId, token, parseDictionaryXml]);

  const findCurrentRecordId = (fieldLineIndex) => {
    for (let i = fieldLineIndex; i >= 0; i--) {
      const line = parsedLines[i];
      if (line.type === "record") {
        return line.recordId;
      }
    }
    return null;
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

  const renderHighlightedFileContent = () => {
    if (!delimiter || highlightIndex === null || currentRecordId === null) return fileContent;

    const lines = fileContent.split("\n");
    const dictionaryFields = parsedLines.filter((l) => l.type === "field");
    const targetField = dictionaryFields[highlightIndex];
    const fieldIdx = parseInt(targetField?.rest.match(/index="(\d+)"/)?.[1]);
    if (isNaN(fieldIdx)) return fileContent;

    return lines.map((line) => {
      const parts = line.split(delimiter);
      if (parts[0].replace(/^"|"$/g, "") === currentRecordId && parts.length > fieldIdx) {
        return parts
          .map((part, idx) =>
            idx === fieldIdx
              ? `<mark style="background: lightgreen">${part}</mark>`
              : part
          )
          .join(delimiter);
      }
      return line;
    }).join("\n");
  };

  if (loading) return <div className="p-4 min-vh-100">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0 text-success">Dictionary Editor</h2>
        <button
          onClick={handleSave}
          className="btn btn-success d-flex align-items-center"
          disabled={saving}
          title="Save Changes"
        >
          <Save size={18} className="me-1" />
          <span className="d-none d-md-inline">{saving ? "Saving..." : "Save"}</span>
        </button>
      </div>


      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {/* Editable Dictionary */}
        <div className="col-md-6 mb-4">
          <h6 className="text-muted mb-2">{dictionaryName}</h6>
          <pre className="bg-light p-3 rounded" style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {parsedLines.map((line, i) => {
              if (line.type === "record") {
                return (
                  <div key={i} className="d-flex align-items-center gap-2 mb-2">
                    <span className="text-muted">&lt;record name=&quot;</span>
                    <input
                      type="text"
                      value={line.recordName}
                      onChange={(e) => handleFieldChange(line.index, "recordName", e.target.value)}
                      className="form-control form-control-sm"
                      style={{ width: "25%" }}
                    />
                    <span className="text-muted">{"\" id=\""}</span>
                    <span className="text-muted">{line.recordId}</span>
                    <span className="text-muted">{"\">"}</span>
                  </div>
                );
              } else if (line.type === "field") {
                const fieldIndex = parsedLines
                  .filter((l) => l.type === "field")
                  .findIndex((f) => f.index === line.index);

                return (
                  <div key={i} className="d-flex align-items-center gap-2 mb-1">
                    <span className="text-muted">&lt;field name=&quot;</span>
                    <input
                      type="text"
                      value={line.name}
                      onChange={(e) => handleFieldChange(line.index, "name", e.target.value)}
                      onFocus={() => {
                        setHighlightIndex(fieldIndex);
                        setCurrentRecordId(findCurrentRecordId(line.index));
                      }}
                      onBlur={() => setHighlightIndex(null)}
                      className="form-control form-control-sm"
                      style={{ width: "25%" }}
                    />
                    <span className="text-muted">&quot; type=</span>
                    <input
                      type="text"
                      value={line.fieldType}
                      onChange={(e) => handleFieldChange(line.index, "fieldType", e.target.value)}
                      className="form-control form-control-sm"
                      style={{ width: "20%" }}
                    />
                    <span className="text-muted">&quot;{line.rest} /&gt;</span>
                  </div>
                );
              } else {
                return <div key={i}>{line.content}</div>;
              }
            })}
          </pre>
        </div>

        {/* Read-only File Content with highlighting */}
        <div className="col-md-6 mb-4">
          <h6 className="text-muted mb-2">{fileName}</h6>
          <div
            className="form-control"
            style={{
              height: "70vh",
              overflowY: "scroll",
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
            }}
            dangerouslySetInnerHTML={{ __html: renderHighlightedFileContent() }}
          />
        </div>
      </div>

    </div>
  );
}
