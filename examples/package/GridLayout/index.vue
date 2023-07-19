<template>
  <GridWidget ref="gridLayoutRef"
              :id="props.id"
              tag="GridLayout"
              :excludeComponents="['GridLayout', 'LineBetween']"
              :components="components"
              :rowSpan="state.rowSpan"
              :colSpan="state.colSpan"></GridWidget>
  <button @click="getComp">getComp</button>
  <button @click="setGridRowGap">setGridRowGap</button>
</template>

<script setup lang="ts">
import { GridWidget } from "@/index";
import { GridLayoutService } from "./GridLayoutService";
import { useStateMap } from "../hooks";
import { ref, useAttrs } from "vue";

const props = defineProps<{
  id: string,
}>()

const attrs = useAttrs()

const state = useStateMap<GridLayoutService>(props.id, new GridLayoutService(props.id, attrs))

const gridLayoutRef = ref()

function getComp(){
  gridLayoutRef.value.getGridItems()
}

function setGridRowGap(){
  [
    {
      "row": 0,
      "height": 77.54560089111328
    },
    {
      "row": 1,
      "height": 695.3939208984375
    },
    {
      "row": 2,
      "height": 77.54559326171875
    }
  ].forEach((item) => {
    gridLayoutRef.value.setGridRowGap(item.row, item.height);
  })
}

const components = []

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
