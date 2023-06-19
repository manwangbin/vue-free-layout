<template>
  <div class="opt-group">
    <div class="opt-title">网格大小</div>
    <div class="opt-content">
      <span>行</span>
      <Input v-model="state.rowSpan" type="number"></Input>
      <span>列</span>
      <Input v-model="state.colSpan" type="number"></Input>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import { onMounted, ref, watch } from "vue";
import { getDefaultState, useGridLayout } from "./GridLayoutService";

const props = defineProps<{
  id: string
}>()

const service = useGridLayout()

const state = ref(getDefaultState())

onMounted(()=>{
  state.value = service.getState(props.id)
})

watch(()=>props.id,()=>{
  state.value = service.getState(props.id)
},{
  flush: 'post'
})
</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
