import { DesignWidget, Point } from '../types'
import { reactive } from 'vue'
import DesignService from './design.service'
import { YWidget } from "@/services/synchronize.service";

interface Modal {
  beginDragging: boolean;
}

export default class DraggingService {
  modal: Modal
  dragStartPosition: Point;
  orgPosition = new Map<string, Point>()

  constructor (public service: DesignService, public emit: (event: 'drag-start' | 'drag-moving' | 'drag-end', ...args: any[]) => void) {
    this.modal = reactive({
      beginDragging: false
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
    this.service.alignLineService?.onWidgetGroupMove(this.service.modal.selecteds)
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
      this.emit('drag-end', yWidget.toJSON())
    }

    this.orgPosition.clear()
  }
}
