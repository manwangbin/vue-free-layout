
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
import { getDefaultState, useTextField } from "./TextFieldService";
import { computed } from "vue";

const props = defineProps<{
  id: string,
  state: number
}>()

const service = useTextField()

const state = service.initState(props.id, getDefaultState())

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
