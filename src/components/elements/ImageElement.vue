<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  element: any;
  data: any;
}>();

const imageUrl = computed(() => {
  if (props.element.dataKey) {
    return props.data[props.element.dataKey] || '';
  }
  return props.element.src || '';
});
</script>

<template>
  <div class="image-element">
    <img v-if="imageUrl" :src="imageUrl" style="width: 100%; height: 100%; object-fit: contain;" />
  </div>
</template>

<style scoped>
.image-element {
  width: 100%;
  height: 100%;
}
</style>
