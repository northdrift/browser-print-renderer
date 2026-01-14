<script setup lang="ts">
import { computed } from 'vue';
import QrcodeVue from 'qrcode.vue';
import { UnitConverter } from '../../utils/layout';

const props = defineProps<{
  element: any;
  data: any;
}>();

const qrcodeValue = computed(() => {
  if (props.element.dataKey) {
    return String(props.data[props.element.dataKey] || '');
  }
  return props.element.value || '';
});

const size = computed(() => {
  return UnitConverter.mmToPx(Math.min(props.element.width, props.element.height || props.element.width));
});
</script>

<template>
  <div class="qrcode-element">
    <qrcode-vue 
      v-if="qrcodeValue" 
      :value="qrcodeValue" 
      :size="size" 
      level="H" 
      render-as="svg"
    />
  </div>
</template>

<style scoped>
.qrcode-element {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
