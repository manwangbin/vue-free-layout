<template>
  <div v-if="state" class="opt-group">
    <div class="opt-title">网格大小</div>
    <div class="opt-content">
      <span>行</span>
      <Input v-model="state.rowSpan" type="number"></Input>
      <span>列</span>
      <Input v-model="state.colSpan" type="number"></Input>
    </div>
    <button @click="deleteWidget">deleteWidget</button>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import { Ref, toRef } from "vue";
import { GridLayoutService } from "./GridLayoutService";
import { useOptStateMap } from "../hooks";

const props = defineProps<{
  id: string
}>()

const state = useOptStateMap<GridLayoutService>(toRef(props,'id'))

function deleteWidget(){
  state.value?.gridLayoutRef.deleteWidget(state.value.active.id)
}

</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
