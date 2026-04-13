import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const API = "http://localhost:8000";

const c = {
  plum: "#631b40",
  plumDark: "#4a1230",
  olive: "#6b7a2a",
  oliveMid: "#aeb080",
  oliveBg: "#d8ddb0",
  sidebar: "#2d3016",
  sidebarText: "#e8eccc",
  sidebarMuted: "#aeb080",
  chatBg: "#f0ede3",
  cardBg: "#e8e4d8",
  border: "#8a9040",
  inputBg: "#e2ddd0",
  text: "#1e1e1e",
  muted: "#5a5a4a",
};

const mdComponents = {
  p: ({children}) => <p style={{ margin: "0 0 10px", lineHeight: 1.7 }}>{children}</p>,
  strong: ({children}) => <strong style={{ color: c.plum, fontWeight: 700 }}>{children}</strong>,
  li: ({children}) => <li style={{ marginBottom: 6, lineHeight: 1.6 }}>{children}</li>,
  ul: ({children}) => <ul style={{ paddingLeft: 20, margin: "8px 0" }}>{children}</ul>,
  ol: ({children}) => <ol style={{ paddingLeft: 20, margin: "8px 0" }}>{children}</ol>,
  h2: ({children}) => <h2 style={{ fontSize: 15, fontWeight: 700, color: c.olive, margin: "14px 0 6px" }}>{children}</h2>,
  h3: ({children}) => <h3 style={{ fontSize: 14, fontWeight: 700, color: c.plum, margin: "12px 0 4px" }}>{children}</h3>,
};

export default function App() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdMode, setJdMode] = useState("paste");
  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState({ resume: false, jd: false });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        await axios.post(`${API}/documents/upload/resume`, formData);
      }
      if (jdMode === "file" && jdFile) {
        const formData = new FormData();
        formData.append("file", jdFile);
        await axios.post(`${API}/documents/upload/job_description`, formData);
      } else if (jdMode === "paste" && jdText.trim()) {
        await axios.post(`${API}/documents/paste`, { text: jdText, doc_type: "job_description" });
      }
      setUploaded({ resume: !!resumeFile, jd: !!(jdMode === "file" ? jdFile : jdText.trim()) });
    } catch (e) {
      alert("Upload failed. Make sure the API is running.");
    }
    setUploading(false);
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/chat/ask`, { question: q });
      setMessages(prev => [...prev, { role: "ai", text: res.data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "ai", text: "Error. Please try again." }]);
    }
    setLoading(false);
  };

  const tabStyle = (active) => ({
    flex: 1, padding: "7px 0", fontSize: 12, fontWeight: 600, border: `2px solid ${c.border}`,
    borderRadius: 8, cursor: "pointer", background: active ? c.oliveMid : "transparent",
    color: active ? c.sidebar : c.sidebarMuted
  });

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", fontSize: 15 }}>

      <div style={{ width: 340, background: c.sidebar, borderRight: `2px solid ${c.border}`, display: "flex", flexDirection: "column", padding: 28 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: c.oliveBg, margin: "0 0 4px", letterSpacing: "-0.5px" }}>JobLens</h1>
          <p style={{ fontSize: 13, color: c.sidebarMuted, margin: 0 }}>AI-powered job fit analysis</p>
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, color: c.oliveMid, textTransform: "uppercase", letterSpacing: 1.5, margin: "0 0 12px" }}>Your Documents</p>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: c.sidebarText, display: "block", marginBottom: 8 }}>
            Resume {uploaded.resume && <span style={{ color: c.oliveBg, fontSize: 12 }}>✓</span>}
          </label>
          <label style={{ display: "block", border: `2px dashed ${uploaded.resume ? c.oliveBg : c.sidebarMuted}`, borderRadius: 10, padding: "14px", cursor: "pointer", background: uploaded.resume ? "#3d4a1a" : "#232810", textAlign: "center" }}>
            <input type="file" accept=".txt,.pdf" style={{ display: "none" }} onChange={e => setResumeFile(e.target.files[0])} />
            <div style={{ fontSize: 20, marginBottom: 4 }}>📄</div>
            <span style={{ fontSize: 12, color: uploaded.resume ? c.oliveBg : c.sidebarMuted, fontWeight: 500 }}>
              {resumeFile ? resumeFile.name : "Upload PDF or TXT"}
            </span>
          </label>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: c.sidebarText, display: "block", marginBottom: 8 }}>
            Job Description {uploaded.jd && <span style={{ color: c.oliveBg, fontSize: 12 }}>✓</span>}
          </label>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={() => setJdMode("paste")} style={tabStyle(jdMode === "paste")}>Paste text</button>
            <button onClick={() => setJdMode("file")} style={tabStyle(jdMode === "file")}>Upload file</button>
          </div>
          {jdMode === "paste" ? (
            <textarea
              value={jdText}
              onChange={e => setJdText(e.target.value)}
              placeholder="Paste the job description here..."
              rows={6}
              style={{ width: "100%", border: `2px solid ${c.border}`, borderRadius: 10, padding: "10px 12px", fontSize: 12, background: "#232810", color: c.sidebarText, resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.6 }}
            />
          ) : (
            <label style={{ display: "block", border: `2px dashed ${uploaded.jd ? c.oliveBg : c.sidebarMuted}`, borderRadius: 10, padding: "14px", cursor: "pointer", background: uploaded.jd ? "#3d4a1a" : "#232810", textAlign: "center" }}>
              <input type="file" accept=".txt,.pdf" style={{ display: "none" }} onChange={e => setJdFile(e.target.files[0])} />
              <div style={{ fontSize: 20, marginBottom: 4 }}>💼</div>
              <span style={{ fontSize: 12, color: uploaded.jd ? c.oliveBg : c.sidebarMuted, fontWeight: 500 }}>
                {jdFile ? jdFile.name : "Upload PDF or TXT"}
              </span>
            </label>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={uploading || (!resumeFile && !jdText.trim() && !jdFile)}
          style={{ background: c.plum, color: c.oliveBg, border: `2px solid ${c.plumDark}`, borderRadius: 10, padding: "13px 0", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: uploading || (!resumeFile && !jdText.trim() && !jdFile) ? 0.5 : 1 }}
        >
          {uploading ? "Uploading..." : "Upload Documents"}
        </button>

        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: `2px solid #3d4a1a` }}>
          <p style={{ fontSize: 11, color: c.sidebarMuted, margin: 0, lineHeight: 1.8 }}>
            FastAPI · FAISS · Llama 3.1<br />AWS S3 · KMS · Kubernetes · Docker
          </p>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: c.chatBg }}>
        <div style={{ padding: "20px 28px", borderBottom: `2px solid ${c.border}`, background: c.cardBg }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: c.plum }}>Ask JobLens</h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: c.muted }}>Upload your documents then ask anything about your fit</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <p style={{ color: c.muted, fontSize: 15, marginBottom: 20 }}>Upload your resume and a job description to get started</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {["Am I a good fit?", "What skills am I missing?", "How should I tailor my resume?", "Write me a cover letter"].map(q => (
                  <button key={q} onClick={() => setQuestion(q)}
                    style={{ background: c.cardBg, border: `2px solid ${c.border}`, borderRadius: 20, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: c.plum, fontWeight: 600 }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "72%",
                background: m.role === "user" ? c.plum : c.cardBg,
                color: m.role === "user" ? c.oliveBg : c.text,
                border: m.role === "ai" ? `2px solid ${c.border}` : "none",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "13px 18px",
                fontSize: 15,
                lineHeight: 1.7,
              }}>
                {m.role === "ai"
                  ? <ReactMarkdown components={mdComponents}>{m.text}</ReactMarkdown>
                  : m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: c.cardBg, border: `2px solid ${c.border}`, borderRadius: "18px 18px 18px 4px", padding: "13px 18px" }}>
                <span style={{ color: c.plum, fontSize: 15, fontWeight: 500 }}>Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 28px", background: c.cardBg, borderTop: `2px solid ${c.border}`, display: "flex", gap: 10 }}>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAsk()}
            placeholder="Ask anything about your job fit..."
            style={{ flex: 1, border: `2px solid ${c.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 15, outline: "none", background: c.inputBg, color: c.text }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            style={{ background: c.plum, color: c.oliveBg, border: `2px solid ${c.plumDark}`, borderRadius: 10, padding: "0 22px", fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading || !question.trim() ? 0.5 : 1 }}
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}
