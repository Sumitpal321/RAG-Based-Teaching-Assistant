import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { uploadDocs } from '../services/api';
import toast from 'react-hot-toast';
import { Upload, FileText, CheckCircle } from 'lucide-react';

export default function UploadDocs() {
  const [files, setFiles] = useState([]);
  const [grade, setGrade] = useState('12');
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const { getAuthHeader } = useAuth();

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.name.endsWith('.pdf'));
    setFiles(prev => [...prev, ...dropped]);
  };

  const handleFileInput = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (!files.length) { toast.error('Please select files first!'); return; }
    setLoading(true);
    const results = [];
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('grade', grade);
        const res = await uploadDocs(formData, getAuthHeader());
        results.push({ name: file.name, success: true, doc_id: res.data.doc_id });
        toast.success(`${file.name} uploaded! ✅`);
      } catch {
        results.push({ name: file.name, success: false });
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploaded(results);
    setFiles([]);
    setLoading(false);
  };

  return (
    <div className="page-layout">
      <Navbar />
      <div className="upload-page">
        <div className="upload-header">
          <h2>📤 Upload Documents</h2>
          <p>Upload PDF study materials for your students</p>
        </div>

        <div className="upload-card">
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => document.getElementById('file-input').click()}
          >
            <Upload size={48} />
            <h3>Drop PDFs here</h3>
            <p>or click to browse files</p>
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group grade-select">
            <label>🎓 Grade / Class</label>
            <input
              value={grade}
              onChange={e => setGrade(e.target.value)}
              placeholder="e.g. 12, Graduation..."
            />
          </div>

          {files.length > 0 && (
            <div className="file-list">
              <h4>Selected Files ({files.length})</h4>
              {files.map((f, i) => (
                <div key={i} className="file-item">
                  <FileText size={18} />
                  <span>{f.name}</span>
                  <span className="file-size">{(f.size / 1024).toFixed(1)} KB</span>
                  <button className="remove-btn" onClick={() => removeFile(i)}>✕</button>
                </div>
              ))}
              <button className="btn-primary" onClick={handleUpload} disabled={loading}>
                {loading ? <span className="spinner" /> : '🚀 Upload All'}
              </button>
            </div>
          )}

          {uploaded.length > 0 && (
            <div className="upload-results">
              <h4>Upload Results</h4>
              {uploaded.map((r, i) => (
                <div key={i} className={`upload-result ${r.success ? 'success' : 'fail'}`}>
                  <CheckCircle size={16} />
                  <span>{r.name}</span>
                  <span>{r.success ? '✅ Indexed' : '❌ Failed'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
