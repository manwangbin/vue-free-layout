import { DesignWidget, Point } from "../types";
import { reactive } from 'vue'
import DesignService from './design.service'
import { YWidget } from "@/services/synchronize.service";

interface Modal {
  beginDragging: boolean;
  isOverlap: boolean
}

export default class DraggingService {
  modal: Modal
  dragStartPosition: Point;
  orgPosition = new Map<string, Point>()

  copyWidgets: DesignWidget[] = []

  constructor (public service: DesignService, public emit: (event: 'drag-start' | 'drag-moving' | 'drag-end', ...args: any[]) => void) {
    this.modal = reactive({
      beginDragging: false,
      isOverlap: false,
    })
    this.dragStartPosition = { x: -1, y: -1 }
  }

  mousedownHandler (event: MouseEvent, yWidget?: YWidget) {
    event.preventDefault()
    event.stopPropagation()

    window.addEventListener('mousemove', this.dragHandler, true)
    window.addEventListener('mouseup', this.dragEndHandler, true)

    this.dragStartPosition.x = event.clientX
    this.dragStartPosition.y = event.clientY
    if (yWidget) {
      if (event.altKey || event.metaKey) {
        this.service.addSelected(yWidget)
      } else {
        this.service.setSelected([yWidget])
      }
    }

    this.modal.beginDragging = false
    this.orgPosition.clear()
    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const yWidget = this.service.modal.selecteds[i]
      yWidget.set('moveing', true)
      this.orgPosition.set(yWidget.get('id') as string, { x: yWidget.get('x'), y: yWidget.get('y') } as Point)
    }
    this.service.emitter.emit('onMousedown', (yWidget: YWidget)=>{
      this.orgPosition.set(yWidget.get('id') as string, { x: yWidget.get('x'), y: yWidget.get('y') } as Point)
    })
    // 记录最后的位置
    this.copyWidgets = this.service.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
  }

  dragHandler = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!this.modal.beginDragging) {
      this.modal.beginDragging = true
      for (let i = 0; i < this.service.modal.selecteds.length; i++) {
        this.service.modal.selecteds[i].set('state', 3)
      }
    }

    const hspan = (event.clientX - this.dragStartPosition.x) / this.service.modal.scale
    const vspan = (event.clientY - this.dragStartPosition.y) / this.service.modal.scale

    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const yWidget = this.service.modal.selecteds[i]
      const orgPoint = this.orgPosition.get(yWidget.get('id') as string)
      if (orgPoint && yWidget) {
        yWidget.set('x', orgPoint.x + hspan)
        yWidget.set('y', orgPoint.y + vspan)
        yWidget.set('baseX', orgPoint.x + hspan)
        yWidget.set('baseY', orgPoint.y + vspan)
        this.emit('drag-moving', yWidget.toJSON())
      }
    }

    // 判断是否重叠
    const widgets = this.service.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    if(!this.service.utils.isNotOverlap(widgets)){
      this.service.modal.selecteds.forEach(yWidget=>{
        yWidget.set('isOverlap', true)
      })
      this.modal.isOverlap = true
    }else{
      this.service.modal.selecteds.forEach(yWidget=>{
        yWidget.set('isOverlap', false)
      })
      this.modal.isOverlap = false
    }

    this.service.alignLineService?.onWidgetGroupMove(this.service.modal.selecteds)

    const {bottom} = this.service.utils.getBoundaryByWidget(
      this.service.modal.selecteds.map(yWidget=>yWidget.toJSON()) as Array<DesignWidget>)

    this.service.utils.autoHeight(bottom)

    if(this.service.modal.selecteds.length===1){
      this.service.emitter.emit('onWidgetMove', this.service.modal.selecteds[0].toJSON())
    }
  }


  dragEndHandler = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.removeEventListener('mousemove', this.dragHandler, true)
    window.removeEventListener('mouseup', this.dragEndHandler, true)

    this.modal.beginDragging = false

    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const yWidget = this.service.modal.selecteds[i]
      yWidget.set('moveing', false)
      yWidget.set('state', 1)

      if(this.modal.isOverlap){
        const copyWidget = this.copyWidgets[i]
        yWidget.set('x', copyWidget.x)
        yWidget.set('y', copyWidget.y)
        yWidget.set('baseX', copyWidget.baseX)
        yWidget.set('baseY', copyWidget.baseY)
        yWidget.set('parent', copyWidget.parent)
        yWidget.set('isOverlap', false)
      }
      this.emit('drag-end', yWidget.toJSON())
    }

    this.modal.isOverlap = false

    if(this.service.modal.selecteds.length===1){
      this.service.emitter.emit('onAddWidget', this.service.modal.selecteds[0])
    }
    this.orgPosition.clear()
  }

}
