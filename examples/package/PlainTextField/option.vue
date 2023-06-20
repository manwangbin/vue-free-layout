<template>
  <div>
    <div class="opt-title">{{state.label}}</div>
    <div class="opt-group">
      <div class="opt-title">字段布局</div>
      <div class="opt-content">
        <RadioButton v-model="state.direction"
                     :options="layoutOpt"
                     @change="(opt)=>service.setDirection(props.id, opt.value)"></RadioButton>
      </div>
    </div>
    <div class="opt-group">
      <div class="opt-title">字段内容</div>
      <div class="opt-content">
        <Input v-model="state.value"></Input>
      </div>
      <div class="opt-content">
        <Select v-model="state.valueStyle.fontFamily" :options="fontFamily"></Select>
        <Select v-model="state.valueStyle.fontSize" :options="fontSize"></Select>
      </div>
      <div class="opt-content">
        <MultipleButton v-model="state.valueStyle.decorations"
                        :options="textStyle"
                        @change="(_, selected)=>service.setFontStyle(props.id, selected)"></MultipleButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RadioButton from "../../components/RadioButton/index.vue";
import MultipleButton from "../../components/MultipleButton/index.vue";
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { getDefaultState, usePlainTextField } from "./PlainTextFieldService";
import { fontFamily, fontSize, layoutOpt, textStyle } from "../utils/options";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  id: string
}>()

const service = usePlainTextField()

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
