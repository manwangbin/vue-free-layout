<template>
  <div :style="{
      position: 'relative',
      width: 'calc(100% - 2px)',
      height: 'calc(100% - 2px)',
      border: '1px solid #9a9a9a'
    }">
    <div v-for="item in gridRowGap"
         :style="{
            position: 'absolute',
            top: item.y + 'px',
            left: 0,
            height: 0,
            width: (item.width-2)+'px',
            borderBottom: '1px dashed rgb(201, 201, 201)'
         }"></div>
    <div v-for="item in gridColGap"
         :style="{
            position: 'absolute',
            left: item.x + 'px',
            top: 0,
            height: (item.height-2)+'px',
            width: 0,
            borderLeft: '1px dashed rgb(201, 201, 201)'
         }"></div>
    <div v-for="item in gridItems"
         :style="{
            position: 'absolute',
            left: item.x + 'px',
            top: item.y + 'px',
            height: item.height+'px',
            width: item.width+'px',
            background: item.active?'#ecf4fc':''
          }"
         :row="item.row"
         :col="item.col"></div>
  </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, ref, watch, withDefaults } from "vue";
import DesignService from "../services/design.service";
import { DesignWidget } from "../types";
import * as Y from "yjs";

interface Props {
  id: string
  rowSpan: number,
  colSpan: number
}

const props = withDefaults(defineProps<Props>(),{
  rowSpan: 5,
  colSpan: 3
})

const service = inject(DesignService.token) as DesignService

// 获取当前widget的位置
const widgets = service.modal.widgets
let widget = widgets.find(item=>item.id===props.id)
if(!widget){
  widget = service.modal.newWidget
}

// 监听行列变化
watch([
  ()=>props.rowSpan,
  ()=>props.colSpan
], ([rowSpan, colSpan])=>{
  setGridGap(rowSpan, colSpan, widget.width, widget.height)
})

// 监听宽高变化
watch([
  ()=>widget.width,
  ()=>widget.height
], ([width, height])=>{
  setGridGap(props.rowSpan, props.colSpan, width, height)
})

const gridRowGap = ref([])
const gridColGap = ref([])
const gridItems = ref([])
const gridWidgets = ref([])

setGridGap(props.rowSpan, props.colSpan, widget.width, widget.height)
function setGridGap(rowSpan, colSpan, width, height){
  console.log('rowSpan, colSpan',rowSpan, colSpan);
  gridRowGap.value = []
  gridColGap.value = []
  gridItems.value = []
  for (let ri=1;ri<rowSpan;ri++){
    gridRowGap.value.push({
      y: (height / rowSpan * ri) - 1,
      width: width
    })
  }
  for (let ci=1;ci<colSpan;ci++){
    gridColGap.value.push({
      x: (width / colSpan * ci) - 1,
      height: height
    })
  }
  for (let ri=0;ri<rowSpan;ri++){
    for (let ci=0;ci<colSpan;ci++){
      gridItems.value.push({
        x: width / colSpan * ci,
        y: height / rowSpan * ri,
        width: width / colSpan,
        height: height / rowSpan,
        row: ri,
        col: ci,
        active: false
      })
    }
  }
  console.log('gridItems.value',gridItems.value);
}

service.emitter.on('onWidgetMove', onWidgetMove)
service.emitter.on('onAddWidget', onAddWidget)
service.emitter.on('onMousedown', onMousedown)

function onMousedown(setPoint){
  if(service.modal.selecteds.length===1&&service.modal.selecteds[0].get('id')===props.id){
    gridWidgets.value.forEach(yWidget=>{
      const w = service.modal.selecteds.find(item=>item.get('id') === yWidget.get('id'))
      !w && service.addSelected(yWidget)
      setPoint(yWidget)
    })
  }
}

function onWidgetMove(widget: DesignWidget){
  if(widget.id === props.id) return
  const centerPoint = getCenterPoint(widget)
  if(pointInArea(centerPoint, widget)){
    // 判断在哪个格子中
    gridItems.value.forEach(item=>{
      const point = canvasP2GridP(centerPoint)
      item.active = pointInArea(point, item);
    })
  }
}

function onAddWidget(yWidget: Y.Map){
  const widget = yWidget.toJSON()
  if(widget.id === props.id) return
  const centerPoint = getCenterPoint(widget)
  if(pointInArea(centerPoint, widget)){
    // 判断在哪个格子中
    gridItems.value.forEach(item=>{
      const point = canvasP2GridP(centerPoint)
      item.active = false
      if(pointInArea(point, item)){
        // 将widget设置到这个格子中
        setWidget(yWidget, item)
        gridWidgets.value.push(yWidget)
        // 删除这个Widget的边界线
        service.alignLineService.delBoundaryLine(widget.id)
      }
    })
  }
}

onBeforeUnmount(()=>{
  service.emitter.off('onWidgetMove', onWidgetMove)
  service.emitter.off('onAddWidget', onAddWidget)
  service.emitter.off('onMousedown', onMousedown)
})

function setWidget(yWidget, grid){
  const {x, y} = gridP2CanvasP(grid)
  yWidget.set('x', x)
  yWidget.set('y', y)
  yWidget.set('width', grid.width)
  yWidget.set('height', grid.height)
  yWidget.set('parent', widget.id)
}

function pointInArea(point, area){
  // 判断widget的中心是否在网格控件中
  return (point.x > area.x && point.x < (area.x + area.width)
    && point.y > area.y && point.y < (area.y + area.height))
}

function canvasP2GridP(point){
  return{
    x: point.x - widget.x,
    y: point.y - widget.y
  }
}
function gridP2CanvasP(point){
  return{
    x: point.x + widget.x,
    y: point.y + widget.y
  }
}
function getCenterPoint(widget){
  return {
    x: widget.x + widget.width / 2,
    y: widget.y + widget.height / 2
  }
}
</script>

<script lang="ts">
export default {
  name: 'GridWidget',
  inheritAttrs: false
}
</script>

<style lang='less' scoped>

</style>
