export const emptyState = () => ({
  summary: { text: '', githubUrl: '', name: '', title: '', email: '', phone: '', location: '' },
  skills: [],
  workExperience: [],
  education: [],
  additionalTraining: [],
  references: []
});

export const genId = () => `_${Math.random().toString(36).slice(2, 9)}`;
export const extractDate = (isoString) => isoString ? isoString.split('T')[0] : '';

const levelKeyToLevel = (levelKey) => ({
  cvLevel1: 'beginner', cvLevel2: 'intermediate',
  cvLevel3: 'intermediate', cvLevel4: 'advanced', cvLevel5: 'expert'
})[levelKey] || 'intermediate';

const levelToLevelKey = (level) => ({
  beginner: 'cvLevel1', intermediate: 'cvLevel3',
  advanced: 'cvLevel4', expert: 'cvLevel5'
})[level] || 'cvLevel3';

export const convertToApiFormat = (cvData) => ({
  name: cvData.summary.name || null,
  title: cvData.summary.title || null,
  email: cvData.summary.email || null,
  phone: cvData.summary.phone || null,
  location: cvData.summary.location || null,
  summary: cvData.summary.text || null,
  github_url: cvData.summary.githubUrl || null,

  skills: cvData.skills
    .filter(s => s.name?.trim())
    .map((s, idx) => ({
      id: typeof s.id === 'number' ? s.id : undefined,
      name: s.name, level: levelKeyToLevel(s.levelKey), order: idx
    })),

  workExperience: cvData.workExperience
    .filter(w => w.company?.trim() && w.role?.trim())
    .map((w, idx) => ({
      id: typeof w.id === 'number' ? w.id : undefined,
      company: w.company, role: w.role,
      start_date: w.startDate || null, end_date: w.endDate || null,
      currently_employed: w.current || false, description: w.description || null, order: idx
    })),

  education: cvData.education
    .filter(e => e.institution?.trim())
    .map((e, idx) => ({
      id: typeof e.id === 'number' ? e.id : undefined,
      institution: e.institution, degree: e.degree || null,
      field_of_study: e.field || null,
      start_date: e.startDate || null, end_date: e.endDate || null, order: idx
    })),

  additionalTraining: cvData.additionalTraining
    .filter(t => t.course?.trim())
    .map((t, idx) => ({
      id: typeof t.id === 'number' ? t.id : undefined,
      name: t.course, provider: t.provider || null,
      start_date: t.startDate || null, end_date: t.endDate || null, order: idx
    })),

  references: cvData.references
    .filter(r => r.name?.trim())
    .map((r, idx) => ({
      id: typeof r.id === 'number' ? r.id : undefined,
      name: r.name, title: r.title || null, company: r.company || null,
      email: r.email || null, phone: r.phone || null, order: idx
    }))
});

export const convertFromApiFormat = (apiData) => {
  if (!apiData) return emptyState();
  return {
    summary: {
      text: apiData.summary || '', githubUrl: apiData.github_url || '',
      name: apiData.name || '', title: apiData.title || '',
      email: apiData.email || '', phone: apiData.phone || '', location: apiData.location || ''
    },
    skills: (apiData.skills || []).map(s => ({
      id: s.id || genId(), name: s.name, levelKey: levelToLevelKey(s.level)
    })),
    workExperience: (apiData.experiences || []).map(w => ({
      id: w.id || genId(), company: w.company, role: w.role,
      startDate: extractDate(w.start_date), endDate: extractDate(w.end_date),
      current: w.currently_employed || false, description: w.description || ''
    })),
    education: (apiData.educations || []).map(e => ({
      id: e.id || genId(), institution: e.institution,
      degree: e.degree || '', field: e.field_of_study || '',
      startDate: extractDate(e.start_date), endDate: extractDate(e.end_date)
    })),
    additionalTraining: (apiData.trainings || []).map(t => ({
      id: t.id || genId(), course: t.name, provider: t.provider || '',
      startDate: extractDate(t.start_date), endDate: extractDate(t.end_date)
    })),
    references: (apiData.references || []).map(r => ({
      id: r.id || genId(), name: r.name, title: r.title || '',
      company: r.company || '', email: r.email || '', phone: r.phone || ''
    }))
  };
};