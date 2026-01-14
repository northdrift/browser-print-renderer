<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  element: any;
  data: any;
  pageNumber: number;
  totalPages: number;
}>();

const displayContent = computed(() => {
  if (props.element.type === 'pageInfo') {
    return props.element.format
      .replace('{pageNumber}', String(props.pageNumber))
      .replace('{totalPages}', String(props.totalPages));
  }

  if (props.element.dataKey) {
    return String(props.data[props.element.dataKey] || '');
  }

  return props.element.content || '';
});
</script>

<template>
  <div class="text-element">
    {{ displayContent }}
  </div>
</template>

<style scoped>
.text-element {
  width: 100%;
  height: 100%;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
