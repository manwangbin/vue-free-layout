
<template>
  <div :style="{
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    minHeight: '36px',
    padding: '5px 0',
    borderBottom:'1px solid #9a9a9a',
    boxSizing: 'border-box',
    ...state.valueStyle
  }">{{state.value}}</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStateMap } from "../hooks";
import { PlainTextFieldService } from "./PlainTextFieldService";

const props = defineProps<{
  id: string,
  state: number
}>()
const state = useStateMap<PlainTextFieldService>(props.id, new PlainTextFieldService(props.id))

const style = computed(()=>state.style)

</script>

<style lang='less' scoped>
.field{
  display: block;
  padding: 5px 0;
}
</style>
