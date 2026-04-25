<template>
  <div>
    <div class="cv-section-heading">{{ t('cvTabWorkExperience') }}</div>
    <div v-for="(it, idx) in items" :key="it.id" class="cv-entry-card">
      <div class="cv-entry-number">{{ idx + 1 }}</div>
      <button class="btn btn-sm btn-outline-danger float-end" @click="remove(it.id)">{{ t('cvDelete') }}</button>
      <div class="row g-4 mt-1">
        <div class="col-md-6"><label class="form-label">{{ t('cvCompany') }}</label><input class="form-control" v-model="it.company" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvRole') }}</label><input class="form-control" v-model="it.role" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvStartDate') }}</label><input type="date" class="form-control" v-model="it.startDate" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvEndDate') }}</label><input type="date" class="form-control" v-model="it.endDate" :disabled="it.current" @input="emitUpdate()" /></div>
        <div class="col-12 mt-2">
          <label class="form-check-label d-flex align-items-center gap-2">
            <input type="checkbox" class="form-check-input mt-0" v-model="it.current" @change="emitUpdate()" />
            {{ t('cvCurrentJob') }}
          </label>
        </div>
        <div class="col-12"><label class="form-label">{{ t('cvDescription') }}</label><textarea class="form-control" rows="3" v-model="it.description" @input="emitUpdate()" /></div>
      </div>
    </div>
    <button class="btn btn-outline-primary" @click="add">{{ t('cvAddExperience') }}</button>
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
const add = () => { items.value.push({ id: genId(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' }); emitUpdate(); };
const remove = (id) => { items.value = items.value.filter(i => i.id !== id); emitUpdate(); };
</script>