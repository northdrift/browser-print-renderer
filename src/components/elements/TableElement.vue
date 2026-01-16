<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  element: any;
  data: any;
  pageNumber: number;
  totalPages: number;
  pageData: any;
}>();

const mmToPx = (mm: number) => (mm * 96) / 25.4;

// 获取当前页的表格数据
const displayData = computed(() => {
  const key = `__table_${props.element.id}_data`;
  return props.pageData[key] || [];
});

const shouldShowHeader = computed(() => {
  if (props.element.tableHeaderDisplay === 'firstPageOnly') {
    return props.pageNumber === 1;
  }
  return true;
});

const totalColumns = computed(() => {
  return (props.element.columnsCount || 1) * props.element.columns.length;
});

const isGroupRow = (row: any[]) => {
  return row.length > 0 && row[0].__isGroup;
};

const getCellStyle = (col: any) => {
  return {
    width: col.width ? `${mmToPx(col.width)}px` : 'auto',
    textAlign: col.align || 'left',
    border: '1px solid black',
    padding: '4px',
    boxSizing: 'border-box' as const,
    wordBreak: 'break-all' as const
  };
};
</script>

<template>
  <table class="print-table" cellspacing="0" cellpadding="0">
    <thead v-if="shouldShowHeader">
      <tr>
        <template v-for="colIdx in (element.columnsCount || 1)" :key="colIdx">
          <th 
            v-for="col in element.columns" 
            :key="col.dataKey"
            :style="getCellStyle(col)"
          >
            {{ col.title }}
          </th>
        </template>
      </tr>
    </thead>

    <tbody>
      <tr v-for="(row, rowIdx) in displayData" :key="rowIdx">
        <!-- 分组行渲染 -->
        <template v-if="isGroupRow(row)">
          <td :colspan="totalColumns" class="group-title">
            {{ row[0].groupName }}
          </td>
        </template>

        <!-- 普通行渲染 -->
        <template v-else>
          <template v-for="(cell, cellIdx) in row" :key="cellIdx">
            <td 
              v-for="col in element.columns" 
              :key="col.dataKey"
              :style="getCellStyle(col)"
              :class="{ 'blank-cell': cell.__isBlank }"
            >
              {{ cell.__isBlank ? '' : (cell[col.dataKey] || '-') }}
            </td>
          </template>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.print-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

th {
  background-color: #f0f0f0;
  font-weight: bold;
}

td, th {
  font-size: 12px;
  height: 24px;
}

.group-title {
  font-weight: bold;
  background-color: #f9f9f9;
  padding-left: 10px;
  border: 1px solid black;
}

.blank-cell {
  color: transparent;
}
</style>
