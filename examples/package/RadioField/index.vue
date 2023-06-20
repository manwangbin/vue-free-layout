
<template>
  <div class="field" :style="{
      width: '100%',
      height: '100%',
      flexDirection: style.flexDirection,
      alignItems: style.alignItems,
    }">
    <div class="field-label">{{state.label}}</div>
    <div class="field-content" style="display:flex;flex-wrap: wrap;">
      <div v-for="item in state.options"
           style="display: flex;align-items:center;font-size: 14px;margin-right: 10px;cursor: pointer"
           @click="()=>onClick(item)">
        <input type="radio"
               :value="item.value"
               style="margin: 0 5px 0 0"
               :checked="state.value===item.value" />
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDefaultState, useRadioField } from "./RadioFieldService";
import { computed } from "vue";

const props = defineProps<{
  id: string,
  state: number
}>()

const service = useRadioField()

const state = service.initState(props.id, getDefaultState())

const style = computed(()=>state.style)

function onClick(item){
  state.value = item.value
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
