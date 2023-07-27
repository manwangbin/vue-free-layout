
<template>
  <div :style="{
      width: '100%',
      height: '100%'
    }">
    <div v-if="!state.src"
         class="test"
        :style="{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'calc(100% - 4px)',
          height: 'calc(100% - 4px)',
          border: '2px dashed #d3d3d3'
        }">
      <svg :style="{
          width: '50%',
          height: '50%',
          cursor: 'pointer',
          zIndex: '1000',
        }" @click="chooseImg" t="1686620282009" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2390" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16"><path d="M928 448c-17.7 0-32 14.3-32 32v319.5c0 17.9-14.6 32.5-32.5 32.5h-703c-17.9 0-32.5-14.6-32.5-32.5V480c0-17.7-14.3-32-32-32s-32 14.3-32 32v319.5c0 53.2 43.3 96.5 96.5 96.5h703c53.2 0 96.5-43.3 96.5-96.5V480c0-17.7-14.3-32-32-32z" fill="#8a8a8a" p-id="2391"></path><path d="M489.4 73.4c0.4-0.4 0.8-0.7 1.2-1.1l0.4-0.4c0.2-0.2 0.5-0.4 0.7-0.6 0.2-0.2 0.4-0.3 0.6-0.4 0.2-0.2 0.5-0.4 0.7-0.5 0.2-0.1 0.4-0.3 0.6-0.4 0.2-0.2 0.5-0.3 0.7-0.5 0.2-0.1 0.4-0.2 0.6-0.4 0.3-0.2 0.5-0.3 0.8-0.5 0.2-0.1 0.3-0.2 0.5-0.3 0.3-0.2 0.6-0.3 0.9-0.5 0.1-0.1 0.3-0.1 0.4-0.2 0.3-0.2 0.7-0.3 1-0.5 0.1-0.1 0.2-0.1 0.3-0.2 0.4-0.2 0.7-0.3 1.1-0.5 0.1 0 0.2-0.1 0.2-0.1 0.4-0.2 0.8-0.3 1.2-0.5 0.1 0 0.1 0 0.2-0.1 0.4-0.2 0.9-0.3 1.3-0.4h0.1c0.5-0.1 0.9-0.3 1.4-0.4h0.1c0.5-0.1 0.9-0.2 1.4-0.3h0.2c0.4-0.1 0.9-0.2 1.3-0.2h0.4c0.4-0.1 0.8-0.1 1.2-0.1 0.3 0 0.5 0 0.8-0.1 0.3 0 0.5 0 0.8-0.1H512.2c0.7 0 1.3 0 1.9 0.1h0.6c0.6 0 1.2 0.1 1.8 0.2h0.3c0.7 0.1 1.4 0.2 2.1 0.4 0.1 0 0.2 0 0.3 0.1 0.7 0.2 1.3 0.3 2 0.5h0.1c0.7 0.2 1.4 0.5 2.1 0.7h0.1l2.1 0.9h0.1c0.7 0.3 1.4 0.7 2 1.1 0.1 0 0.1 0.1 0.2 0.1 1.6 0.9 3.2 2 4.6 3.2 0.2 0.2 0.4 0.4 0.6 0.5 0.2 0.2 0.4 0.3 0.6 0.5 0.2 0.2 0.5 0.4 0.7 0.7l0.4 0.4c0.1 0.1 0.2 0.1 0.2 0.2l191.7 191.7c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L544 173.3V704c0 17.7-14.3 32-32 32s-32-14.3-32-32V173.3L342.6 310.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L489.4 73.4z" fill="#8a8a8a" p-id="2392"></path></svg>
    </div>
    <img v-else
         :src="state.src"
         :style="{
          width: '100%',
          height: '100%',
          objectFit: state.fit,
         }" alt="">
  </div>
</template>

<script setup lang="ts">
import { ImageFieldService } from "./ImageFieldService";
import { computed, useAttrs } from "vue";
import { FileTransform } from "../utils/fileTransform";
import { useStateMap } from "../hooks";

const props = defineProps<{
  id: string
}>()

const attrs = useAttrs()

const state = useStateMap<ImageFieldService>(props.id, new ImageFieldService(props.id, attrs))

const style = computed(()=>state.style)

function chooseImg(){
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = ()=>{
    const file = input.files[0]
    console.log('file', file);
    FileTransform.file2DataUrl(file).then(dataUrl=>{
      state.src = dataUrl
    })
  }
  input.click()
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
