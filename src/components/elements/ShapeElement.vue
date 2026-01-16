<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  element: any;
}>();

const mmToPx = (mm: number) => (mm * 96) / 25.4;

const style = computed(() => {
  const baseStyle: any = {
    position: 'absolute',
    left: `${mmToPx(props.element.x)}px`,
    top: `${mmToPx(props.element.y)}px`,
    width: `${mmToPx(props.element.width || 0)}px`,
    height: `${mmToPx(props.element.height || 0)}px`,
    boxSizing: 'border-box',
  };

  if (props.element.type === 'line') {
    const isVertical = props.element.width < props.element.height;
    if (isVertical) {
      baseStyle.borderLeft = `${props.element.lineWidth || 1}px ${props.element.lineStyle || 'solid'} ${props.element.lineColor || '#000'}`;
      baseStyle.width = '0';
    } else {
      baseStyle.borderTop = `${props.element.lineWidth || 1}px ${props.element.lineStyle || 'solid'} ${props.element.lineColor || '#000'}`;
      baseStyle.height = '0';
    }
  } else if (props.element.type === 'rect') {
    baseStyle.border = `${props.element.borderWidth || 1}px ${props.element.borderStyle || 'solid'} ${props.element.borderColor || '#000'}`;
  }

  return { ...baseStyle, ...props.element.style };
});
</script>

<template>
  <div :style="style"></div>
</template>
