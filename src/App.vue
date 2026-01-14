<script setup lang="ts">
import { ref, watch } from 'vue';
import PrintProvider from './components/PrintProvider.vue';

const initialTemplate = {
  paper: {
    width: 210,
    height: 297,
    orientation: 'portrait',
    margins: { top: 10, right: 10, bottom: 10, left: 10 }
  },
  elements: [
    {
      id: 'logo',
      type: 'image',
      x: 0,
      y: 0,
      width: 25,
      height: 25,
      src: 'https://vuejs.org/images/logo.png'
    },
    {
      id: 'title',
      type: 'text',
      x: 30,
      y: 5,
      width: 130,
      height: 15,
      content: '实时编辑打印演示单',
      style: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center' }
    },
    {
      id: 'orderBarcode',
      type: 'barcode',
      x: 165,
      y: 0,
      width: 35,
      height: 15,
      dataKey: 'orderNo',
      style: { fontSize: 10 }
    },
    {
      id: 'info-row',
      type: 'text',
      x: 0,
      y: 30,
      width: 190,
      height: 5,
      content: '客户：Manus 智能实验室 | 日期：2026-01-14 | 状态：已发货',
      style: { fontSize: '12px', borderBottom: '1px solid #000', paddingBottom: '5px' }
    },
    {
      id: 'mainTable',
      type: 'table',
      x: 0,
      y: 40,
      width: 190,
      height: 0,
      header: {
        rows: [
          {
            height: 10,
            heightMode: 'fixed',
            cells: [
              { width: 20, content: [{ id: 'h1', type: 'text', content: 'ID' }] },
              { width: 100, content: [{ id: 'h2', type: 'text', content: '描述 (支持长文本自动换行且不跨页分割)' }] },
              { width: 35, content: [{ id: 'h3', type: 'text', content: '数量' }] },
              { width: 35, content: [{ id: 'h4', type: 'text', content: '单价' }] }
            ]
          }
        ],
        repeat: 'all'
      },
      body: {
        dataKey: 'items',
        layout: 'ltr-ttb',
        rowTemplate: {
          height: 8,
          heightMode: 'auto',
          cells: [
            { width: 20, content: [{ id: 'b1', type: 'text', dataKey: 'id' }] },
            { width: 100, content: [{ id: 'b2', type: 'text', dataKey: 'desc' }] },
            { width: 35, content: [{ id: 'b3', type: 'text', dataKey: 'qty' }] },
            { width: 35, content: [{ id: 'b4', type: 'text', dataKey: 'price' }] }
          ]
        }
      },
      footer: {
        rows: [
          {
            height: 10,
            heightMode: 'fixed',
            cells: [
              { width: 120, colSpan: 2, content: [{ id: 'f1', type: 'text', content: '备注：请核对货物后签收。' }] },
              { width: 70, colSpan: 2, content: [{ id: 'f2', type: 'text', dataKey: 'total' }] }
            ]
          }
        ],
        repeat: 'last',
        position: 'follow'
      }
    },
    {
      id: 'qrcode',
      type: 'qrcode',
      x: 165,
      y: 250, // 调整 y 坐标，确保在页面底部区域
      width: 25,
      height: 25,
      dataKey: 'url'
    },
    {
      id: 'pageInfo',
      type: 'pageInfo',
      x: 0,
      y: 275, // 调整 y 坐标
      width: 190,
      height: 5,
      format: '第 {pageNumber} 页 / 共 {totalPages} 页',
      style: { textAlign: 'center', fontSize: '10px', color: '#666' }
    }
  ]
};

const initialData = {
  orderNo: 'MANUS-888',
  total: '总计：￥99,999.00',
  url: 'https://manus.im',
  items: Array.from({ length: 35 }, (_, i) => ({
    id: i + 1,
    desc: i % 5 === 0 ? `这是一条非常长的描述文本，用于测试分页算法是否能正确处理长文本行，确保它不会被分割在两页之间。这是一条非常长的描述文本，用于测试分页算法是否能正确处理长文本行，确保它不会被分割在两页之间。` : `普通商品项目 ${i + 1}`,
    qty: Math.floor(Math.random() * 100),
    price: '99.00'
  }))
};

const templateJson = ref(JSON.stringify(initialTemplate, null, 2));
const dataJson = ref(JSON.stringify(initialData, null, 2));

const template = ref(initialTemplate);
const data = ref(initialData);
const error = ref('');

const updatePreview = () => {
  try {
    template.value = JSON.parse(templateJson.value);
    data.value = JSON.parse(dataJson.value);
    error.value = '';
  } catch (e: any) {
    error.value = 'JSON 解析错误: ' + e.message;
  }
};

watch([templateJson, dataJson], updatePreview);

const print = () => {
  window.print();
};
</script>

<template>
  <div class="app-container">
    <div class="editor-panel">
      <div class="panel-header">
        <span>模板与数据编辑器</span>
        <button class="print-btn" @click="print">打印预览</button>
      </div>
      
      <div class="editor-section">
        <label>打印模板 (JSON)</label>
        <textarea v-model="templateJson" spellcheck="false"></textarea>
      </div>
      
      <div class="editor-section">
        <label>业务数据 (JSON)</label>
        <textarea v-model="dataJson" spellcheck="false"></textarea>
      </div>
      
      <div v-if="error" class="error-msg">{{ error }}</div>
    </div>
    
    <div class="preview-panel">
      <div class="preview-header">实时预览区域 (修复重叠与分页优化版)</div>
      <div class="preview-scroll">
        <PrintProvider
          :template="template"
          :data="data"
          output-mode="single"
        />
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.editor-panel {
  width: 40%;
  background: #1e1e1e;
  color: #d4d4d4;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
}
.panel-header {
  padding: 15px;
  background: #252526;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
  min-height: 0;
}
.editor-section label {
  margin-bottom: 5px;
  font-size: 12px;
  color: #888;
}
.editor-section textarea {
  flex: 1;
  background: #2d2d2d;
  color: #9cdcfe;
  border: 1px solid #444;
  padding: 10px;
  font-family: 'Fira Code', monospace;
  font-size: 13px;
  resize: none;
  outline: none;
}
.editor-section textarea:focus {
  border-color: #007acc;
}
.error-msg {
  padding: 10px;
  background: #5a1d1d;
  color: #ff8888;
  font-size: 12px;
}
.preview-panel {
  flex: 1;
  background: #e0e0e0;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.preview-header {
  padding: 15px;
  background: #f3f3f3;
  border-bottom: 1px solid #ccc;
  font-weight: bold;
  text-align: center;
}
.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.print-btn {
  background: #42b883;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.print-btn:hover {
  background: #3aa876;
}

@media print {
  .editor-panel, .preview-header {
    display: none;
  }
  .preview-panel {
    width: 100%;
    height: auto;
    background: white;
  }
  .preview-scroll {
    overflow: visible;
    padding: 0;
  }
  body {
    overflow: visible;
  }
}
</style>
