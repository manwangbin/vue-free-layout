<template>
  <div class="line-between"
       style="display: flex;align-items: center;width: 100%;height: 100%;">
    <div class="line"
         :style="{
            width: '100%',
            borderBottom: `${state.borderSize}px ${state.borderStyle} ${state.borderColor}`
         }"></div>
  </div>
</template>

<script setup lang="ts">
import { getDefaultState, useLineBetween } from "./LineBetweenService";

const props = defineProps<{
  id: string,
  state: number
}>()

const service = useLineBetween()

const state = service.initState(props.id, getDefaultState())

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.line-between{
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  .line{
    width: 100%;
  }
}
</style>
