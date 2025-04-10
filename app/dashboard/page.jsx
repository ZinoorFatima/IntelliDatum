'use client';

import { useState } from 'react';

export default function DashboardPage() {
  const [files] = useState([
    {
      id: 1,
      name: 'invoice_data.json',
      status: 'Success',
      dictionary: {
        type: 'invoice',
        total: 230.5,
        customer: 'Jane Smith',
      },
    },
    {
      id: 2,
      name: 'corrupt_file.xml',
      status: 'Failed',
      dictionary: null,
    },
    {
      id: 3,
      name: 'survey_responses.csv',
      status: 'Success',
      dictionary: {
        surveyId: 102,
        responses: 54,
      },
    },
  ]);

  const handleView = (dict) => {
    if (!dict) {
      alert('❌ No dictionary available.');
    } else {
      alert(JSON.stringify(dict, null, 2));
    }
  };

  const handleEdit = (id) => {
    alert(`🛠️ Open editor for file ID: ${id}`);
  };

  const handleDownload = (dict) => {
    if (!dict) return;
    const blob = new Blob([JSON.stringify(dict, null, 2)], {
      type: 'application/octet-stream',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dictionary.epf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = files.length;
  const success = files.filter((f) => f.status === 'Success').length;
  const failed = files.filter((f) => f.status === 'Failed').length;

  return (
    <div className="d-flex min-vh-100 text-dark bg-light">
      {/* Sidebar */}
      <aside className="bg-success text-white p-4" style={{ width: '250px' }}>
        <h1 className="h3 fw-bold mb-5">Intellidatum</h1>
        <nav className="nav flex-column">
          <a href="/dashboard" className="nav-link text-white">Dashboard</a>
          <a href="/files" className="nav-link text-white">Files</a>
          <a href="/profile" className="nav-link text-white">Profile</a>
          <a href="/settings" className="nav-link text-white">Settings</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow-1 p-4">
        <h2 className="display-5 fw-bold mb-4">📊 Dashboard</h2>

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

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-bordered bg-white shadow-sm">
            <thead className="table-success">
              <tr>
                <th>File Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>{file.name}</td>
                  <td>
                    <span
                      className={`badge ${
                        file.status === 'Success'
                          ? 'bg-success-subtle text-success-emphasis'
                          : 'bg-danger-subtle text-danger-emphasis'
                      }`}
                    >
                      {file.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleView(file.dictionary)}
                      className="btn btn-primary btn-sm me-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(file.id)}
                      className="btn btn-warning btn-sm text-white me-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownload(file.dictionary)}
                      className="btn btn-success btn-sm"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
