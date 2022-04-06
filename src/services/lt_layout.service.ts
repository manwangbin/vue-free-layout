import { DesignWidget, Point } from '@/types'
import FreeLayoutService from './free_layout.service'

export default class LtLayoutSrevice extends FreeLayoutService {
  // dragEnd (widget: DesignWidget): void {
  //   let x = this.lineBegin
  //   const widgets = this.modal.placeWidgets.sort((i1, i2) => (i1.x + i1.y * this.lineMaxWidth) - (i2.x + i2.y * this.lineMaxWidth))
  //   console.log('widgets: ', widgets)

  //   let lastLineY = new Array<DesignWidget>()
  //   let thisLineY = new Array<DesignWidget>()

  //   for (let i = 0; i < widgets.length; i++) {
  //     const endx = x + widgets[i].width
  //     if (endx > this.lineEnd) {
  //       x = this.lineBegin
  //       lastLineY = [...thisLineY]
  //       thisLineY = new Array<DesignWidget>()
  //     }
  //     const y = this.findLastLineY(x, widgets[i].width, lastLineY)
  //     widgets[i].x = x
  //     widgets[i].y = y
  //     super.moveWidget(widgets[i], { x: x, y: y } as Point)
  //     thisLineY.push(widgets[i])

  //     x += widgets[i].width
  //   }
  // }

  findLastLineY (x: number, width: number, widgets: Array<DesignWidget>) {
    if (!widgets || widgets.length === 0) {
      return this.topBegin
    }

    const begin = x
    const end = x + width

    const ys = widgets.filter(item => {
      return (item.x <= begin && (item.x + item.width) >= begin) || (item.x < end && (item.x + item.width) > end)
    }).map(item => item.y + item.height + 1)
    return Math.max(...ys)
  }
}
