
<template>
  <div v-if="state">
    <div class="opt-group">
      <div class="opt-title">图片路径</div>
      <Input v-model="state.src"></Input>
    </div>
    <div class="opt-group">
      <div class="opt-title">填充模式</div>
      <Select v-model="state.fit"
              :options="imgFit"></Select>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { imgFit } from "../utils/options";
import { toRef } from "vue";
import { useOptStateMap } from "../hooks";
import { ImageFieldService } from "./ImageFieldService";

const props = defineProps<{
  id: string
}>()

const state = useOptStateMap<ImageFieldService>(toRef(props,'id'))

</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
