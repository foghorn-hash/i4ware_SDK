import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import './CvEditor.css';

const emptyState = () => ({
    summary: { text: '', githubUrl: '', name: '', title: '', email: '', phone: '', location: '' },
    skills: [],
    workExperience: [],
    education: [],
    additionalTraining: [],
    references: []
});

// Helper functions to convert between frontend and backend formats
const levelKeyToLevel = (levelKey) => {
    const map = {
        'cvLevel1': 'beginner',
        'cvLevel2': 'intermediate',
        'cvLevel3': 'intermediate',
        'cvLevel4': 'advanced',
        'cvLevel5': 'expert'
    };
    return map[levelKey] || 'intermediate';
};

const levelToLevelKey = (level) => {
    const map = {
        'beginner': 'cvLevel1',
        'intermediate': 'cvLevel3',
        'advanced': 'cvLevel4',
        'expert': 'cvLevel5'
    };
    return map[level] || 'cvLevel3';
};

const convertToApiFormat = (cvData) => {
    return {
        name: cvData.summary.name || null,
        title: cvData.summary.title || null,
        email: cvData.summary.email || null,
        phone: cvData.summary.phone || null,
        location: cvData.summary.location || null,
        summary: cvData.summary.text || null,
        github_url: cvData.summary.githubUrl || null,
        skills: cvData.skills.map((s, idx) => ({
            id: typeof s.id === 'number' ? s.id : undefined,
            name: s.name,
            level: levelKeyToLevel(s.levelKey),
            order: idx
        })),
        workExperience: cvData.workExperience.map((w, idx) => ({
            id: typeof w.id === 'number' ? w.id : undefined,
            company: w.company,
            role: w.role,
            start_date: w.startDate || null,
            end_date: w.endDate || null,
            currently_employed: w.current || false,
            description: w.description || null,
            order: idx
        })),
        education: cvData.education.map((e, idx) => ({
            id: typeof e.id === 'number' ? e.id : undefined,
            institution: e.institution,
            degree: e.degree || null,
            field_of_study: e.field || null,
            start_date: e.startDate || null,
            end_date: e.endDate || null,
            order: idx
        })),
        additionalTraining: cvData.additionalTraining.map((t, idx) => ({
            id: typeof t.id === 'number' ? t.id : undefined,
            name: t.course,
            provider: t.provider || null,
            start_date: t.startDate || null,
            end_date: t.endDate || null,
            order: idx
        })),
        references: cvData.references.map((r, idx) => ({
            id: typeof r.id === 'number' ? r.id : undefined,
            name: r.name,
            title: r.title || null,
            company: r.company || null,
            email: r.email || null,
            phone: r.phone || null,
            order: idx
        }))
    };
};

const extractDate = (isoString) => isoString ? isoString.split('T')[0] : '';

const convertFromApiFormat = (apiData) => {
    if (!apiData) return emptyState();

    return {
        summary: {
            text: apiData.summary || '',
            githubUrl: apiData.github_url || '',
            name: apiData.name || '',
            title: apiData.title || '',
            email: apiData.email || '',
            phone: apiData.phone || '',
            location: apiData.location || ''
        },
        skills: (apiData.skills || []).map(s => ({
            id: s.id || `_${Math.random().toString(36).slice(2, 9)}`,
            name: s.name,
            levelKey: levelToLevelKey(s.level)
        })),
        workExperience: (apiData.experiences || []).map(w => ({
            id: w.id || `_${Math.random().toString(36).slice(2, 9)}`,
            company: w.company,
            role: w.role,
            startDate: extractDate(w.start_date),
            endDate: extractDate(w.end_date),
            current: w.currently_employed || false,
            description: w.description || ''
        })),
        education: (apiData.educations || []).map(e => ({
            id: e.id || `_${Math.random().toString(36).slice(2, 9)}`,
            institution: e.institution,
            degree: e.degree || '',
            field: e.field_of_study || '',
            startDate: extractDate(e.start_date),
            endDate: extractDate(e.end_date)
        })),
        additionalTraining: (apiData.trainings || []).map(t => ({
            id: t.id || `_${Math.random().toString(36).slice(2, 9)}`,
            course: t.name,
            provider: t.provider || '',
            startDate: extractDate(t.start_date),
            endDate: extractDate(t.end_date)
        })),
        references: (apiData.references || []).map(r => ({
            id: r.id || `_${Math.random().toString(36).slice(2, 9)}`,
            name: r.name,
            title: r.title || '',
            company: r.company || '',
            email: r.email || '',
            phone: r.phone || ''
        }))
    };
};

const genId = () => `_${Math.random().toString(36).slice(2, 9)}`;

// --- Sub-components ---

function SummaryTab({ data, onChange }) {
    const { t } = useTranslation();
    const handleField = (field, value) => onChange({ ...data, [field]: value });
    return (
        <div>
            <div className="cv-section-heading">{t('cvBasicInfo')}</div>
            <div className="row mb-3">
                <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <label className="form-label">{t('cvName')}</label>
                    <input className="form-control" placeholder={t('cvNamePlaceholder')} value={data.name} onChange={e => handleField('name', e.target.value)} />
                </div>
                <div className="col-12 col-md-6">
                    <label className="form-label">{t('cvTitle')}</label>
                    <input className="form-control" placeholder={t('cvTitlePlaceholder')} value={data.title} onChange={e => handleField('title', e.target.value)} />
                </div>
            </div>
            <div className="row mb-4">
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                    <label className="form-label">{t('email')}</label>
                    <input type="email" className="form-control" placeholder={t('cvEmailPlaceholder')} value={data.email} onChange={e => handleField('email', e.target.value)} />
                </div>
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                    <label className="form-label">{t('cvPhone')}</label>
                    <input className="form-control" placeholder={t('cvPhonePlaceholder')} value={data.phone} onChange={e => handleField('phone', e.target.value)} />
                </div>
                <div className="col-12 col-md-4">
                    <label className="form-label">{t('cvLocation')}</label>
                    <input className="form-control" placeholder={t('cvLocationPlaceholder')} value={data.location} onChange={e => handleField('location', e.target.value)} />
                </div>
            </div>
            <div className="cv-section-heading">{t('cvSummary')}</div>
            <textarea className="form-control mb-4" rows={5} placeholder={t('cvSummaryPlaceholder')} value={data.text} onChange={e => handleField('text', e.target.value)} />
            <div className="cv-section-heading">{t('cvGithub')}</div>
            <input className="form-control" placeholder={t('cvGithubPlaceholder')} value={data.githubUrl} onChange={e => handleField('githubUrl', e.target.value)} />
        </div>
    );
}

function SkillsTab({ skills, onChange }) {
    const { t } = useTranslation();
    const [newSkill, setNewSkill] = useState('');
    const [newLevelKey, setNewLevelKey] = useState('cvLevel3');

    const add = () => {
        if (!newSkill.trim()) return;
        onChange([...skills, { id: `_${Math.random().toString(36).slice(2, 9)}`, name: newSkill.trim(), levelKey: newLevelKey }]);
        setNewSkill('');
    };

    return (
        <div>
            <div className="cv-section-heading">{t('cvSkillsHeading')}</div>
            <div className="cv-skills-container mb-3">
                {skills.map(s => (
                    <span key={s.id} className="cv-skill-tag">
                        {s.name}
                        <span className="cv-skill-level-badge">{t(s.levelKey)}</span>
                        <button className="cv-skill-remove" onClick={() => onChange(skills.filter(x => x.id !== s.id))}>x</button>
                    </span>
                ))}
            </div>
            <div className="d-flex gap-2">
                <input className="form-control" placeholder={t('cvAddSkillPlaceholder')} value={newSkill} onChange={e => setNewSkill(e.target.value)} />
                <select className="form-select" style={{ width: 'auto' }} value={newLevelKey} onChange={e => setNewLevelKey(e.target.value)}>
                    <option value="cvLevel1">{t('cvLevel1')}</option>
                    <option value="cvLevel2">{t('cvLevel2')}</option>
                    <option value="cvLevel3">{t('cvLevel3')}</option>
                    <option value="cvLevel4">{t('cvLevel4')}</option>
                    <option value="cvLevel5">{t('cvLevel5')}</option>
                </select>
                <button className="btn btn-primary" onClick={add}>{t('cvAdd')}</button>
            </div>
        </div>
    );
}

function WorkExperienceTab({ items, onChange }) {
    const { t } = useTranslation();
    const add = () => onChange([...items, { id: `_${Math.random().toString(36).slice(2, 9)}`, company: '', role: '', startDate: '', endDate: '', current: false, description: '' }]);
    const update = (id, f, v) => onChange(items.map(i => i.id === id ? { ...i, [f]: v } : i));
    return (
        <div>
            <div className="cv-section-heading">{t('cvTabWorkExperience')}</div>
            {items.map((it, idx) => (
                <div key={it.id} className="cv-entry-card">
                    <div className="cv-entry-number">{idx + 1}</div>
                    <button className="btn btn-sm btn-outline-danger float-end" onClick={() => onChange(items.filter(x => x.id !== it.id))}>{t('cvDelete')}</button>
                    <div className="row g-4 mt-1">
                        <div className="col-md-6"><label className="form-label">{t('cvCompany')}</label><input className="form-control" value={it.company} onChange={e => update(it.id, 'company', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvRole')}</label><input className="form-control" value={it.role} onChange={e => update(it.id, 'role', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvStartDate')}</label><input type="date" className="form-control" value={it.startDate} onChange={e => update(it.id, 'startDate', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvEndDate')}</label><input type="date" className="form-control" value={it.endDate} disabled={it.current} onChange={e => update(it.id, 'endDate', e.target.value)} /></div>
                        <div className="col-12 mt-2"><label className="form-check-label d-flex align-items-center gap-2"><input type="checkbox" className="form-check-input mt-0" checked={it.current} onChange={e => update(it.id, 'current', e.target.checked)} /> {t('cvCurrentJob')}</label></div>
                        <div className="col-12"><label className="form-label">{t('cvDescription')}</label><textarea className="form-control" rows={3} value={it.description} onChange={e => update(it.id, 'description', e.target.value)} /></div>
                    </div>
                </div>
            ))}
            <button className="btn btn-outline-primary" onClick={add}>{t('cvAddExperience')}</button>
        </div>
    );
}

function EducationTab({ items, onChange }) {
    const { t } = useTranslation();
    const add = () => onChange([...items, { id: `_${Math.random().toString(36).slice(2, 9)}`, institution: '', degree: '', field: '', startDate: '', endDate: '' }]);
    const update = (id, f, v) => onChange(items.map(i => i.id === id ? { ...i, [f]: v } : i));
    return (
        <div>
            <div className="cv-section-heading">{t('cvTabEducation')}</div>
            {items.map((it, idx) => (
                <div key={it.id} className="cv-entry-card">
                    <div className="cv-entry-number">{idx + 1}</div>
                    <button className="btn btn-sm btn-outline-danger float-end" onClick={() => onChange(items.filter(x => x.id !== it.id))}>{t('cvDelete')}</button>
                    <div className="row g-4 mt-1">
                        <div className="col-md-12"><label className="form-label">{t('cvInstitution')}</label><input className="form-control" value={it.institution} onChange={e => update(it.id, 'institution', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvDegree')}</label><input className="form-control" value={it.degree} onChange={e => update(it.id, 'degree', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvField')}</label><input className="form-control" value={it.field} onChange={e => update(it.id, 'field', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvStartDate')}</label><input type="date" className="form-control" value={it.startDate} onChange={e => update(it.id, 'startDate', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvGraduated')}</label><input type="date" className="form-control" value={it.endDate} onChange={e => update(it.id, 'endDate', e.target.value)} /></div>
                    </div>
                </div>
            ))}
            <button className="btn btn-outline-primary" onClick={add}>{t('cvAddEducation')}</button>
        </div>
    );
}

function AdditionalTrainingTab({ items, onChange }) {
    const { t } = useTranslation();
    const add = () => onChange([...items, { id: `_${Math.random().toString(36).slice(2, 9)}`, course: '', provider: '', startDate: '', endDate: '' }]);
    const update = (id, f, v) => onChange(items.map(i => i.id === id ? { ...i, [f]: v } : i));
    return (
        <div>
            <div className="cv-section-heading">{t('cvTabAdditionalTraining')}</div>
            {items.map((it, idx) => (
                <div key={it.id} className="cv-entry-card">
                    <div className="cv-entry-number">{idx + 1}</div>
                    <button className="btn btn-sm btn-outline-danger float-end" onClick={() => onChange(items.filter(x => x.id !== it.id))}>{t('cvDelete')}</button>
                    <div className="row g-4 mt-1">
                        <div className="col-md-12"><label className="form-label">{t('cvTrainingCourse')}</label><input className="form-control" value={it.course} onChange={e => update(it.id, 'course', e.target.value)} /></div>
                        <div className="col-md-12"><label className="form-label">{t('cvTrainingProvider')}</label><input className="form-control" value={it.provider} onChange={e => update(it.id, 'provider', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvStartDate')}</label><input type="date" className="form-control" value={it.startDate} onChange={e => update(it.id, 'startDate', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvEndDate')}</label><input type="date" className="form-control" value={it.endDate} onChange={e => update(it.id, 'endDate', e.target.value)} /></div>
                    </div>
                </div>
            ))}
            <button className="btn btn-outline-primary" onClick={add}>{t('cvAddRow')}</button>
        </div>
    );
}

function ReferencesTab({ items, onChange }) {
    const { t } = useTranslation();
    const add = () => onChange([...items, { id: `_${Math.random().toString(36).slice(2, 9)}`, name: '', title: '', company: '', email: '', phone: '' }]);
    const update = (id, f, v) => onChange(items.map(i => i.id === id ? { ...i, [f]: v } : i));
    return (
        <div>
            <div className="cv-section-heading">{t('cvTabReferences')}</div>
            {items.map((it, idx) => (
                <div key={it.id} className="cv-entry-card">
                    <div className="cv-entry-number">{idx + 1}</div>
                    <button className="btn btn-sm btn-outline-danger float-end" onClick={() => onChange(items.filter(x => x.id !== it.id))}>{t('cvDelete')}</button>
                    <div className="row g-4 mt-1">
                        <div className="col-md-6"><label className="form-label">{t('cvName')}</label><input className="form-control" value={it.name} onChange={e => update(it.id, 'name', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvRefTitle')}</label><input className="form-control" value={it.title} onChange={e => update(it.id, 'title', e.target.value)} /></div>
                        <div className="col-md-12"><label className="form-label">{t('cvCompany')}</label><input className="form-control" value={it.company} onChange={e => update(it.id, 'company', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('email')}</label><input className="form-control" value={it.email} onChange={e => update(it.id, 'email', e.target.value)} /></div>
                        <div className="col-md-6"><label className="form-label">{t('cvPhone')}</label><input className="form-control" value={it.phone} onChange={e => update(it.id, 'phone', e.target.value)} /></div>
                    </div>
                </div>
            ))}
            <button className="btn btn-outline-primary" onClick={add}>{t('cvAddReference')}</button>
        </div>
    );
}

// --- Main Component ---

export default function CvEditor() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('summary');
    const [cvData, setCvData] = useState(emptyState());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const saveTimeoutRef = useRef(null);

    const TABS = [
        { key: 'summary', label: t('cvTabSummary') },
        { key: 'skills', label: t('cvTabSkills') },
        { key: 'workExperience', label: t('cvTabWorkExperience') },
        { key: 'education', label: t('cvTabEducation') },
        { key: 'additionalTraining', label: t('cvTabAdditionalTraining') },
        { key: 'references', label: t('cvTabReferences') },
    ];

    // Fetch CV data from API on component mount
    useEffect(() => {
        const fetchCv = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem(ACCESS_TOKEN_NAME);
                const response = await fetch(`${API_BASE_URL}/api/cv`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.status === 404) {
                    // No CV found yet, use empty state
                    setCvData(emptyState());
                } else if (!response.ok) {
                    throw new Error('Failed to fetch CV data');
                } else {
                    const data = await response.json();
                    setCvData(convertFromApiFormat(data));
                }
            } catch (err) {
                setError(err.message);
                setCvData(emptyState());
            } finally {
                setLoading(false);
            }
        };

        fetchCv();
    }, []);

    const updateSection = useCallback((section, value) => {
        setCvData(prev => ({ ...prev, [section]: value }));
    }, []);

    const formatDate = (d) => {
        if (!d) return '';
        const p = d.split('-');
        return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : d;
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem(ACCESS_TOKEN_NAME);
            const apiFormat = convertToApiFormat(cvData);

            const response = await fetch(`${API_BASE_URL}/api/cv`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(apiFormat)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to save CV');
            }

            const responseData = await response.json();
            setCvData(convertFromApiFormat(responseData.data));
            setError(null);
            setToastMessage(t('cvChangesSaved') || 'Changes saved successfully');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            setError(err.message);
            setToastMessage(err.message);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }
    };

    const handleReset = async () => {
        if (window.confirm(t('cvConfirmReset') || 'Are you sure you want to clear all data?')) {
            try {
                const token = localStorage.getItem(ACCESS_TOKEN_NAME);
                const response = await fetch(`${API_BASE_URL}/api/cv`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete CV');
                }

                setCvData(emptyState());
                setActiveTab('summary');
                setError(null);
                setToastMessage(t('cvDataCleared') || 'CV data cleared');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 2000);
            } catch (err) {
                setError(err.message);
                setToastMessage(err.message);
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            }
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

    // Auto-save with debouncing
    useEffect(() => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            handleSave();
        }, 60000);

        return () => {
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        };
    }, [cvData]);

    return (
        <div className="cv-editor-root">
            <Container style={{ maxWidth: 960 }}>
                <div className="mb-4">
                    <h1 className="cv-editor-page-title">{t('cvEditorPageTitle')}</h1>
                    <p className="cv-editor-page-subtitle">{t('cvEditorPageSubtitle')}</p>
                </div>

                <div className="card shadow-sm border-0">
                    <div className="card-body p-4">
                        <nav className="cv-tab-nav">
                            {TABS.map(tOption => (
                                <button key={tOption.key} className={`cv-tab-btn${activeTab === tOption.key ? ' active' : ''}`} onClick={() => setActiveTab(tOption.key)}>{tOption.label}</button>
                            ))}
                        </nav>

                        <div className="mt-4">
                            {activeTab === 'summary' && <SummaryTab data={cvData.summary} onChange={v => updateSection('summary', v)} />}
                            {activeTab === 'skills' && <SkillsTab skills={cvData.skills} onChange={v => updateSection('skills', v)} />}
                            {activeTab === 'workExperience' && <WorkExperienceTab items={cvData.workExperience} onChange={v => updateSection('workExperience', v)} />}
                            {activeTab === 'education' && <EducationTab items={cvData.education} onChange={v => updateSection('education', v)} />}
                            {activeTab === 'additionalTraining' && <AdditionalTrainingTab items={cvData.additionalTraining} onChange={v => updateSection('additionalTraining', v)} />}
                            {activeTab === 'references' && <ReferencesTab items={cvData.references} onChange={v => updateSection('references', v)} />}
                        </div>

                        <div className="cv-action-bar">
                            <button className="btn btn-outline-danger me-auto" onClick={handleReset}>{t('cvClearAll') || 'Clear All'}</button>
                            <button className="btn btn-secondary" onClick={handlePrint}>{t('cvPrintPdf')}</button>
                            <button className="btn btn-success" onClick={handleSave}>{t('cvSaveBtn')}</button>
                        </div>
                    </div>
                </div>

                <div className="cv-status-strip mt-3">
                    <span><strong>{cvData.skills.length}</strong> {t('cvSkillsCount')}</span>
                    <span><strong>{cvData.workExperience.length}</strong> {t('cvWorkCount')}</span>
                    <span><strong>{cvData.education.length}</strong> {t('cvEduCount')}</span>
                </div>
            </Container>
            {showToast && <div className={`cv-toast ${error ? 'error bg-danger border-danger text-white' : ''}`} style={error ? { borderColor: "red", backgroundColor: "#dc3545" } : {}}>{toastMessage}</div>}
        </div>
    );
}