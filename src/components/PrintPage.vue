<script setup lang="ts">
import { computed } from 'vue';
import PrintElement from './PrintElement.vue';

interface PaperConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number; };
}

const props = defineProps<{
  pageConfig: PaperConfig;
  elements: any[];
  pageNumber: number;
  totalPages: number;
  pageData: any; // 新增：该页特定的数据
}>();

const pageStyle = computed(() => {
  const { width, height, orientation, margins } = props.pageConfig;
  const isLandscape = orientation === 'landscape';
  
  return {
    width: `${isLandscape ? height : width}mm`,
    height: `${isLandscape ? width : height}mm`,
    padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    position: 'relative' as const,
    backgroundColor: 'white',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    boxSizing: 'border-box' as const,
    overflow: 'hidden',
    pageBreakAfter: 'always' as const
  };
});
</script>

<template>
  <div class="print-page" :style="pageStyle">
    <PrintElement
      v-for="element in elements"
      :key="element.id"
      :element="element"
      :page-number="pageNumber"
      :total-pages="totalPages"
      :page-data="pageData"
    />
  </div>
</template>

<style scoped>
@media print {
  .print-page {
    box-shadow: none !important;
    margin: 0 !important;
  }
}
</style>
