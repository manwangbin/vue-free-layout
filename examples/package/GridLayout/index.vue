<template>
  <GridWidget :id="props.id"
              :rowSpan="state.rowSpan"
              :colSpan="state.colSpan"></GridWidget>
</template>

<script setup lang="ts">
import GridWidget from "@/components/grid-widget.vue";
import { getDefaultState, useGridLayout } from "./GridLayoutService";

const props = defineProps<{
  id: string,
  state: number
}>()

const service = useGridLayout()

const state = service.initState(props.id, getDefaultState())

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
