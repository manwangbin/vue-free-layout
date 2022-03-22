import { DesignWidget, Point, Widget } from '@/types'
import LayoutService from './layout.service'

export default class FreeLayoutService extends LayoutService {
  layoutx = 0

  layouty = 0

  relayoutTime: number|undefined;

  // eslint-disable-next-line no-useless-constructor
  constructor (public lineBegin: number, public lineEnd: number, public lineMaxWidth: number, public topBegin: number) {
    super()
  }

  addNewWidget (widget: Widget) {
    this.modal.placeWidgets.push({
      ...widget,
      start: {
        x: widget.x - this.calcuMargin(widget.margin, ['l']),
        y: widget.y - this.calcuMargin(widget.margin, ['t'])
      },
      end: {
        x: widget.x + widget.width + this.calcuMargin(widget.margin, ['r']),
        y: widget.y + widget.height + this.calcuMargin(widget.margin, ['b'])
      },
      state: 0
    })
  }

  /**
   * 当这个控件的
   * @param widget
   */
  resizeWidget (widget: DesignWidget, newSize: {x: number, y: number, width: number, height: number}) {
    widget.x = newSize.x
    widget.y = newSize.y
    widget.width = newSize.width
    widget.height = newSize.height
    widget.start = { x: (widget.x - this.calcuMargin(widget.margin, ['l'])), y: (widget.y - this.calcuMargin(widget.margin, ['t'])) }
    widget.end = { x: (widget.x + widget.width + this.calcuMargin(widget.margin, ['r'])), y: (widget.y + widget.height + this.calcuMargin(widget.margin, ['b'])) }

    this.relayout(widget)
  }

  moveWidget (widget: DesignWidget, point: Point) {
    widget.x = point.x
    widget.y = point.y
    widget.start = { x: (widget.x - this.calcuMargin(widget.margin, ['l'])), y: (widget.y - this.calcuMargin(widget.margin, ['t'])) }
    widget.end = { x: (widget.x + widget.width + this.calcuMargin(widget.margin, ['r'])), y: (widget.y + widget.height + this.calcuMargin(widget.margin, ['b'])) }

    this.relayout(widget)
  }

  layoutAddWidget (begin: Point, end: Point): void {
    if (this.relayoutTime) {
      clearTimeout(this.relayoutTime)
    }

    this.relayoutTime = setTimeout(() => {
      this.dorelayoutAddedWidget(begin, end)
    }, 50)
  }

  relayout (widget: DesignWidget) {
    if (this.relayoutTime) {
      clearTimeout(this.relayoutTime)
    }

    this.relayoutTime = setTimeout(() => {
      this.dorelayoutWidget(widget)
    }, 50)
  }

  dorelayoutWidget (widget: DesignWidget) {
    const joinedWidgets = this.findJoinWidgets(widget)
    if (joinedWidgets && joinedWidgets.length > 0) {
      joinedWidgets.sort((a, b) => a.y - b.y)

      for (let i = 0; i < joinedWidgets.length; i++) {
        joinedWidgets[i].state = 4
        joinedWidgets[i].y = widget.end.y + 1 + this.calcuMargin(joinedWidgets[i].margin, ['t'])
        joinedWidgets[i].start.y = widget.end.y + 1
        joinedWidgets[i].end.y = joinedWidgets[i].start.y + joinedWidgets[i].height + this.calcuMargin(joinedWidgets[i].margin, ['t', 'b'])

        this.dorelayoutWidget(joinedWidgets[i])
      }
    }
  }

  dorelayoutAddedWidget (begin: Point, end: Point) {
    const joinedWidgets = this.findJoinWidgetsByPoints(begin, end)
    console.log('find add relayout', begin, end, joinedWidgets)
    if (joinedWidgets && joinedWidgets.length > 0) {
      joinedWidgets.sort((a, b) => a.y - b.y)

      for (let i = 0; i < joinedWidgets.length; i++) {
        joinedWidgets[i].state = 4
        joinedWidgets[i].y = end.y + 1 + this.calcuMargin(joinedWidgets[i].margin, ['t'])
        joinedWidgets[i].start.y = end.y + 1
        joinedWidgets[i].end.y = joinedWidgets[i].start.y + joinedWidgets[i].height + this.calcuMargin(joinedWidgets[i].margin, ['t', 'b'])

        this.dorelayoutWidget(joinedWidgets[i])
      }
    }
  }

  layoutWidgets (children: Array<Widget>) {
    this.layoutx = this.lineBegin
    this.layouty = this.topBegin
    this.modal.placeWidgets.splice(0, this.modal.placeWidgets.length)

    const positionedWidgets = children.filter(widget => widget.x > 0 || widget.y > 0)
    for (let i = 0; i < positionedWidgets.length; i++) {
      this.addWidget(positionedWidgets[i])
    }

    const unpositionedWidgets = children.filter(widget => widget.x === 0 && widget.y === 0)
    for (let i = 0; i < unpositionedWidgets.length; i++) {
      this.addWidget(unpositionedWidgets[i])
    }
  }

  calcuMargin (margin: Array<number>, tags: Array<string>): number {
    let value = 0
    if (!margin) {
      return value
    }

    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i]
      switch (tag) {
        case 't':
          value += margin[0]
          break

        case 'r':
          value += (margin.length === 4 ? margin[1] : margin[0])
          break

        case 'b':
          value += (margin.length === 4 ? margin[2] : margin[0])
          break

        case 'l':
          value += (margin.length === 4 ? margin[3] : margin[0])
          break
      }
    }

    return value
  }

  addWidget (widget: Widget) {
    if (widget.x === 0 && widget.y === 0) {
      widget.x = this.layoutx
      widget.y = this.layouty
    }

    let layoutx = widget.x - this.calcuMargin(widget.margin, ['l'])
    let layouty = widget.y - this.calcuMargin(widget.margin, ['t'])
    let widgetWidth = widget.width + this.calcuMargin(widget.margin, ['l', 'r'])
    const widgetHeight = widget.height + this.calcuMargin(widget.margin, ['t', 'b'])

    /* 校验是否正常合理范围，把超出边界和超长的问题去掉 */
    if (widgetWidth > this.lineMaxWidth) {
      widgetWidth = this.lineMaxWidth
      widget.width = this.lineMaxWidth - this.calcuMargin(widget.margin, ['l', 'r'])
    }

    if (layoutx < this.lineBegin) {
      layoutx = this.lineBegin
      widget.x = this.lineBegin + this.calcuMargin(widget.margin, ['l'])
    } else if ((widget.x + widgetWidth) > this.lineEnd) {
      layoutx = this.lineEnd - widgetWidth
      widget.x = this.lineEnd - widgetWidth + this.calcuMargin(widget.margin, ['l'])
    }

    if (layouty < this.topBegin) {
      layouty = this.topBegin
      widget.y = this.topBegin + this.calcuMargin(widget.margin, ['t'])
    }

    const point = this.findArea(layoutx, layouty, widgetWidth, widgetHeight, 1)
    if (point) {
      widget.x = point.x + this.calcuMargin(widget.margin, ['l'])
      widget.y = point.y + this.calcuMargin(widget.margin, ['t'])
      this.modal.placeWidgets.push({ ...widget, start: { x: point.x, y: point.y }, end: { x: (point.x + widgetWidth), y: (point.y + widgetHeight) }, state: 0 })
    }
  }

  /**
   * 在页面上找一个可以摆放的位置
   *
   * @param x
   * @param y
   * @param width
   * @param height
   * @param method 1: 水平优先布局； 2: 垂直优先布局
   */
  findArea (x: number, y: number, width: number, height: number, method: number): Point|undefined {
    let state = -1
    do {
      const result = this.checkArea(x, y, width, height)
      state = result.state
      if (state === 0) {
        return { x: x, y: y } as Point
      } else if (state === 1 && result.widget) {
        if (method === 1) {
          x = result.widget.end.x + 1
          if ((x + width) > this.lineEnd) {
            x = this.lineBegin
            y += 1
          }
        } else {
          y += result.widget.end.y + 1
        }
      }
    } while (state !== 0)
  }

  /**
   *
   * @param widget
   *
   * @returns
   *   state 0:成功；1:被其它控件遮挡；2:超出右边界
   *   widget 如果state为1，则返回被遮挡的widget信息
   */
  checkArea (x: number, y: number, width: number, height: number): { state: number, widget?: DesignWidget } {
    for (let i = 0; i < this.modal.placeWidgets.length; i++) {
      const item = this.modal.placeWidgets[i]

      if (Math.max(x, item.start.x) < Math.min((x + width), item.end.x) &&
        Math.max(y, item.start.y) < Math.min((y + height), item.end.y)) {
        return { state: 1, widget: item }
      }
    }
    return { state: 0 }
  }

  findJoinWidgets (widget: DesignWidget) {
    return this.modal.placeWidgets.filter(item => {
      if (widget.id === item.id) {
        return false
      }

      return Math.max(widget.start.x, item.start.x) < Math.min(widget.end.x, item.end.x) && Math.max(widget.start.y, item.start.y) < Math.min(widget.end.y, item.end.y)
    })
  }

  findJoinWidgetsByPoints (begin:Point, end: Point) {
    return this.modal.placeWidgets.filter(item => {
      return Math.max(begin.x, item.start.x) < Math.min(end.x, item.end.x) && Math.max(begin.y, item.start.y) < Math.min(end.y, item.end.y)
    })
  }
}
