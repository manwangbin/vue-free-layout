<template>
  <input ref="inputRef"
         class="input"
         :value="props.modelValue"
         v-bind="$attrs"
         @input="onInput" />
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const inputRef = ref()

function onInput(){
  const val = inputRef.value.value
  emit('update:modelValue', val)
}

</script>

<script lang="ts">
export default {
  name: 'index',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.input{
  width: 100%;
  height: 25px;
  box-sizing: border-box;
}
</style>
