<template>
  <div :class="show ? 'modal-password display-block' : 'modal display-none'">
    <section class="card modal-password-main">
      <slot />
      <div class="clear"></div>
    </section>
  </div>
</template>

<script setup>
import '../assets/css/ModalPasswordChange.css';

defineProps({
  show: Boolean,
});
</script>