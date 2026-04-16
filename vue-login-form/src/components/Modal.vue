<template>
  <div :class="show ? 'modal display-block' : 'modal display-none'">
    <section class="card modal-main">
      <slot />
      <div class="clear"></div>
    </section>
  </div>
</template>

<script setup>
import '../assets/css/Modal.css';

defineProps({
  show: Boolean,
});
</script>