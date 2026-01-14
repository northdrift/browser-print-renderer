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
  (e: 'page-html', payload: { pageNumber: number; html: string }): void;
}>();

const computedPages = ref<ComputedPage[]>([]);
const isReady = ref(false);
const isComputing = ref(false);

const computeLayout = async () => {
  if (isComputing.value) return;
  isComputing.value = true;
  isReady.value = false;
  
  // 使用 nextTick 确保在 DOM 更新后进行测量
  await nextTick();
  
  try {
    // 传入数据的浅拷贝，LayoutEngine 内部会处理分页数据
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

onMounted(() => {
  computeLayout();
});

// 仅在 template 变化或 data 的核心结构变化时重新计算
watch(() => props.template, () => {
  computeLayout();
}, { deep: true });

// 对于 data，我们可能需要更谨慎的 watch，或者由用户手动触发
watch(() => props.data, () => {
  computeLayout();
}, { deep: false }); // 避免深度监听导致的大量计算

provide('businessData', props.data);

const generateAllPagesHtml = () => {
  if (props.outputMode === 'multiple') {
    computedPages.value.forEach(page => {
      emit('page-html', {
        pageNumber: page.pageNumber,
        html: `<!-- Page ${page.pageNumber} HTML Content -->`
      });
    });
  }
};

watch(isReady, (ready) => {
  if (ready && props.outputMode === 'multiple') {
    generateAllPagesHtml();
  }
});
</script>

<template>
  <div class="print-provider">
    <div id="print-measurement-tool"></div>

    <div v-if="isReady" class="print-content">
      <template v-if="outputMode === 'single' || !outputMode">
        <PrintPage
          v-for="page in computedPages"
          :key="page.pageNumber"
          :page-config="page.paperConfig"
          :elements="page.elements"
          :page-number="page.pageNumber"
          :total-pages="page.totalPages"
          :page-data="page.pageData"
        />
      </template>
      <div v-else class="multiple-mode-placeholder">
        已生成 {{ computedPages.length }} 页数据，请通过事件获取 HTML。
      </div>
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

#print-measurement-tool {
  position: absolute;
  left: -9999px;
  top: -9999px;
  visibility: hidden;
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
  .multiple-mode-placeholder, .loading-container {
    display: none;
  }
}
</style>
