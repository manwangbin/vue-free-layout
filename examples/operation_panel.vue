
<template>
  <div class="operation_panel">
    <div class="opt-group">
      <div class="opt-content">
        <div class="item" @click="print">打印</div>
        <div class="item" @click="getWidgets">获取widget列表</div>
      </div>
      <div class="opt-title">纸张</div>
      <div class="opt-content">
        <Select v-model="model.pageSize"
                :options="pageSize"
                @change="pageSizeChange"></Select>
      </div>
      <div class="opt-title">页边距</div>
      <div class="opt-content">
        <Select v-model="model.pagePadding"
                :options="pagePadding"
                @change="pagePaddingChange"></Select>
      </div>
    </div>
    <div class="opt-group" v-if="designModal.selecteds.length>1">
      <div class="opt-title">对齐方式</div>
      <div class="opt-content">
        <div class="item" @click="leftJustify">左对齐</div>
        <div class="item" @click="rightJustify">右对齐</div>
        <div class="item" @click="topJustify">上对齐</div>
        <div class="item" @click="bottomJustify">下对齐</div>
        <div class="item" @click="rowBetween">水平两端对齐</div>
        <div class="item" @click="columnBetween">垂直两端对齐</div>
      </div>
    </div>
    <div class="opt-group" v-if="designModal.selecteds.length>1">
      <div class="title">标签布局</div>
      <div class="opt-content">
        <RadioButton :options="layoutOpt"
                     @change="layoutChange"></RadioButton>
      </div>
    </div>
    <component v-if="widget"
               :is="Package[widget.tag+'Opt']" v-bind="widget"></component>
  </div>
</template>

<script setup lang="ts">
import { Package } from "./package/index";
import Select from "./components/Select/index.vue";
import RadioButton from "./components/RadioButton/index.vue";
import { useDesignPanel } from "../src/hooks/useDesignPanel";
import { computed, reactive } from "vue";
import { pagePadding, layoutOpt, pageSize } from "./package/utils/options";

const {
  designModal,
  leftJustify,
  rightJustify,
  topJustify,
  bottomJustify,
  rowBetween,
  columnBetween,
  print,
  changePageSize,
  setPadding,
  getWidgets
} = useDesignPanel()

const selecteds = computed(()=>designModal.value.selecteds)

const widget = computed(()=>{
  const rootSelected = selecteds.value.filter(item=>item.get('parent'))
  if(selecteds.value.length===1){
    return selecteds.value[0].toJSON()
  }else if(rootSelected.length > 1){
    return rootSelected[0].toJSON()
  }else{
    return null
  }
})

const model = reactive({
  pageSize: '841,1189',
  pagePadding: '30'
})


function layoutChange(opt){
  designModal.value.selecteds.forEach(item=>{
    const id = item.get('id') as string
    setDirection(id, opt.value)
  })
}

function pageSizeChange(val){
  changePageSize.apply(null, val.split(','))
}

function pagePaddingChange(val){
  if(val){
    setPadding([Number(val)])
  }
}

</script>

<script lang="ts">
export default {
  name: 'operation_panel',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>
.operation_panel{
  padding: 10px;
  *{
    user-select: none;
  }
  .opt-content{
    display: flex;
    flex-wrap: wrap;
    .item{
      margin-bottom: 10px;
      padding: 0 5px;
      height: 20px;
      text-align: center;
      line-height: 20px;
      font-size: 13px;
      background: #f5f5f5;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      &:hover{
        background: #ececec;
      }
      &:active{
        color: #ffffff;
        background: #66b2e3;
      }
    }
  }

}
</style>
