<template>
  <div>
    <div class="cv-section-heading">{{ t('cvSkillsHeading') }}</div>
    <div class="cv-skills-container mb-3">
      <span v-for="s in skills" :key="s.id" class="cv-skill-tag">
        {{ s.name }}
        <span class="cv-skill-level-badge">{{ t(s.levelKey) }}</span>
        <button class="cv-skill-remove" @click="remove(s.id)">x</button>
      </span>
    </div>
    <div class="d-flex gap-2">
      <input class="form-control" :placeholder="t('cvAddSkillPlaceholder')" v-model="newSkill" />
      <select class="form-select" style="width: auto" v-model="newLevelKey">
        <option v-for="l in levels" :key="l" :value="l">{{ t(l) }}</option>
      </select>
      <button class="btn btn-primary" @click="add">{{ t('cvAdd') }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { genId } from '../../composables/useCvHelpers';

const { t } = useI18n();
const props = defineProps({ skills: Array });
const emit = defineEmits(['change']);

const newSkill = ref('');
const newLevelKey = ref('cvLevel3');
const levels = ['cvLevel1', 'cvLevel2', 'cvLevel3', 'cvLevel4', 'cvLevel5'];

const add = () => {
  if (!newSkill.value.trim()) return;
  emit('change', [...props.skills, { id: genId(), name: newSkill.value.trim(), levelKey: newLevelKey.value }]);
  newSkill.value = '';
};

const remove = (id) => emit('change', props.skills.filter(s => s.id !== id));
</script>