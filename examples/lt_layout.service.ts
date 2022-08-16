import { LayoutService, DesignWidget } from '@/types'

export default class LtLayoutService extends LayoutService {
  relayout () {
    let top = 10
    if (this.designService.modal.widgets) {
      for (let i = 0; i < this.designService.modal.widgets.length; i++) {
        const widget = this.designService.modal.widgets[i]
        widget.x = 10
        widget.y = top

        top += (widget.height + 10)
      }
    }
  }

  addNewWidget (widget: DesignWidget) {
    widget.width = this.designService.modal.pageRect.width - 20
    widget.height = 20
    widget.enableResize = false
    this.relayout()
    console.log('add new widget', widget, this.designService.modal.widgets)
  }

  dragBegin (widget: DesignWidget) {
    console.log('dragBegin', widget)
  }

  dragEnd (widget: DesignWidget, oldPosition: Point) {
    console.log('dragEnd', widget)
    this.relayout()
  }

  resizedWidget (widget: DesignWidget, newSize: { x: number, y: number, width: number, height: number }) {
    console.log('resizedWidget', widget)
  }
}
