<template>
  <div :class="show ? 'modal-approval display-block' : 'modal display-none'">
    <section class="card modal-approval-main">
      <slot />
      <div class="clear"></div>
    </section>
  </div>
</template>

<script setup>
import '../assets/css/ModalApproval.css';

defineProps({
  show: Boolean,
});
</script>