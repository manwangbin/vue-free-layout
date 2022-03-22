import { DesignWidget, Point, Widget } from '@/types'
import { InjectionKey, provide, reactive } from 'vue'
import LayoutService from './layout.service'

interface Modal {
  addWdiget?: DesignWidget;
  contentRect: {x: number, y: number, width: number, height: number}
}

export default class DesignContainerService {
  // eslint-disable-next-line symbol-description
  static token: InjectionKey<DesignContainerService> = Symbol();

  modal: Modal

  orgpoint?: Point

  orgwidget?: DesignWidget;

  layoutService?: LayoutService;

  constructor () {
    provide(DesignContainerService.token, this)
    this.modal = reactive({
      contentRect: { x: 0, y: 0, width: 0, height: 0 }
    })
  }

  createWidgetHandler (widget: Widget, event: MouseEvent) {
    this.orgpoint = { x: event.x, y: event.y }
    let statrtx = event.x - widget.width / 2
    if (statrtx < 0) {
      statrtx = 0
    }

    let starty = event.y - widget.height / 2
    if (starty < 0) {
      starty = 0
    }

    const endx = statrtx + widget.width
    const endy = starty + widget.height

    this.modal.addWdiget = { ...widget, x: statrtx, y: starty, state: -1, start: { x: statrtx, y: starty }, end: { x: endx, y: endy } }
    this.orgwidget = { ...this.modal.addWdiget, start: { ...this.modal.addWdiget.start }, end: { ...this.modal.addWdiget.end } }
    window.addEventListener('mousemove', (event) => this.dragMoveHandler(event), true)
    window.addEventListener('mouseup', (event) => this.dragEndHanlder(event), true)
  }

  dragMoveHandler (event: MouseEvent) {
    if (this.modal.addWdiget && this.orgwidget) {
      if (!this.orgpoint) {
        this.orgpoint = { x: event.x, y: event.y }
      } else {
        const hspan = event.x - this.orgpoint.x
        const vspan = event.y - this.orgpoint.y

        this.modal.addWdiget.x = this.orgwidget.x + hspan
        this.modal.addWdiget.y = this.orgwidget.y + vspan
        this.modal.addWdiget.start.x = this.orgwidget.start.x + hspan
        this.modal.addWdiget.start.y = this.orgwidget.start.y + vspan
        this.modal.addWdiget.end.x = this.orgwidget.end.x + hspan
        this.modal.addWdiget.end.y = this.orgwidget.end.y + vspan
        if (this.inContentArea() && this.layoutService) {
          const start = {
            x: this.modal.addWdiget.start.x - this.modal.contentRect.x,
            y: this.modal.addWdiget.start.y - this.modal.contentRect.y
          }
          const end = {
            x: this.modal.addWdiget.end.x - this.modal.contentRect.x,
            y: this.modal.addWdiget.end.y - this.modal.contentRect.y
          }
          this.layoutService.layoutAddWidget(start, end)
        }
      }
    }
  }

  dragEndHanlder (event: MouseEvent) {
    window.removeEventListener('mousemove', (event) => this.dragMoveHandler(event), true)
    window.removeEventListener('mouseup', (event) => this.dragEndHanlder(event), true)

    if (this.inContentArea() && this.layoutService) {
      const widget = { ...this.modal.addWdiget } as Widget
      widget.x = widget.x - this.modal.contentRect.x
      widget.y = widget.y - this.modal.contentRect.y

      this.layoutService.addNewWidget(widget)
    }

    this.modal.addWdiget = undefined
    this.orgpoint = undefined
    this.orgwidget = undefined
  }

  inContentArea () {
    if (this.modal.addWdiget) {
      return (this.modal.addWdiget.start.x > this.modal.contentRect.x && this.modal.addWdiget.start.y > this.modal.contentRect.y) &&
      (this.modal.addWdiget.end.x < (this.modal.contentRect.x + this.modal.contentRect.width))
    } else {
      return false
    }
  }
}
