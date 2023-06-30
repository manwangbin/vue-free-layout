<template>
  <GridWidget :id="props.id"
              :rowSpan="state.rowSpan"
              :colSpan="state.colSpan"></GridWidget>
</template>

<script setup lang="ts">
import GridWidget from "@/components/grid_widget.ts";
import { GridLayoutService } from "./GridLayoutService";
import { useStateMap } from "../hooks";
import { useAttrs } from "vue";

const props = defineProps<{
  id: string,
}>()

const attrs = useAttrs()

const state = useStateMap<GridLayoutService>(props.id, new GridLayoutService(props.id, attrs))

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
