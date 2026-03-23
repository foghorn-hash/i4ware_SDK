import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import * as mammoth from "mammoth";
import * as XLSX from "xlsx";
import Spreadsheet from "react-spreadsheet";
import request from "../../utils/Request";
import { useTranslation } from "react-i18next";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./PdfDocumentBank.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const TABS = [
    { key: "pdf",   label: "PDF",   icon: "📄", accept: ".pdf",  api: "documentbank" },
    { key: "word",  label: "Word",  icon: "📝", accept: ".docx", api: "wordbank" },
    { key: "excel", label: "Excel", icon: "📊", accept: ".xlsx", api: "excelbank" },
];

export default function DocumentBank() {
    const { t, i18n } = useTranslation();

    const [activeTab, setActiveTab]     = useState("pdf");
    const [documents, setDocuments]     = useState({ pdf: [], word: [], excel: [] });
    const [uploading, setUploading]     = useState(false);

    const [pdfUrl, setPdfUrl]           = useState(null);
    const [numPages, setNumPages]       = useState(null);
    const [pageNumber, setPageNumber]   = useState(1);

    const [wordHtml, setWordHtml]       = useState(null);

    const [sheetNames, setSheetNames]   = useState([]);
    const [sheetData, setSheetData]     = useState({});
    const [activeSheet, setActiveSheet] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get("lang");
        if (langFromUrl && ["en", "fi", "sv"].includes(langFromUrl)) {
            i18n.changeLanguage(langFromUrl);
        }
    }, [i18n]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const tab = TABS.find((t) => t.key === activeTab);
                const res = await request().get(`/api/${tab.api}`);
                setDocuments((prev) => ({ ...prev, [activeTab]: res.data }));
            } catch (error) {
                console.error("Fetch error:", error?.response?.data ?? error);
            }
        };
        fetchDocuments();
    }, [activeTab]);

    const clearViewer = () => {
        setPdfUrl(null);
        setWordHtml(null);
        setSheetNames([]);
        setSheetData({});
        setActiveSheet(null);
        setPageNumber(1);
        setNumPages(null);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        const tab = TABS.find((t) => t.key === activeTab);
        const formData = new FormData(e.target);

        try {
            const res = await request().post(`/api/${tab.api}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocuments((prev) => ({
                ...prev,
                [activeTab]: [res.data.document, ...prev[activeTab]],
            }));
            e.target.reset();
        } catch (error) {
            console.error("Upload error:", error?.response?.data ?? error);
            alert(t("uploadError") + (error?.response?.data?.message ?? t("unknownError")));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id, documentName) => {
        const tab = TABS.find((t) => t.key === activeTab);
        const ext = tab.accept.replace(".", "");
        try {
            const res = await request().get(`/api/${tab.api}/download/${id}`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `${documentName}.${ext}`;
            link.click();
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    const handleSelectPdf = async (id) => {
        clearViewer();
        try {
            const res = await request().get(`/api/documentbank/view/${id}`, { responseType: "blob" });
            setPdfUrl(URL.createObjectURL(res.data));
        } catch (error) {
            console.error("PDF load error:", error);
        }
    };

    const handleSelectWord = async (id) => {
        clearViewer();
        try {
            const res = await request().get(`/api/wordbank/view/${id}`, { responseType: "arraybuffer" });
            const result = await mammoth.convertToHtml(
                { arrayBuffer: res.data },
                {
                    styleMap: [
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Normal'] => p:fresh",
                    ]
                }
            );
            setWordHtml(result.value);
        } catch (error) {
            console.error("Word load error:", error);
        }
    };

    const handleSelectExcel = async (id) => {
        clearViewer();
        try {
            const res = await request().get(`/api/excelbank/view/${id}`, { responseType: "arraybuffer" });
            const workbook = XLSX.read(res.data, { type: "array" });
            const names = workbook.SheetNames;
            const data = {};
            names.forEach((name) => {
                const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: "" });
                data[name] = rows.map((row) =>
                    row.map((cell) => ({ value: cell !== null && cell !== undefined ? String(cell) : "" }))
                );
            });
            setSheetNames(names);
            setSheetData(data);
            setActiveSheet(names[0]);
        } catch (error) {
            console.error("Excel load error:", error);
        }
    };

    const handleSelect = (id) => {
        if (activeTab === "pdf")   handleSelectPdf(id);
        if (activeTab === "word")  handleSelectWord(id);
        if (activeTab === "excel") handleSelectExcel(id);
    };

    const currentDocs = documents[activeTab] || [];
    const currentTab  = TABS.find((t) => t.key === activeTab);

    const hasContent =
        (activeTab === "pdf"   && pdfUrl) ||
        (activeTab === "word"  && wordHtml) ||
        (activeTab === "excel" && activeSheet && sheetData[activeSheet]);

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
            <div style={{ width: 320, borderRight: "1px solid #ddd", padding: 16, overflowY: "auto", flexShrink: 0 }}>
                <h2>{currentTab.icon} {t("documentBank")}</h2>
                <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); clearViewer(); }}
                            style={{
                                flex: 1,
                                padding: "6px 0",
                                border: "1px solid #d1d5db",
                                borderRadius: 4,
                                cursor: "pointer",
                                fontSize: 13,
                                background: activeTab === tab.key ? "#2563eb" : "#f3f4f6",
                                color: activeTab === tab.key ? "#fff" : "#374151",
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

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
                        <input name="file" type="file" accept={currentTab.accept} required />
                    </div>
                    <button
                        type="submit"
                        disabled={uploading}
                        style={{ width: "100%", padding: 8, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer", borderRadius: 4 }}
                    >
                        {uploading ? t("uploading") : "⬆ " + t("addDocument")}
                    </button>
                </form>

                {/* Dokumenttilista */}
                {currentDocs.map((doc) => (
                    <div
                        key={doc.id}
                        style={{ padding: "10px 12px", marginBottom: 8, border: "1px solid #e5e7eb", borderRadius: 6, background: "#fff" }}
                    >
                        <div
                            onClick={() => handleSelect(doc.id)}
                            style={{ fontWeight: 500, marginBottom: 6, cursor: "pointer", color: "#000000" }}
                        >
                            {currentTab.icon} {doc.document_name}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => handleSelect(doc.id)}
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

            {/* Viewer alue */}
            <div style={{ flex: 1, background: "#f9fafb", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: "center" }}>

                {/* PDF */}
                {activeTab === "pdf" && pdfUrl && (
                    <>
                        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, background: "#f9fafb", zIndex: 10, width: "100%", justifyContent: "center", borderBottom: "1px solid #e5e7eb" }}>
                            <button onClick={() => setPageNumber((p) => Math.max(1, p - 1))} disabled={pageNumber <= 1} style={{ padding: "4px 12px", cursor: "pointer", color: "#33353a" }}>
                                {t("previousPage")}
                            </button>
                            <span style={{ fontSize: 14, color: "#33353a" }}>
                                {t("page")} {pageNumber} / {numPages ?? "..."}
                            </span>
                            <button onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages} style={{ padding: "4px 12px", cursor: "pointer", color: "#33353a" }}>
                                {t("nextPage")}
                            </button>
                        </div>
                        <div style={{ padding: 16 }}>
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                onLoadError={(error) => console.error("PDF load error:", error)}
                                loading={<div style={{ padding: 32 }}>{t("loadingPdf")}</div>}
                            >
                                <Page pageNumber={pageNumber} renderTextLayer={true} renderAnnotationLayer={true} />
                            </Document>
                        </div>
                    </>
                )}

                {/* Word */}
                {activeTab === "word" && wordHtml && (
                    <div
                        dangerouslySetInnerHTML={{ __html: wordHtml }}
                        style={{ padding: 32, maxWidth: 800, width: "100%", background: "#fff", margin: "16px auto", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", fontSize: 14, lineHeight: 1.7, fontFamily: "Calibri, Arial, sans-serif", color: "#1a1a1a" }}
                    />
                )}

                {/* Excel */}
                {activeTab === "excel" && activeSheet && sheetData[activeSheet] && (
                    <div style={{ width: "100%" }}>
                        {sheetNames.length > 1 && (
                            <div style={{ display: "flex", gap: 4, padding: "8px 16px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb", flexWrap: "wrap" }}>
                                {sheetNames.map((name) => (
                                    <button
                                        key={name}
                                        onClick={() => setActiveSheet(name)}
                                        style={{ padding: "4px 12px", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", fontSize: 12, background: activeSheet === name ? "#2563eb" : "#fff", color: activeSheet === name ? "#fff" : "#374151" }}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div style={{ overflowX: "auto", overflowY: "auto", padding: 16 }}>
                            <Spreadsheet data={sheetData[activeSheet]} onChange={() => {}} />
                        </div>
                    </div>
                )}
                {!hasContent && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#9ca3af", fontSize: 18 }}>
                        {t("selectDocument")}
                    </div>
                )}
            </div>
        </div>
    );
}