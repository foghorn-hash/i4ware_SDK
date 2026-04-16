<template>
  <div :class="show ? 'modal-verify display-block' : 'modal display-none'">
    <section class="card modal-verify-main">
      <slot />
      <div class="clear"></div>
    </section>
  </div>
</template>

<script setup>
import '../assets/css/ModalVerify.css';

defineProps({
  show: Boolean,
});
</script>