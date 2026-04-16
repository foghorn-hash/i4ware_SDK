<template>
  <div :class="show ? 'modal-activate display-block' : 'modal display-none'">
    <section class="card modal-activate-main">
      <slot />
      <div class="clear"></div>
    </section>
  </div>
</template>

<script setup>
import '../assets/css/ModalActivate.css';

defineProps({
  show: Boolean,
});
</script>