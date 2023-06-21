<template>
  <div v-if="state">
    <div class="opt-title">{{state.label}}</div>
    <div class="opt-group">
      <div class="opt-title">字段布局</div>
      <div class="opt-content">
        <RadioButton v-model="state.direction"
                     :options="layoutOpt"
                     @change="(opt)=>state.setDirection(props.id, opt.value)"></RadioButton>
      </div>
    </div>
    <div class="opt-title">字体及方向</div>
    <div class="opt-group">
      <div class="opt-title">字段名称</div>
      <div class="opt-content">
        <Input v-model="state.label"></Input>
      </div>
      <div class="opt-content">
        <Select v-model="state.labelStyle.fontFamily" :options="fontFamily"></Select>
        <Select v-model="state.labelStyle.fontSize" :options="fontSize"></Select>
      </div>
      <div class="opt-content">
        <MultipleButton v-model="state.labelStyle.decorations"
                        :options="textStyle"
                        @change="(_, selected)=>state.setFontStyle(props.id, 'labelStyle', selected)"></MultipleButton>
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
                        @change="(_, selected)=>state.setFontStyle(props.id, 'valueStyle', selected)"></MultipleButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RadioButton from "../../components/RadioButton/index.vue";
import MultipleButton from "../../components/MultipleButton/index.vue";
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { fontFamily, fontSize, layoutOpt, textStyle } from "../utils/options";
import { toRef } from "vue";
import { useOptStateMap } from "../hooks";
import { TextFieldService } from "./TextFieldService";

const props = defineProps<{
  id: string
}>()

const state = useOptStateMap<TextFieldService>(toRef(props,'id'))

</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
