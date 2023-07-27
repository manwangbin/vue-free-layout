<template>
  <GridWidget :ref="(el) => service.gridLayoutRef = el"
              v-model:active="service.active"
              :id="props.id"
              tag="GridLayout"
              :excludeComponents="['GridLayout', 'LineBetween']"
              :components="state.components"
              :rowSpan="state.rowSpan"
              :colSpan="state.colSpan"
              :gridBorder="state.gridBorder"></GridWidget>
  <button @click="getComp">getComp</button>
  <button @click="setGridRowGap">setGridRowGap</button>
  <button @click="setGridBorder">setGridBorder</button>
  <div>{{props.state}}</div>
  <div>{{service.active}}</div>
</template>

<script setup lang="ts">
import { GridWidget } from "@/index";
import { GridLayoutService } from "./GridLayoutService";
import { useStateMap } from "../hooks";
import { ref, useAttrs, watch } from "vue";

const props = defineProps<{
  id: string,
  state: number
}>()

watch(()=>props.state, (state) => {
  if(state===0){
    service.active = null
  }
})

const attrs = useAttrs()

console.log('attrs',attrs);

const service = useStateMap<GridLayoutService>(props.id, new GridLayoutService(props.id, attrs))

function getComp(){
  service.gridLayoutRef.getGridItems()
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
    service.gridLayoutRef.setGridRowGap(item.row, item.height);
  })
}

function setGridBorder(){
  service.gridBorder = [
    'INNER_HORIZONTAL',
    // 'INNER_VERTICAL',
    // 'UP',
    // 'DOWN',
    'LEFT',
    'RIGHT'
  ]
}

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
