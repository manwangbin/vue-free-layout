<template>
  <GridWidget :id="props.id"
              :rowSpan="state.rowSpan"
              :colSpan="state.colSpan"></GridWidget>
</template>

<script setup lang="ts">
import GridWidget from "@/components/grid-widget.vue";
import { GridLayoutService } from "./GridLayoutService";
import { useStateMap } from "../hooks";

const props = defineProps<{
  id: string,
  state: number
}>()

const state = useStateMap<GridLayoutService>(props.id, new GridLayoutService(props.id))

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
