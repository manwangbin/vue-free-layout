
<template>
  <div class="operation_panel">
    <div class="opt-group">
      <div class="content">
        <div class="item" @click="print">打印</div>
      </div>
    </div>
    <div class="opt-group" v-show="designModal.selecteds.length>1">
      <div class="title">对齐方式</div>
      <div class="content">
        <div class="item" @click="leftJustify">左对齐</div>
        <div class="item" @click="rightJustify">右对齐</div>
        <div class="item" @click="topJustify">上对齐</div>
        <div class="item" @click="bottomJustify">下对齐</div>
        <div class="item" @click="rowBetween">水平两端对齐</div>
        <div class="item" @click="columnBetween">垂直两端对齐</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDesignPanel } from "../src/hooks/useDesignPanel";
const {
  designModal,
  leftJustify,
  rightJustify,
  topJustify,
  bottomJustify,
  rowBetween,
  columnBetween,
  print
} = useDesignPanel()


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
  .title{
  }
  .content{
    display: flex;
    flex-wrap: wrap;
    padding: 10px 0;
    .item{
      margin: 0 10px 5px 0;
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
