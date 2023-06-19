<template>
  <div class="radio-group">
    <div v-for="(item, index) in options"
         :key="index"
         :class="{
           'radio-button': true,
           'active': value === item.value
         }"
         @click="()=>onClick(item)">{{item.label}}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from "vue";

const props = withDefaults(defineProps<{
  modelValue: string,
  options: Array<{
    label: string,
    value: string,
    disabled?: boolean
  }>
}>(),{
  options: ()=>[]
})

const emit = defineEmits(['update:modelValue', 'change'])

const value = computed({
  get: ()=>props.modelValue,
  set: (val)=>emit('update:modelValue', val)
})
// const value = ref(props.modelValue)

// watch(()=>props.modelValue,()=>{
//   value.value = props.modelValue
//   console.log('watch modelValue',props.modelValue);
// },{deep:true})

function onClick(opt){
  if(opt.value!==value.value){
    value.value = opt.value
    // emit('update:modelValue', opt.value)
    emit('change', opt)
  }
}

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.radio-group{
  display: flex;
  width: 100%;
  color: var(--color-lv2);
  font-size: 13px;
  border: 1px solid var(--color-lv2);
  border-radius: 5px;
  overflow: hidden;
  .radio-button{
    padding: 0 10px;
    width: 100%;
    text-align: center;
    line-height: 25px;
    border-right: 1px solid var(--color-lv2);
    box-sizing: border-box;
    cursor: pointer;
    user-select: none;
    &:active{
      background: #f5f5f5;
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
