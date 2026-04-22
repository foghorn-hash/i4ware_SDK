<template>
    <div class="cv-editor-root">
        <div style="max-width: 960px; margin: 0 auto">

            <div class="mb-4">
                <h1 class="cv-editor-page-title">{{ t('cvEditorPageTitle') }}</h1>
                <p class="cv-editor-page-subtitle">{{ t('cvEditorPageSubtitle') }}</p>
            </div>

            <div v-if="loading" class="loading-screen">
                <img :src="loadingSpinner" alt="Loading..." />
            </div>

            <div v-else class="card shadow-sm border-0">
                <div class="card-body p-4">

                    <nav class="cv-tab-nav">
                        <button v-for="tab in TABS" :key="tab.key"
                            :class="`cv-tab-btn${activeTab === tab.key ? ' active' : ''}`" @click="activeTab = tab.key">
                            {{ tab.label }}
                        </button>
                    </nav>

                    <div class="mt-4">
                        <SummaryTab v-if="activeTab === 'summary'" :data="cvData.summary"
                            @change="v => updateSection('summary', v)" />
                        <SkillsTab v-if="activeTab === 'skills'" :skills="cvData.skills"
                            @change="v => updateSection('skills', v)" />
                        <WorkExperienceTab v-if="activeTab === 'workExperience'" :items="cvData.workExperience"
                            @change="v => updateSection('workExperience', v)" />
                        <EducationTab v-if="activeTab === 'education'" :items="cvData.education"
                            @change="v => updateSection('education', v)" />
                        <AdditionalTrainingTab v-if="activeTab === 'additionalTraining'"
                            :items="cvData.additionalTraining" @change="v => updateSection('additionalTraining', v)" />
                        <ReferencesTab v-if="activeTab === 'references'" :items="cvData.references"
                            @change="v => updateSection('references', v)" />
                    </div>

                    <div class="cv-action-bar">
                        <button class="btn btn-outline-danger me-auto" @click="handleReset">{{ t('cvClearAll')
                            }}</button>
                        <button class="btn btn-secondary" @click="handlePrint">{{ t('cvPrintPdf') }}</button>
                        <button class="btn btn-success" @click="handleSave">{{ t('cvSaveBtn') }}</button>
                    </div>
                </div>
            </div>

            <div class="cv-status-strip mt-3">
                <span><strong>{{ cvData.skills.length }}</strong> {{ t('cvSkillsCount') }}</span>
                <span><strong>{{ cvData.workExperience.length }}</strong> {{ t('cvWorkCount') }}</span>
                <span><strong>{{ cvData.education.length }}</strong> {{ t('cvEduCount') }}</span>
            </div>
        </div>

        <div v-if="showToast" class="cv-toast" :class="{ 'bg-danger border-danger text-white': error }">
            {{ toastMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../constants/apiConstants';
import { emptyState, convertToApiFormat, convertFromApiFormat } from '../composables/useCvHelpers.js';
import SummaryTab from '../components/cv/SummaryTab.vue';
import SkillsTab from '../components/cv/SkillsTab.vue';
import WorkExperienceTab from '../components/cv/WorkExperienceTab.vue';
import EducationTab from '../components/cv/EducationTab.vue';
import AdditionalTrainingTab from '../components/cv/AdditionalTrainingTab.vue';
import ReferencesTab from '../components/cv/ReferencesTab.vue';
import loadingSpinner from '../assets/tube-spinner.svg';
import '../assets/css/CvEditor.css';

const { t } = useI18n();

const activeTab = ref('summary');
const cvData = reactive(emptyState());
const loading = ref(true);
const error = ref(null);
const showToast = ref(false);
const toastMessage = ref('');
let saveTimeout = null;
let autoSaveTimeout = null;

const TABS = computed(() => [
    { key: 'summary', label: t('cvTabSummary') },
    { key: 'skills', label: t('cvTabSkills') },
    { key: 'workExperience', label: t('cvTabWorkExperience') },
    { key: 'education', label: t('cvTabEducation') },
    { key: 'additionalTraining', label: t('cvTabAdditionalTraining') },
    { key: 'references', label: t('cvTabReferences') },
]);

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,
    Accept: 'application/json',
});

const showToastMessage = (msg, isError = false, duration = 2000) => {
    toastMessage.value = msg;
    error.value = isError ? msg : null;
    showToast.value = true;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => { showToast.value = false; }, duration);
};

const applyApiData = (data) => {
    const converted = convertFromApiFormat(data);
    Object.assign(cvData, converted);
};

onMounted(async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/cv`, { headers: authHeaders() });
        if (res.status === 404) {
            Object.assign(cvData, emptyState());
        } else if (!res.ok) {
            throw new Error('Failed to fetch CV data');
        } else {
            applyApiData(await res.json());
        }
    } catch (err) {
        error.value = err.message;
        Object.assign(cvData, emptyState());
    } finally {
        loading.value = false;
    }
});

const updateSection = (section, value) => {
    cvData[section] = value;
};

const formatDate = (d) => {
    if (!d) return '';
    const p = d.split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
};

const handleSave = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/cv`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}`,  // ← must be here
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(convertToApiFormat(cvData)),
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to save CV');
        }
        const responseData = await res.json();
        applyApiData(responseData.data);
        showToastMessage(t('cvChangesSaved') || 'Changes saved successfully');
    } catch (err) {
        showToastMessage(err.message, true, 3000);
    }
};

const handleReset = async () => {
    if (!window.confirm(t('cvConfirmReset') || 'Are you sure you want to clear all data?')) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/cv`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
        if (!res.ok) throw new Error('Failed to delete CV');
        Object.assign(cvData, emptyState());
        activeTab.value = 'summary';
        showToastMessage(t('cvDataCleared') || 'CV data cleared');
    } catch (err) {
        showToastMessage(err.message, true, 3000);
    }
};

const handlePrint = () => {
    handleSave();
    const s = cvData.summary;
    const w = window.open('', '_blank');
    if (!w) return;

    let html = `<html><head><title>CV - ${s.name || 'CV'}</title><style>
    body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; }
    h1 { color: #0d6efd; margin-bottom: 5px; }
    h2 { border-bottom: 2px solid #eee; margin-top: 25px; color: #444; }
    .meta { color: #666; margin-bottom: 20px; }
    .entry { margin-bottom: 15px; }
    .date { font-weight: bold; color: #0d6efd; font-size: 0.9em; }
  </style></head><body>`;

    html += `<h1>${s.name || t('cvResumeTitle')}</h1>`;
    html += `<div class="meta">${s.title || ''}<br>${[s.email, s.phone, s.location].filter(Boolean).join(' | ')}</div>`;
    if (s.text) html += `<h2>${t('cvSummary')}</h2><p>${s.text}</p>`;

    if (cvData.workExperience.length) {
        html += `<h2>${t('cvTabWorkExperience')}</h2>`;
        cvData.workExperience.forEach(i => {
            html += `<div class="entry"><div><strong>${i.role}</strong> - ${i.company}</div>
        <div class="date">${formatDate(i.startDate)} - ${i.current ? t('cvPresent') : formatDate(i.endDate)}</div>
        <div>${i.description}</div></div>`;
        });
    }
    if (cvData.skills.length) {
        html += `<h2>${t('cvTabSkills')}</h2><p>${cvData.skills.map(sk => `${sk.name} (${t(sk.levelKey)})`).join(', ')}</p>`;
    }
    if (cvData.education.length) {
        html += `<h2>${t('cvTabEducation')}</h2>`;
        cvData.education.forEach(i => {
            html += `<div class="entry"><div><strong>${i.degree}</strong> - ${i.institution}</div>
        <div class="date">${formatDate(i.startDate)} - ${formatDate(i.endDate)}</div>
        <div>${i.field}</div></div>`;
        });
    }
    if (cvData.additionalTraining.length) {
        html += `<h2>${t('cvTabAdditionalTraining')}</h2>`;
        cvData.additionalTraining.forEach(i => {
            html += `<div class="entry"><div><strong>${i.course}</strong> - ${i.provider}</div>
        <div class="date">${formatDate(i.startDate)} - ${formatDate(i.endDate)}</div></div>`;
        });
    }
    if (cvData.references.length) {
        html += `<h2>${t('cvTabReferences')}</h2>`;
        cvData.references.forEach(i => {
            html += `<div class="entry"><div><strong>${i.name}</strong> - ${i.title} (${i.company})</div>
        <div>${i.email} | ${i.phone}</div></div>`;
        });
    }

    html += `</body></html>`;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
};

watch(cvData, () => {
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => { handleSave(); }, 60000);
}, { deep: true });
</script>