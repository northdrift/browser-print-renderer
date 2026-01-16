<script setup lang="ts">
import { ref, onMounted, watch, provide, nextTick } from 'vue';
import { LayoutEngine } from '../utils/layout';
import PrintPage from './PrintPage.vue';

// 内联类型定义
interface PaperConfig {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  margins: { top: number; right: number; bottom: number; left: number; };
}

interface PrintElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dataKey?: string;
  style?: Record<string, any>;
}

interface ComputedPage {
  pageNumber: number;
  totalPages: number;
  elements: PrintElement[];
  paperConfig: PaperConfig;
  pageData: any;
}

const props = defineProps<{
  template: any;
  data: any;
  outputMode?: 'single' | 'multiple';
}>();

const emit = defineEmits<{
  (e: 'pages-ready', pages: ComputedPage[]): void;
}>();

const computedPages = ref<ComputedPage[]>([]);
const isReady = ref(false);
const isComputing = ref(false);
const printContentRef = ref<HTMLElement | null>(null);

const computeLayout = async () => {
  if (isComputing.value) return;
  isComputing.value = true;
  isReady.value = false;
  
  await nextTick();
  
  try {
    const engine = new LayoutEngine(props.template, { ...props.data });
    computedPages.value = engine.computePages();
    isReady.value = true;
    emit('pages-ready', computedPages.value);
  } catch (error) {
    console.error('Layout computation failed:', error);
  } finally {
    isComputing.value = false;
  }
};

/**
 * 获取打印内容 HTML
 * 返回完整包含样式的 HTML 字符串或数组
 */
const getPrintContent = () => {
  if (!printContentRef.value) return props.outputMode === 'multiple' ? [] : '';

  // 1. 获取所有样式
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('\n');

  const wrapHtml = (bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Content</title>
  ${styles}
  <style>
    body { margin: 0; padding: 0; background: white; }
    @media print { .print-page { box-shadow: none; margin: 0; } }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;

  if (props.outputMode === 'multiple') {
    // 每一页一个独立的 HTML
    const pageElements = printContentRef.value.querySelectorAll('.print-page');
    return Array.from(pageElements).map(el => wrapHtml(el.outerHTML));
  } else {
    // 所有页一个 HTML
    return wrapHtml(printContentRef.value.innerHTML);
  }
};

// 暴露方法给父组件
defineExpose({
  getPrintContent,
  computeLayout
});

onMounted(() => {
  computeLayout();
});

watch(() => props.template, () => {
  computeLayout();
}, { deep: true });

watch(() => props.data, () => {
  computeLayout();
}, { deep: false });

provide('businessData', props.data);
</script>

<template>
  <div class="print-provider">
    <div v-if="isReady" ref="printContentRef" class="print-content">
      <PrintPage
        v-for="page in computedPages"
        :key="page.pageNumber"
        :page-config="page.paperConfig"
        :elements="page.elements"
        :page-number="page.pageNumber"
        :total-pages="page.totalPages"
        :page-data="page.pageData"
      />
    </div>
    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在计算布局，请稍候...</p>
    </div>
  </div>
</template>

<style scoped>
.print-provider {
  width: 100%;
  height: 100%;
}

.print-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background-color: #f0f0f0;
  padding: 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #666;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media print {
  .print-content {
    padding: 0;
    background-color: transparent;
    gap: 0;
  }
  .loading-container {
    display: none;
  }
}
</style>
