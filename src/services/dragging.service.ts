import { DesignWidget, Point } from '@/types'
import { reactive } from 'vue'
import DesignService from './design.service'

interface Modal {
  beginDragging: boolean;
}

export default class DraggingService {
  modal: Modal
  dragStartPosition: Point;
  orgPosition = new Map<string, Point>()

  constructor (public service: DesignService, public emit: (event: 'drag-start' | 'draging' | 'drag-end', ...args: any[]) => void) {
    this.modal = reactive({
      beginDragging: false
    })
    this.dragStartPosition = { x: -1, y: -1 }
  }

  mousedownHandler (event: MouseEvent, widget?: DesignWidget) {
    event.preventDefault()
    event.stopPropagation()

    window.addEventListener('mousemove', this.dragHandler, true)
    window.addEventListener('mouseup', this.dragEndHandler, true)

    this.dragStartPosition.x = event.clientX
    this.dragStartPosition.y = event.clientY

    if (widget) {
      if (event.altKey || event.metaKey) {
        this.service.addSelected(widget)
      } else {
        this.service.setSelected([widget])
      }
    }

    this.modal.beginDragging = false
    this.orgPosition.clear()
    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const widget = this.service.modal.selecteds[i]
      widget.moveing = true
      this.orgPosition.set(widget.id, { x: widget.x, y: widget.y } as Point)
    }
  }

  dragHandler = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!this.modal.beginDragging) {
      this.modal.beginDragging = true
      for (let i = 0; i < this.service.modal.selecteds.length; i++) {
        this.service.modal.selecteds[i].state = 3
      }
    }

    const hspan = (event.clientX - this.dragStartPosition.x) / this.service.modal.scale
    const vspan = (event.clientY - this.dragStartPosition.y) / this.service.modal.scale

    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const widget = this.service.modal.selecteds[i]
      const orgPoint = this.orgPosition.get(widget.id)
      if (orgPoint && widget) {
        widget.x = orgPoint.x + hspan
        widget.y = orgPoint.y + vspan
        this.emit('draging', widget)
      }
    }
  }

  dragEndHandler = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    window.removeEventListener('mousemove', this.dragHandler, true)
    window.removeEventListener('mouseup', this.dragEndHandler, true)

    this.modal.beginDragging = false
    for (let i = 0; i < this.service.modal.selecteds.length; i++) {
      const widget = this.service.modal.selecteds[i]
      widget.moveing = false
      widget.state = 1
      this.emit('drag-end', widget)
    }

    this.orgPosition.clear()
  }
}
