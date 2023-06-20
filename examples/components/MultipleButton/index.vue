<template>
  <div class="multiple-group">
    <div v-for="(item, index) in options"
         :key="index"
         :class="{
           'multiple-button': true,
           'active': valueState.includes(item.value)
         }"
         @click="()=>onClick(item)">
      <div v-if="item.html" v-html="item.html" class="html"></div>
      <div v-else>{{item.label}}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

const props = withDefaults(defineProps<{
  modelValue: string[],
  options: Array<{
    label: string,
    value: string,
    disabled?: boolean
  }>
}>(),{
  modelValue: ()=>[],
  options: ()=>[]
})

const emit = defineEmits(['update:modelValue', 'change'])

const valueState = computed({
  get: ()=>props.modelValue,
  set: (val)=>emit('update:modelValue', val)
})

const selected = computed(()=>props.options.filter(item=>props.modelValue.includes(item.value)))

function onClick(opt){
  const idx = props.modelValue.findIndex(item=>(item===opt.value))
  if(idx !== -1){
    valueState.value.splice(idx , 1)
  }else{
    valueState.value.push(opt.value)
  }
  emit('change', valueState.value, selected.value, opt)
}

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.multiple-group{
  display: flex;
  width: 100%;
  color: var(--color-lv2);
  font-size: 13px;
  border: 1px solid var(--color-lv2);
  border-radius: 5px;
  overflow: hidden;
  .multiple-button{
    padding: 0 10px;
    width: 100%;
    height: 25px;
    text-align: center;
    line-height: 25px;
    border-right: 1px solid var(--color-lv2);
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    &:active{
      background: #f5f5f5;
    }
    .html{
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }
  }
  & > .radio-button:last-child{
    border-right: none;
  }
}

.active{
  color: #ffffff;
  background: var(--primary-color);
}
</style>
