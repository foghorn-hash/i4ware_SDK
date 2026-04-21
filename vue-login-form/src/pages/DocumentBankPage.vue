<template>
  <div style="display: flex; height: 100vh; font-family: sans-serif;">

    <div style="width: 320px; border-right: 1px solid #ddd; padding: 16px; overflow-y: auto; flex-shrink: 0;">
      <h2>{{ currentTab?.icon }} {{ t('documentBank') }}</h2>

      <div style="display: flex; gap: 4px; margin-bottom: 16px;">
        <button
          v-for="tab in TABS" :key="tab.key"
          @click="switchTab(tab.key)"
          :style="{
            flex: 1, padding: '6px 0', border: '1px solid #d1d5db',
            borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
            background: activeTab === tab.key ? '#2563eb' : '#f3f4f6',
            color: activeTab === tab.key ? '#fff' : '#374151',
          }"
        >
          {{ tab.label }}
        </button>
      </div>

      <form @submit.prevent="handleUpload" style="margin-bottom: 24px;">
        <div style="margin-bottom: 8px;">
          <input
            v-model="documentName"
            :placeholder="t('documentName')"
            required
            style="width: 100%; padding: 8px; box-sizing: border-box;"
          />
        </div>
        <div style="margin-bottom: 8px;">
          <input ref="fileInputRef" type="file" :accept="currentTab.accept" required />
        </div>
        <button
          type="submit"
          :disabled="uploading"
          style="width: 100%; padding: 8px; background: #2563eb; color: #fff; border: none; cursor: pointer; border-radius: 4px;"
        >
          {{ uploading ? t('uploading') : '⬆ ' + t('addDocument') }}
        </button>
      </form>

      <div
        v-for="doc in currentDocs" :key="doc.id"
        style="padding: 10px 12px; margin-bottom: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff;"
      >
        <div
          @click="handleSelect(doc.id)"
          style="font-weight: 500; margin-bottom: 6px; cursor: pointer; color: #000;"
        >
          {{ currentTab.icon }} {{ doc.document_name }}
        </div>
        <div style="display: flex; gap: 8px;">
          <button
            @click="handleSelect(doc.id)"
            style="flex: 1; padding: '4px 0'; font-size: 12px; background: #f3f4f6; border: 1px solid #d1d5db; cursor: pointer; border-radius: 4px;"
          >
            👁 {{ t('showPdf') }}
          </button>
          <button
            @click="handleDownload(doc.id, doc.document_name)"
            style="flex: 1; padding: '4px 0'; font-size: 12px; background: #f3f4f6; border: 1px solid #d1d5db; cursor: pointer; border-radius: 4px;"
          >
            ⬇ {{ t('downloadPdf') }}
          </button>
        </div>
      </div>
    </div>

    <div style="flex: 1; background: #f9fafb; overflow-y: auto; display: flex; flex-direction: column; align-items: center;">

      <template v-if="activeTab === 'pdf' && pdfUrl">
        <div style="padding: 12px 0; display: flex; align-items: center; gap: 12px; position: sticky; top: 0; background: #f9fafb; z-index: 10; width: 100%; justify-content: center; border-bottom: 1px solid #e5e7eb;">
          <button @click="pageNumber = Math.max(1, pageNumber - 1)" :disabled="pageNumber <= 1" style="padding: 4px 12px; cursor: pointer; color: #33353a;">
            {{ t('previousPage') }}
          </button>
          <span style="font-size: 14px; color: #33353a;">
            {{ t('page') }} {{ pageNumber }} / {{ numPages ?? '...' }}
          </span>
          <button @click="pageNumber = Math.min(numPages, pageNumber + 1)" :disabled="pageNumber >= numPages" style="padding: 4px 12px; cursor: pointer; color: #33353a;">
            {{ t('nextPage') }}
          </button>
        </div>
        <div style="padding: 16px;">
          <canvas ref="pdfCanvasRef" style="max-width: 100%;" />
        </div>
      </template>

      <div
        v-if="activeTab === 'word' && wordHtml"
        v-html="wordHtml"
        style="padding: 32px; max-width: 800px; width: 100%; background: #fff; margin: 16px auto; box-shadow: 0 1px 4px rgba(0,0,0,0.08); font-size: 14px; line-height: 1.7; font-family: Calibri, Arial, sans-serif; color: #1a1a1a;"
      />

      <template v-if="activeTab === 'excel' && activeSheet && sheetData[activeSheet]">
        <div style="width: 100%;">
          <div v-if="sheetNames.length > 1" style="display: flex; gap: 4px; padding: 8px 16px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; flex-wrap: wrap;">
            <button
              v-for="name in sheetNames" :key="name"
              @click="activeSheet = name"
              :style="{
                padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '4px',
                cursor: 'pointer', fontSize: '12px',
                background: activeSheet === name ? '#2563eb' : '#fff',
                color: activeSheet === name ? '#fff' : '#374151',
              }"
            >
              {{ name }}
            </button>
          </div>
          <div style="overflow-x: auto; overflow-y: auto; padding: 16px;">
            <table style="border-collapse: collapse; font-size: 13px; white-space: nowrap;">
              <tr v-for="(row, rIdx) in sheetData[activeSheet]" :key="rIdx">
                <td
                  v-for="(cell, cIdx) in row" :key="cIdx"
                  style="border: 1px solid #e5e7eb; padding: 4px 10px; min-width: 80px;"
                >
                  {{ cell.value }}
                </td>
              </tr>
            </table>
          </div>
        </div>
      </template>

      <div
        v-if="!hasContent"
        style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af; font-size: 18px;"
      >
        {{ t('selectDocument') }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import { Workbook } from 'exceljs';
import { API_BASE_URL, ACCESS_TOKEN_NAME } from '../constants/apiConstants';
import '../assets/css/DocumentBank.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const { t, locale } = useI18n();

const TABS = [
  { key: 'pdf',   label: 'PDF',   icon: '📄', accept: '.pdf',  api: 'documentbank' },
  { key: 'word',  label: 'Word',  icon: '📝', accept: '.docx', api: 'wordbank' },
  { key: 'excel', label: 'Excel', icon: '📊', accept: '.xlsx', api: 'excelbank' },
];

const activeTab    = ref('pdf');
const documents    = ref({ pdf: [], word: [], excel: [] });
const uploading    = ref(false);
const documentName = ref('');
const fileInputRef = ref(null);

const pdfUrl      = ref(null);
const numPages    = ref(null);
const pageNumber  = ref(1);
const pdfCanvasRef = ref(null);
let pdfDoc = null;

const wordHtml    = ref(null);
const sheetNames  = ref([]);
const sheetData   = ref({});
const activeSheet = ref(null);

const currentTab  = computed(() => TABS.find(t => t.key === activeTab.value) ?? TABS[0]);
const currentDocs = computed(() => documents.value[activeTab.value] || []);

const hasContent = computed(() =>
  (activeTab.value === 'pdf'   && pdfUrl.value) ||
  (activeTab.value === 'word'  && wordHtml.value) ||
  (activeTab.value === 'excel' && activeSheet.value && sheetData.value[activeSheet.value])
);

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
});

onMounted(() => {
  const lang = new URLSearchParams(window.location.search).get('lang');
  if (lang && ['en', 'fi', 'sv'].includes(lang)) locale.value = lang;
  fetchDocuments();
});

const fetchDocuments = async () => {
  try {
    const tab = currentTab.value;
    const res = await axios.get(`${API_BASE_URL}/api/${tab.api}`, { headers: authHeaders() });
    documents.value[activeTab.value] = res.data;
  } catch (error) {
    console.error('Fetch error:', error?.response?.data ?? error);
  }
};

const switchTab = (key) => {
  activeTab.value = key;
  clearViewer();
};

watch(activeTab, fetchDocuments);

const clearViewer = () => {
  pdfUrl.value    = null;
  wordHtml.value  = null;
  sheetNames.value = [];
  sheetData.value  = {};
  activeSheet.value = null;
  pageNumber.value  = 1;
  numPages.value    = null;
  pdfDoc = null;
};

const renderPdfPage = async (num) => {
  if (!pdfDoc) return;
  await nextTick();
  const page = await pdfDoc.getPage(num);
  const viewport = page.getViewport({ scale: 1.5 });
  const canvas = pdfCanvasRef.value;
  if (!canvas) return;
  canvas.width  = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
};

watch(pageNumber, renderPdfPage);

const handleUpload = async () => {
  uploading.value = true;
  const tab = currentTab.value;
  const formData = new FormData();
  formData.append('document_name', documentName.value);
  formData.append('file', fileInputRef.value.files[0]);

  try {
    const res = await axios.post(`${API_BASE_URL}/api/${tab.api}/upload`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    });
    documents.value[activeTab.value] = [res.data.document, ...documents.value[activeTab.value]];
    documentName.value = '';
    fileInputRef.value.value = '';
  } catch (error) {
    console.error('Upload error:', error?.response?.data ?? error);
    alert(t('uploadError') + (error?.response?.data?.message ?? t('unknownError')));
  } finally {
    uploading.value = false;
  }
};

const handleDownload = async (id, name) => {
  const tab = currentTab.value;
  const ext = tab.accept.replace('.', '');
  try {
    const res = await axios.get(`${API_BASE_URL}/api/${tab.api}/download/${id}`, {
      headers: authHeaders(), responseType: 'blob',
    });
    const blobUrl = URL.createObjectURL(res.data);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${name}.${ext}`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
  }
};

const handleSelectPdf = async (id) => {
  clearViewer();
  try {
    const res = await axios.get(`${API_BASE_URL}/api/documentbank/view/${id}`, {
      headers: authHeaders(), responseType: 'blob',
    });
    const url = URL.createObjectURL(res.data);
    pdfUrl.value = url;
    pdfDoc = await pdfjsLib.getDocument(url).promise;
    numPages.value = pdfDoc.numPages;
    pageNumber.value = 1;
    await renderPdfPage(1);
  } catch (error) {
    console.error('PDF load error:', error);
  }
};

const handleSelectWord = async (id) => {
  clearViewer();
  try {
    const res = await axios.get(`${API_BASE_URL}/api/wordbank/view/${id}`, {
      headers: authHeaders(), responseType: 'arraybuffer',
    });
    const result = await mammoth.convertToHtml(
      { arrayBuffer: res.data },
      { styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Normal'] => p:fresh",
      ]}
    );
    wordHtml.value = result.value;
  } catch (error) {
    console.error('Word load error:', error);
  }
};

const handleSelectExcel = async (id) => {
  clearViewer();
  try {
    const res = await axios.get(`${API_BASE_URL}/api/excelbank/view/${id}`, {
      headers: authHeaders(), responseType: 'arraybuffer',
    });
    const workbook = XLSX.read(res.data, { type: 'array' });
    const names = workbook.SheetNames;
    const data = {};
    names.forEach(name => {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '' });
      data[name] = rows.map(row =>
        row.map(cell => ({ value: cell !== null && cell !== undefined ? String(cell) : '' }))
      );
    });
    sheetNames.value  = names;
    sheetData.value   = data;
    activeSheet.value = names[0];
  } catch (error) {
    console.error('Excel load error:', error);
  }
};

const handleSelect = (id) => {
  if (activeTab.value === 'pdf')   handleSelectPdf(id);
  if (activeTab.value === 'word')  handleSelectWord(id);
  if (activeTab.value === 'excel') handleSelectExcel(id);
};

</script>