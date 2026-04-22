<template>
  <div>
    <div class="cv-section-heading">{{ t('cvTabAdditionalTraining') }}</div>
    <div v-for="(it, idx) in items" :key="it.id" class="cv-entry-card">
      <div class="cv-entry-number">{{ idx + 1 }}</div>
      <button class="btn btn-sm btn-outline-danger float-end" @click="remove(it.id)">{{ t('cvDelete') }}</button>
      <div class="row g-4 mt-1">
        <div class="col-md-12"><label class="form-label">{{ t('cvTrainingCourse') }}</label><input class="form-control" v-model="it.course" @input="emitUpdate()" /></div>
        <div class="col-md-12"><label class="form-label">{{ t('cvTrainingProvider') }}</label><input class="form-control" v-model="it.provider" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvStartDate') }}</label><input type="date" class="form-control" v-model="it.startDate" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvEndDate') }}</label><input type="date" class="form-control" v-model="it.endDate" @input="emitUpdate()" /></div>
      </div>
    </div>
    <button class="btn btn-outline-primary" @click="add">{{ t('cvAddRow') }}</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { genId } from '../../composables/useCvHelpers';

const { t } = useI18n();
const props = defineProps({ items: Array });
const emit = defineEmits(['change']);
const items = ref(props.items.map(i => ({ ...i })));

watch(() => props.items, (val) => { items.value = val.map(i => ({ ...i })); }, { deep: true });

const emitUpdate = () => emit('change', items.value.map(i => ({ ...i })));
const add = () => { items.value.push({ id: genId(), course: '', provider: '', startDate: '', endDate: '' }); emitUpdate(); };
const remove = (id) => { items.value = items.value.filter(i => i.id !== id); emitUpdate(); };
</script>