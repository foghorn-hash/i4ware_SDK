import React, { useState, useEffect } from "react";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import request from "../../utils/Request";

export default function DocumentBank() {
    const [documents, setDocuments] = useState([]);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        request()
            .get("/api/documentbank")
            .then((res) => setDocuments(res.data))
            .catch(console.error);
    }, []);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const formData = new FormData(e.target);

        try {
            const res = await request().post("/api/documentbank/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocuments((prev) => [res.data.document, ...prev]);
            e.target.reset();
        } catch (error) {
            console.error("Upload error:", error?.response?.data ?? error);
            alert("Virhe: " + (error?.response?.data?.message ?? "Tuntematon virhe"));
        } finally {
            setUploading(false);
        }
    };
    const getPdfViewUrl = (id) => {
        const token = localStorage.getItem(ACCESS_TOKEN_NAME);
        return `${API_BASE_URL}/api/documentbank/view/${id}?token=${token}`;
    };

    const getPdfDownloadUrl = (id) => {
        const token = localStorage.getItem(ACCESS_TOKEN_NAME);
        return `${API_BASE_URL}/api/documentbank/download/${id}?token=${token}`;
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
            <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 16, overflowY: "auto" }}>
                <h2>📄 Dokumenttipankki</h2>

                {/* Upload-lomake */}
                <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                        <input
                            name="document_name"
                            placeholder="Dokumentin nimi"
                            required
                            style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        <input name="file" type="file" accept=".pdf" required />
                    </div>
                    <button type="submit" disabled={uploading} style={{ width: "100%", padding: 8, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" }}>
                        {uploading ? "Ladataan..." : "⬆ Lisää PDF"}
                    </button>
                </form>

                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        style={{
                            padding: "10px 12px",
                            marginBottom: 8,
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            background: selectedPdf === doc.id ? "#eff6ff" : "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            onClick={() => setSelectedPdf(doc.id)}
                            style={{ fontWeight: 500, marginBottom: 6 }}
                        >
                            📄 {doc.document_name}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => setSelectedPdf(doc.id)}
                                style={{ flex: 1, padding: "4px 0", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", cursor: "pointer", borderRadius: 4 }}
                            >
                                👁 Näytä
                            </button>
                            <a
                                href={getPdfDownloadUrl(doc.id)}
                                style={{ flex: 1, padding: "4px 0", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", cursor: "pointer", borderRadius: 4, textAlign: "center", textDecoration: "none", color: "#111" }}
                            >
                                ⬇ Lataa
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, background: "#f9fafb" }}>
                {selectedPdf ? (
                    <iframe
                        key={selectedPdf}
                        src={getPdfViewUrl(selectedPdf)}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        title="PDF-katselu"
                    />
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 18 }}>
                        ← Valitse dokumentti listalta
                    </div>
                )}
            </div>
        </div>
    );
}