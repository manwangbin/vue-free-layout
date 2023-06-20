<template>
  <div class="">
    <div class="opt-group">
      <div class="opt-title">分割线</div>
      <div class="opt-content">
        <Input v-model="state.borderSize" type="number"></Input>
        <Select v-model="state.borderStyle"
                :options="borderType"
                @change="(opt)=>service.setDirection(props.id, opt.value)"></Select>
        <Input v-model="state.borderColor" type="color" style="width: 50px;"></Input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { onMounted, ref, watch } from "vue";
import { getDefaultState, useLineBetween } from "./LineBetweenService";
import { borderType } from "../utils/options";

const props = defineProps<{
  id: string
}>()

const service = useLineBetween()

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
