<script setup lang="ts">
import { computed } from 'vue';
import { UnitConverter } from '../../utils/layout';

const props = defineProps<{
  element: any;
  data: any;
  pageNumber: number;
  totalPages: number;
  pageData: any;
}>();

const tableData = computed(() => {
  return props.pageData?._page_data || [];
});

const shouldShowHeader = computed(() => {
  if (!props.element.header) return false;
  if (props.element.header.repeat === 'all') return true;
  if (props.element.header.repeat === 'first' && props.pageNumber === 1) return true;
  return false;
});

const shouldShowFooter = computed(() => {
  if (!props.element.footer) return false;
  // 如果是 follow 模式，由表格内部渲染
  if (props.element.footer.position === 'follow') {
    if (props.element.footer.repeat === 'all') return true;
    const isLastPage = props.pageNumber === props.totalPages;
    if (props.element.footer.repeat === 'last' && isLastPage) return true;
  }
  // fixed 模式由 LayoutEngine 处理，不在这里渲染
  return false;
});

const getRowStyle = (row: any) => {
  return {
    height: row.heightMode === 'fixed' ? `${UnitConverter.mmToPx(row.height)}px` : 'auto',
    overflow: row.heightMode === 'fixed' ? 'hidden' : 'visible'
  };
};

const getCellStyle = (cellWidth: number) => {
  return {
    width: `${UnitConverter.mmToPx(cellWidth)}px`,
    border: '1px solid black',
    padding: '2px',
    boxSizing: 'border-box' as const
  };
};
</script>

<template>
  <table class="print-table" cellspacing="0" cellpadding="0">
    <thead v-if="shouldShowHeader">
      <tr v-for="(row, index) in element.header?.rows" :key="'header-' + index" :style="getRowStyle(row)">
        <th 
          v-for="(cell, cIndex) in row.cells" 
          :key="cIndex" 
          :style="getCellStyle(cell.width)"
          :colspan="cell.colSpan"
          :rowspan="cell.rowSpan"
        >
          <div v-for="(el, eIndex) in cell.content" :key="eIndex">
            {{ el.dataKey ? data[el.dataKey] : el.content }}
          </div>
        </th>
      </tr>
    </thead>
    
    <tbody>
      <tr v-for="(rowData, rIndex) in tableData" :key="rIndex" :style="getRowStyle(element.body.rowTemplate)">
        <td 
          v-for="(cell, cIndex) in element.body.rowTemplate.cells" 
          :key="cIndex" 
          :style="getCellStyle(cell.width)"
          :colspan="cell.colSpan"
          :rowspan="cell.rowSpan"
        >
          <div v-for="(el, eIndex) in cell.content" :key="eIndex">
            {{ el.dataKey ? rowData[el.dataKey] : el.content }}
          </div>
        </td>
      </tr>
    </tbody>

    <tfoot v-if="shouldShowFooter">
      <tr v-for="(row, index) in element.footer?.rows" :key="'footer-' + index" :style="getRowStyle(row)">
        <td 
          v-for="(cell, cIndex) in row.cells" 
          :key="cIndex" 
          :style="getCellStyle(cell.width)"
          :colspan="cell.colSpan"
          :rowspan="cell.rowSpan"
        >
          <div v-for="(el, eIndex) in cell.content" :key="eIndex">
            {{ el.dataKey ? data[el.dataKey] : el.content }}
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</template>

<style scoped>
.print-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th, td {
  text-align: left;
  vertical-align: top;
  font-size: 12px;
}
</style>
