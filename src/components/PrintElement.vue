<script setup lang="ts">
import { computed, inject } from 'vue';
import { UnitConverter } from '../utils/layout';

// 导入具体元素组件
import TextElement from './elements/TextElement.vue';
import TableElement from './elements/TableElement.vue';
import ImageElement from './elements/ImageElement.vue';
import BarcodeElement from './elements/BarcodeElement.vue';
import QrcodeElement from './elements/QrcodeElement.vue';
import ShapeElement from './elements/ShapeElement.vue';

const props = defineProps<{
  element: any;
  pageNumber: number;
  totalPages: number;
  pageData: any; // 该页特定的数据
}>();

const businessData = inject<any>('businessData', {});

const elementStyle = computed(() => {
  return {
    position: 'absolute' as const,
    left: `${UnitConverter.mmToPx(props.element.x)}px`,
    top: `${UnitConverter.mmToPx(props.element.y)}px`,
    width: `${UnitConverter.mmToPx(props.element.width)}px`,
    height: props.element.height ? `${UnitConverter.mmToPx(props.element.height)}px` : 'auto',
    ...props.element.style
  };
});

const componentMap: Record<string, any> = {
  text: TextElement,
  table: TableElement,
  pageInfo: TextElement,
  image: ImageElement,
  barcode: BarcodeElement,
  qrcode: QrcodeElement,
  line: ShapeElement,
  rect: ShapeElement,
};

const currentComponent = computed(() => componentMap[props.element.type]);
</script>

<template>
  <div class="print-element" :style="elementStyle">
    <component
      :is="currentComponent"
      v-if="currentComponent"
      :element="element"
      :data="businessData"
      :page-number="pageNumber"
      :total-pages="totalPages"
      :page-data="pageData"
    />
    <div v-else class="unsupported">
      Unsupported element: {{ element.type }}
    </div>
  </div>
</template>

<style scoped>
.print-element {
  box-sizing: border-box;
}
.unsupported {
  color: red;
  font-size: 10px;
  border: 1px dashed red;
}
</style>
