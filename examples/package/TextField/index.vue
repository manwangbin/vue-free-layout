
<template>
  <div class="field" :style="{
      width: '100%',
      height: '100%',
      flexDirection: style.flexDirection,
      alignItems: style.alignItems,
    }">
    <div class="field-label" :style="{
      ...state.labelStyle
    }">{{state.label}}</div>
    <div class="field-content" :style="{
      ...state.valueStyle
    }">{{state.value}}</div>
  </div>
</template>

<script setup lang="ts">
import { TextFieldService } from "./TextFieldService";
import { computed, useAttrs } from "vue";
import { stateMap, useStateMap } from "../hooks";

const props = defineProps<{
  id: string,
}>()

console.log('tttttttt', stateMap.get('666'));


const attrs = useAttrs()

const state = useStateMap<TextFieldService>(props.id, new TextFieldService(props.id, attrs))

const style = computed(()=>state.style)

</script>

<style lang='less' scoped>
.field{
  flex-direction: v-bind('style.flexDirection');
  align-items: v-bind('style.alignItems');
  padding: 5px 0;
  border-bottom: 1px solid var(--color-lv2);
}
</style>
