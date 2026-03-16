import React, { useState, useEffect } from "react";
import "./PdfDocumentBank.css";
import { Document, Page, pdfjs } from "react-pdf";
import { API_BASE_URL, ACCESS_TOKEN_NAME } from "../../constants/apiConstants";
import request from "../../utils/Request";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentBank() {
    const [documents, setDocuments] = useState([]);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

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

    const handleDocumentSelect = (id) => {
        setSelectedPdf(id);
        setPageNumber(1);
        setNumPages(null);
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
            <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 16, overflowY: "auto", flexShrink: 0 }}>
                <h2>📄 Dokumenttipankki</h2>
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
                    <button
                        type="submit"
                        disabled={uploading}
                        style={{ width: "100%", padding: 8, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", borderRadius: 4 }}
                    >
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
                        }}
                    >
                        <div
                            onClick={() => handleDocumentSelect(doc.id)}
                            style={{ fontWeight: 500, marginBottom: 6, cursor: "pointer" }}
                        >
                            📄 {doc.document_name}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => handleDocumentSelect(doc.id)}
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
            <div style={{ flex: 1, background: "#f9fafb", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {selectedPdf ? (
                    <>
                        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: "#f9fafb", zIndex: 10, width: "100%", justifyContent: "center", borderBottom: "1px solid #e5e7eb" }}>
                            <button
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                disabled={pageNumber <= 1}
                                style={{ padding: "4px 12px", cursor: "pointer" }}
                            >
                                ‹ Edellinen
                            </button>
                            <span style={{ fontSize: 14 }}>
                                Sivu {pageNumber} / {numPages ?? "..."}
                            </span>
                            <button
                                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                                disabled={pageNumber >= numPages}
                                style={{ padding: "4px 12px", cursor: "pointer" }}
                            >
                                Seuraava ›
                            </button>
                        </div>
                        <div style={{ padding: 16 }}>
                            <Document
                                file={getPdfViewUrl(selectedPdf)}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={(error) => console.error("PDF load error:", error)}
                                loading={<div style={{ padding: 32 }}>Ladataan PDF...</div>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                            </Document>
                        </div>
                    </>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 18 }}>
                        ← Valitse dokumentti listalta
                    </div>
                )}
            </div>
        </div>
    );
}