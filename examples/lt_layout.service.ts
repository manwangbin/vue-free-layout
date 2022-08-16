import { LayoutService, Widget, DesignWidget } from '@/types'

export default class LtLayoutService extends LayoutService {
  addNewWidget (widget: Widget) {
    console.log('add new widget', widget, this.designService.modal.widgets)
  }

  dragBegin (widget: DesignWidget) {
    console.log('dragBegin', widget)
  }

  dragEnd (widget: DesignWidget, oldPosition: Point) {
    console.log('dragEnd', widget)
  }

  resizedWidget (widget: DesignWidget, newSize: { x: number, y: number, width: number, height: number }) {
    console.log('resizedWidget', widget)
  }
}
