<script setup lang="ts">
import { ref, watch } from 'vue';
import PrintProvider from './components/PrintProvider.vue';

const initialTemplate = {
  headerDisplay: 'firstPageOnly', // 页眉仅首页显示
  footerDisplay: 'lastPageOnly',  // 页脚仅末页显示
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
      content: '多列分组打印演示单 (V2.0)',
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
      id: 'mainTable',
      type: 'table',
      x: 0,
      y: 35,
      width: 190,
      height: 0,
      dataKey: 'items',
      columns: [
        { title: 'ID', dataKey: 'id', width: 15 },
        { title: '商品名称', dataKey: 'name', width: 45 },
        { title: '数量', dataKey: 'qty', width: 15 },
        { title: '单价', dataKey: 'price', width: 20 }
      ],
      // V2.0 新增配置
      columnsCount: 2,           // 双列显示
      dataFlow: 'ltr-ttb',       // 横向优先
      groupBy: 'category',       // 按分类分组
      rowsPerPage: 10,           // 每页固定 10 行
      autoFillBlank: true,       // 自动填充空白行
      tableHeaderDisplay: 'perPage' // 表头每页显示
    },
    {
      id: 'qrcode',
      type: 'qrcode',
      x: 165,
      y: 250,
      width: 25,
      height: 25,
      dataKey: 'url'
    },
    {
      id: 'pageInfo',
      type: 'pageInfo',
      x: 0,
      y: 275,
      width: 190,
      height: 5,
      format: '第 {pageNumber} 页 / 共 {totalPages} 页',
      style: { textAlign: 'center', fontSize: '10px', color: '#666' }
    }
  ]
};

const initialData = {
  orderNo: 'V2-20260116',
  url: 'https://manus.im',
  items: Array.from({ length: 45 }, (_, i) => ({
    id: i + 1,
    name: `测试商品项目 ${i + 1}`,
    qty: Math.floor(Math.random() * 100),
    price: '99.00',
    category: i < 20 ? '电子产品' : (i < 35 ? '办公用品' : '生活百货')
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
        <span>打印模板编辑器 (V2.0)</span>
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

      <div class="features-tip">
        <h4>V2.0 新特性说明：</h4>
        <ul>
          <li><strong>多列排版</strong>：修改 <code>columnsCount</code> 试试。</li>
          <li><strong>分组显示</strong>：数据按 <code>category</code> 自动分组。</li>
          <li><strong>固定行数</strong>：<code>rowsPerPage: 10</code> 强制分页。</li>
          <li><strong>空白填充</strong>：尾页不足 10 行自动补齐。</li>
          <li><strong>显示控制</strong>：页眉仅首页，页脚仅末页。</li>
        </ul>
      </div>
    </div>
    
    <div class="preview-panel">
      <div class="preview-header">实时预览区域 (V2.0 增强版)</div>
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
  padding: 10px;
}
.panel-header {
  padding: 10px;
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
  padding: 5px;
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
  font-size: 12px;
  resize: none;
  outline: none;
}
.error-msg {
  padding: 10px;
  background: #5a1d1d;
  color: #ff8888;
  font-size: 12px;
}
.features-tip {
  margin-top: 10px;
  padding: 10px;
  background: #252526;
  border-radius: 4px;
  font-size: 11px;
}
.features-tip h4 { margin: 0 0 5px 0; color: #42b883; }
.features-tip ul { margin: 0; padding-left: 15px; }

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
