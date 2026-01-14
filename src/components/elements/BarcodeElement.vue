<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import JsBarcode from 'jsbarcode';

const props = defineProps<{
  element: any;
  data: any;
}>();

const barcodeRef = ref<SVGSVGElement | null>(null);

const barcodeValue = computed(() => {
  if (props.element.dataKey) {
    return String(props.data[props.element.dataKey] || '');
  }
  return props.element.value || '';
});

const renderBarcode = () => {
  if (barcodeRef.value && barcodeValue.value) {
    try {
      JsBarcode(barcodeRef.value, barcodeValue.value, {
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 0,
        ...props.element.style
      });
    } catch (e) {
      console.error('Barcode generation failed:', e);
    }
  }
};

onMounted(renderBarcode);
watch(barcodeValue, renderBarcode);
</script>

<template>
  <div class="barcode-element">
    <svg ref="barcodeRef" style="width: 100%; height: 100%;"></svg>
  </div>
</template>

<style scoped>
.barcode-element {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
