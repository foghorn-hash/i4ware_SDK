import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import request from "../../utils/Request";
import { useTranslation } from "react-i18next";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DocumentBank() {
    const { t, i18n } = useTranslation();

    const [documents, setDocuments] = useState([]);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get("lang");
        if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
            i18n.changeLanguage(langFromUrl);
        }
    }, [i18n]);

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
            alert(t("uploadError") + (error?.response?.data?.message ?? t("unknownError")));
        } finally {
            setUploading(false);
        }
    };

    const handleSelectPdf = async (id) => {
        setSelectedPdfUrl(null);
        setPageNumber(1);
        setNumPages(null);

        try {
            const res = await request().get(`/api/documentbank/view/${id}`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(res.data);
            setSelectedPdfUrl(blobUrl);
        } catch (error) {
            console.error("PDF load error:", error);
        }
    };

    const handleDownload = async (id, documentName) => {
        try {
            const res = await request().get(`/api/documentbank/download/${id}`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = documentName + ".pdf";
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
            {/* Vasen palkki */}
            <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 16, overflowY: "auto", flexShrink: 0 }}>
                <h2>📄 {t("documentBank")}</h2>

                {/* PDF-lisäyslomake */}
                <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
                    <div style={{ marginBottom: 8 }}>
                        <input
                            name="document_name"
                            placeholder={t("documentName")}
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
                        {uploading ? t("uploading") : "⬆ " + t("addPdf")}
                    </button>
                </form>

                {/* Dokumenttilista */}
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        style={{
                            padding: "10px 12px",
                            marginBottom: 8,
                            border: "1px solid #e5e7eb",
                            borderRadius: 6,
                            background: "#fff",
                        }}
                    >
                        <div
                            onClick={() => handleSelectPdf(doc.id)}
                            style={{ fontWeight: 500, marginBottom: 6, cursor: "pointer", color: "#000000"}}
                        >
                            📄 {doc.document_name}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => handleSelectPdf(doc.id)}
                                style={{ flex: 1, padding: "4px 0", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", cursor: "pointer", borderRadius: 4 }}
                            >
                                👁 {t("showPdf")}
                            </button>
                            <button
                                onClick={() => handleDownload(doc.id, doc.document_name)}
                                style={{ flex: 1, padding: "4px 0", fontSize: 12, background: "#f3f4f6", border: "1px solid #d1d5db", cursor: "pointer", borderRadius: 4 }}
                            >
                                ⬇ {t("downloadPdf")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* PDF-katselu */}
            <div style={{ flex: 1, background: "#f9fafb", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                {selectedPdfUrl ? (
                    <>
                        {/* Sivunvaihto */}
                        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: "#f9fafb", zIndex: 10, width: "100%", justifyContent: "center", borderBottom: "1px solid #e5e7eb" }}>
                            <button
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                disabled={pageNumber <= 1}
                                style={{ padding: "4px 12px", cursor: "pointer", color: "#33353a" }}
                            >
                                {t("previousPage")}
                            </button>
                            <span style={{ fontSize: 14, color: "#33353a" }}>
                                {t("page")} {pageNumber} / {numPages ?? "..."}
                            </span>
                            <button
                                onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                                disabled={pageNumber >= numPages}
                                style={{ padding: "4px 12px", cursor: "pointer", color: "#33353a" }}
                            >
                                {t("nextPage")}
                            </button>
                        </div>

                        {/* PDF-näyttö */}
                        <div style={{ padding: 16 }}>
                            <Document
                                file={selectedPdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={(error) => console.error("PDF load error:", error)}
                                loading={<div style={{ padding: 32 }}>{t("loadingPdf")}</div>}
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
                        {t("selectDocument")}
                    </div>
                )}
            </div>
        </div>
    );
}