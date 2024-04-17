<template>
  <div v-if="visible" class="error-popup">
    {{ message }}
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    visible: Boolean
  }
}
</script>

<style scoped>
.error-popup {
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 300px;
  background-color: #f44336; /* 红色背景 */
  color: white;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  z-index: 1000;
}
</style>
