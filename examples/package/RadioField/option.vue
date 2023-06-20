
<template>
  <div class="opt-group">
    <div class="opt-title">字段布局</div>
    <div class="opt-content">
      <RadioButton v-model="state.direction"
                   :options="layoutOpt"
                   @change="(opt)=>service.setDirection(props.id, opt.value)"></RadioButton>
    </div>
  </div>
  <div class="opt-group">
    <div class="opt-title">字段名称</div>
    <div class="opt-content">
      <Input v-model="state.label"></Input>
    </div>
  </div>
  <div class="opt-group">
    <div class="opt-title">选项</div>
    <div>
      <div v-for="(item,index) in state.options"
           class="opt-item">
        <Input v-model="item.label" style="border: none;outline:none"></Input>
        <input type="radio"
               :value="item.value"
               style="margin: 0 5px 0 0"
               :checked="state.value===item.value"
               @click="()=>setDefaultOpt(item)" />
        <div style="width: 25px;height: 25px;font-size:16px;line-height: 25px;text-align: center;cursor: pointer"
             @click="()=>delOpt(item,index)">x</div>
      </div>
      <button @click="addOpt">新增</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import RadioButton from "../../components/RadioButton/index.vue";
import Input from "../../components/Input/index.vue";
import { getDefaultState, useRadioField } from "./RadioFieldService";
import { onMounted, ref, watch } from "vue";
import { layoutOpt } from "../utils/options";

const props = defineProps<{
  id: string
}>()

const service = useRadioField()

const state = ref(getDefaultState())

onMounted(()=>{
  state.value = service.getState(props.id)
})

watch(()=>props.id,()=>{
  state.value = service.getState(props.id)
},{
  flush: 'post'
})

let optItemIndex = state.value.options.length

function addOpt(){
  state.value.options.push({
    label: '选项'+(optItemIndex+1),
    value: optItemIndex+''
  })
  optItemIndex++
}

function delOpt(item,index){
  const delItem = state.value.options.splice(index,1)[0]
  if(state.value.value === delItem.value){
    state.value.value = state.value.options[0].value
  }
}

function setDefaultOpt(item){
  console.log('item',item);
  state.value.value = item.value
}
</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.opt-item{
  display: flex;
  font-size: 13px;
  color: #6c6c6c;
}
</style>
