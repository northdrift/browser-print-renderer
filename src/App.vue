<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import PrintProvider from './components/PrintProvider.vue';

const providerRef = ref<any>(null);

// 标准工业出库单场景模板
const industrialTemplate = {
  headerDisplay: 'perPage', // 默认每页显示页眉，测试重叠修复
  footerDisplay: 'lastPageOnly',
  paper: {
    width: 210,
    height: 297,
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  elements: [
    { id: 'top-line', type: 'line', x: 0, y: 28, width: 190, height: 0.5, lineStyle: 'solid', lineColor: '#333' },
    { id: 'logo', type: 'image', x: 0, y: 0, width: 20, height: 20, src: 'https://vuejs.org/images/logo.png' },
    { id: 'title', type: 'text', x: 30, y: 5, width: 130, height: 15, content: '工业产品出库单 (V2.1)', style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', color: '#2c3e50' } },
    { id: 'barcode', type: 'barcode', x: 160, y: 0, width: 30, height: 12, dataKey: 'orderNo', style: { fontSize: '10px' } },
    { id: 'info-1', type: 'text', x: 0, y: 22, width: 60, height: 5, content: '客户名称：{customer}', style: { fontSize: '11px' } },
    { id: 'info-2', type: 'text', x: 65, y: 22, width: 60, height: 5, content: '出库日期：{date}', style: { fontSize: '11px' } },
    { id: 'info-3', type: 'text', x: 130, y: 22, width: 60, height: 5, content: '仓库：{warehouse}', style: { fontSize: '11px' } },
    {
      id: 'main-table',
      type: 'table',
      x: 0,
      y: 35,
      width: 190,
      height: 0,
      dataKey: 'items',
      columns: [
        { title: '编号', dataKey: 'id', width: 12, align: 'center' },
        { title: '物料名称', dataKey: 'name', width: 40 },
        { title: '规格型号', dataKey: 'spec', width: 30 },
        { title: '单位', dataKey: 'unit', width: 10, align: 'center' },
        { title: '数量', dataKey: 'qty', width: 15, align: 'right' },
        { title: '单价', dataKey: 'price', width: 18, align: 'right' },
        { title: '金额', dataKey: 'amount', width: 20, align: 'right' }
      ],
      columnsCount: 1,
      dataFlow: 'ltr-ttb',
      groupBy: 'category',
      rowsPerPage: 12,
      autoFillBlank: true,
      tableHeaderDisplay: 'perPage'
    },
    { id: 'bottom-line', type: 'line', x: 0, y: 265, width: 190, height: 0.5, lineStyle: 'dashed', lineColor: '#999' },
    { id: 'sign-1', type: 'text', x: 0, y: 270, width: 40, height: 5, content: '制单人：________', style: { fontSize: '11px' } },
    { id: 'sign-2', type: 'text', x: 50, y: 270, width: 40, height: 5, content: '发货人：________', style: { fontSize: '11px' } },
    { id: 'sign-3', type: 'text', x: 100, y: 270, width: 40, height: 5, content: '收货人签章：________', style: { fontSize: '11px' } },
    { id: 'qrcode', type: 'qrcode', x: 165, y: 268, width: 22, height: 22, dataKey: 'qrUrl' },
    { id: 'page-info', type: 'pageInfo', x: 0, y: 285, width: 190, height: 5, format: '第 {pageNumber} 页 / 共 {totalPages} 页', style: { textAlign: 'center', fontSize: '10px', color: '#7f8c8d' } }
  ]
};

const industrialData = {
  orderNo: 'SO-2026-001',
  customer: 'Manus 智能制造有限公司',
  date: '2026-01-16',
  warehouse: '上海 1 号仓',
  qrUrl: 'https://manus.im/verify/SO-2026-001',
  items: Array.from({ length: 38 }, (_, i) => ({
    id: i + 1,
    name: `工业级传感器 ${String.fromCharCode(65 + (i % 26))}${i}`,
    spec: `MOD-${100 + i}-TX`,
    unit: '个',
    qty: Math.floor(Math.random() * 50) + 1,
    price: (Math.random() * 100 + 50).toFixed(2),
    amount: '0.00',
    category: i < 15 ? '核心组件' : (i < 30 ? '辅助配件' : '包装耗材')
  })).map(item => ({ ...item, amount: (parseFloat(item.price) * item.qty).toFixed(2) }))
};

const templateJson = ref(JSON.stringify(industrialTemplate, null, 2));
const dataJson = ref(JSON.stringify(industrialData, null, 2));
const error = ref('');
const outputMode = ref<'single' | 'multiple'>('single');

const template = ref(industrialTemplate);
const data = ref(industrialData);

const quickConfigs = ref({
  columnsCount: 1,
  rowsPerPage: 12,
  autoFillBlank: true,
  headerDisplay: 'perPage'
});

watch(quickConfigs, (newVal) => {
  const t = JSON.parse(templateJson.value);
  t.headerDisplay = newVal.headerDisplay;
  const table = t.elements.find((el: any) => el.type === 'table');
  if (table) {
    table.columnsCount = newVal.columnsCount;
    table.rowsPerPage = newVal.rowsPerPage;
    table.autoFillBlank = newVal.autoFillBlank;
  }
  templateJson.value = JSON.stringify(t, null, 2);
}, { deep: true });

watch([templateJson, dataJson], () => {
  try {
    template.value = JSON.parse(templateJson.value);
    data.value = JSON.parse(dataJson.value);
    error.value = '';
  } catch (e: any) {
    error.value = 'JSON 解析错误: ' + e.message;
  }
});

const print = () => window.print();

const exportHtml = () => {
  const content = providerRef.value?.getPrintContent();
  console.log('Exported HTML:', content);
  alert('HTML 已导出至控制台，请查看。如果是多页模式，将返回 HTML 数组。');
};
</script>

<template>
  <div class="playground">
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>Manus Print Playground V2.1</h3>
        <div class="actions">
          <button class="btn-secondary" @click="exportHtml">导出 HTML</button>
          <button class="btn-primary" @click="print">打印预览</button>
        </div>
      </div>

      <div class="config-card">
        <div class="card-title">快捷配置 (修复重叠 & 导出 HTML)</div>
        <div class="config-grid">
          <div class="config-item">
            <label>表格列数</label>
            <select v-model="quickConfigs.columnsCount">
              <option :value="1">单列</option>
              <option :value="2">双列</option>
            </select>
          </div>
          <div class="config-item">
            <label>页眉显示</label>
            <select v-model="quickConfigs.headerDisplay">
              <option value="perPage">每页显示 (测试修复)</option>
              <option value="firstPageOnly">仅首页</option>
            </select>
          </div>
          <div class="config-item">
            <label>输出模式</label>
            <select v-model="outputMode">
              <option value="single">单 HTML</option>
              <option value="multiple">多 HTML (每页一个)</option>
            </select>
          </div>
          <div class="config-item checkbox">
            <input type="checkbox" v-model="quickConfigs.autoFillBlank" id="fill" />
            <label for="fill">自动填充空白行</label>
          </div>
        </div>
      </div>

      <div class="editor-tabs">
        <div class="editor-container">
          <label>模板配置</label>
          <textarea v-model="templateJson" spellcheck="false"></textarea>
        </div>
        <div class="editor-container">
          <label>业务数据</label>
          <textarea v-model="dataJson" spellcheck="false"></textarea>
        </div>
      </div>

      <div v-if="error" class="error-banner">{{ error }}</div>
    </div>

    <div class="main-content">
      <div class="preview-toolbar">
        <span>实时预览区域 (V2.1 修复版)</span>
        <div class="zoom-info">支持导出完整样式 HTML</div>
      </div>
      <div class="preview-viewport">
        <PrintProvider
          ref="providerRef"
          :template="template"
          :data="data"
          :output-mode="outputMode"
        />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-dark: #1e1e1e;
  --bg-sidebar: #252526;
  --accent: #42b883;
  --text-dim: #888;
  --border: #333;
}

body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }

.playground { display: flex; height: 100vh; background: #f0f2f5; }

.sidebar {
  width: 480px;
  background: var(--bg-sidebar);
  color: #fff;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  padding: 15px;
  box-sizing: border-box;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.sidebar-header h3 { margin: 0; font-size: 16px; color: var(--accent); }

.actions { display: flex; gap: 8px; }

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.btn-secondary {
  background: #34495e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.config-card {
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 15px;
}

.card-title { font-size: 12px; color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase; }

.config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.config-item label { display: block; font-size: 11px; color: #ccc; margin-bottom: 4px; }
.config-item select, .config-item input[type="number"] {
  width: 100%;
  background: #333;
  border: 1px solid #444;
  color: #fff;
  padding: 4px;
  border-radius: 3px;
  font-size: 12px;
}

.config-item.checkbox { display: flex; align-items: center; grid-column: span 2; }
.config-item.checkbox input { margin-right: 8px; }
.config-item.checkbox label { margin-bottom: 0; cursor: pointer; }

.editor-tabs { flex: 1; display: flex; flex-direction: column; gap: 10px; min-height: 0; }

.editor-container { flex: 1; display: flex; flex-direction: column; min-height: 0; }

.editor-container label { font-size: 11px; color: var(--text-dim); margin-bottom: 4px; }
.editor-container textarea {
  flex: 1;
  background: var(--bg-dark);
  color: #9cdcfe;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px;
  font-family: 'Fira Code', monospace;
  font-size: 12px;
  resize: none;
  outline: none;
}

.error-banner { background: #5a1d1d; color: #ff8888; padding: 8px; font-size: 11px; border-radius: 4px; margin-top: 10px; }

.main-content { flex: 1; display: flex; flex-direction: column; min-width: 0; }

.preview-toolbar {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  font-size: 13px;
  font-weight: 500;
}

.zoom-info { color: var(--text-dim); font-size: 11px; }

.preview-viewport { flex: 1; overflow-y: auto; padding: 30px; display: flex; justify-content: center; }

@media print {
  .sidebar, .preview-toolbar { display: none; }
  .main-content { background: white; }
  .preview-viewport { padding: 0; overflow: visible; }
}
</style>
