import React, { useEffect, useState } from 'react';
import { Table, Spinner, Badge } from 'react-bootstrap';

function ImportLogsPage() {
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://localhost:7242/api/AssetHierarchy/ImportFileLogs")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-3">
        <Spinner animation="border" /> Loading logs...
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Import File Logs</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Imported At</th>
            <th>File Name</th>
            <th>Import Type</th>
          </tr>
        </thead>
        <tbody>
  {Object.entries(logs)
    .sort(([a], [b]) => new Date(b) - new Date(a)) // newest first
    .map(([timestamp, details], index) => (
      <tr key={index}>
        <td>{new Date(timestamp).toLocaleString()}</td>
        <td>{details.fileName}</td>
        <td>
          <Badge bg={details.importType === "uploaded" ? "primary" : "secondary"}>
            {details.importType}
          </Badge>
        </td>
      </tr>
    ))}
</tbody>
      </Table>
    </div>
  );
}

export default ImportLogsPage;
