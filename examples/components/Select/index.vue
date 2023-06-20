
<template>
  <select ref="selectRef"
          :value="modelValue"
          style="width: 100%;height: 25px"
          @change="onChange">
    <option v-for="item in options"
            :value="item.value">{{item.label}}</option>
  </select>
</template>

<script setup lang="ts">
import { computed, defineProps, ref } from "vue";

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

const selectRef = ref()

const value = computed({
  get: ()=>props.modelValue,
  set: (val)=>emit('update:modelValue', val)
})

function onChange(){
  const selectVal = selectRef.value.value
  if(selectVal!==value.value){
    value.value = selectVal
    emit('change', selectVal)
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

</style>
