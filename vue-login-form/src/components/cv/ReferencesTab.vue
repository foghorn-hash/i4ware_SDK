<template>
  <div>
    <div class="cv-section-heading">{{ t('cvTabReferences') }}</div>
    <div v-for="(it, idx) in items" :key="it.id" class="cv-entry-card">
      <div class="cv-entry-number">{{ idx + 1 }}</div>
      <button class="btn btn-sm btn-outline-danger float-end" @click="remove(it.id)">{{ t('cvDelete') }}</button>
      <div class="row g-4 mt-1">
        <div class="col-md-6"><label class="form-label">{{ t('cvName') }}</label><input class="form-control" v-model="it.name" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvRefTitle') }}</label><input class="form-control" v-model="it.title" @input="emitUpdate()" /></div>
        <div class="col-md-12"><label class="form-label">{{ t('cvCompany') }}</label><input class="form-control" v-model="it.company" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('email') }}</label><input class="form-control" v-model="it.email" @input="emitUpdate()" /></div>
        <div class="col-md-6"><label class="form-label">{{ t('cvPhone') }}</label><input class="form-control" v-model="it.phone" @input="emitUpdate()" /></div>
      </div>
    </div>
    <button class="btn btn-outline-primary" @click="add">{{ t('cvAddReference') }}</button>
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
const add = () => { items.value.push({ id: genId(), name: '', title: '', company: '', email: '', phone: '' }); emitUpdate(); };
const remove = (id) => { items.value = items.value.filter(i => i.id !== id); emitUpdate(); };
</script>