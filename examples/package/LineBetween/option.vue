<template>
  <div v-if="state">
    <div class="opt-group">
      <div class="opt-title">分割线</div>
      <div class="opt-content">
        <Input v-model="state.borderSize" type="number"></Input>
        <Select v-model="state.borderStyle"
                :options="borderType"
                @change="(opt)=>state.setDirection(props.id, opt.value)"></Select>
        <Input v-model="state.borderColor" type="color" style="width: 50px;"></Input>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from "../../components/Input/index.vue";
import Select from "../../components/Select/index.vue";
import { toRef } from "vue";
import { borderType } from "../utils/options";
import { useOptStateMap } from "../hooks";
import { LineBetweenService } from "./LineBetweenService";

const props = defineProps<{
  id: string
}>()

const state = useOptStateMap<LineBetweenService>(toRef(props,'id'))

</script>

<script lang="ts">
export default {
  name: 'option',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
