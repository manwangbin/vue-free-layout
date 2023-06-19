
<template>
  <div class="opt-group">
    <div class="opt-title">图片路径</div>
    <Input v-model="state.src"></Input>
  </div>
  <div class="opt-group">
    <div class="opt-title">填充模式</div>
    <Select v-model="state.fit"
           :options="imgFit"></Select>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { getDefaultState, useImageField } from "./ImageFieldService";
import { imgFit } from "../utils/options";
import { onMounted, ref, watch } from "vue";


const props = defineProps<{
  id: string
}>()

const service = useImageField()

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
