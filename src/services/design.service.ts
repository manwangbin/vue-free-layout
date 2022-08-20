import { DesignWidget, Point, Widget } from '@/types'
import { computed } from '@vue/reactivity'
import { InjectionKey, provide, reactive } from 'vue'

interface Modal {
  newWidget?: DesignWidget;
  // 页面大小
  rect: { x: number, y: number, width: number, height: number };
  // 画板区域（标尺）大小
  canvaseRect: { x: number, y: number, width: number, height: number };
  // 画布大小
  pageRect: { x: number, y: number, width: number, height: number, cwidth: number, cheight: number };
  // 垂直滚动值
  scrollLeft: number;
  // 水平滚动值
  scrollTop: number;
  // 发大缩小倍数
  scale: number;

  selecteds: Array<DesignWidget>;
  widgets: Array<DesignWidget>;
}

export default class DesignService {
  static token:InjectionKey<DesignService> = Symbol('DesignService');

  static SPAN = 40

  selectedNewWidget?: Widget;

  selectedMousePoint?: Point;

  selectedNewOrgState?: DesignWidget;

  modal: Modal;

  pageP2CavnaseP = (point: Point) => {
    return {
      x: point.x + this.modal.pageRect.x,
      y: point.y + this.modal.pageRect.y
    }
  }

  panelP2PageP = (point: Point) => {
    return {
      x: point.x - this.modal.pageRect.x,
      y: point.y - this.modal.pageRect.y + this.modal.scrollTop
    }
  }

  constructor (width: number, height: number, public emit: (event:'page-resized', ...args: any)=>void) {
    if (height === 0) {
      height = 500
    }
    provide(DesignService.token, this)
    this.modal = reactive({
      scale: 1,

      rect: { x: 0, y: 0, width: 0, height: 0 },
      canvaseRect: { x: 0, y: 0, width: 0, height: 0 },
      pageRect: { x: 0, y: 0, width: width, height: height, cwidth: 0, cheight: 0 },

      scrollLeft: 0,
      scrollTop: 0,

      moveing: false,
      selecteds: [],
      widgets: []
    })

    this.modal.canvaseRect.height = height + DesignService.SPAN * 2 / this.modal.scale
  }

  pxTorpx = computed(() => this.modal.pageRect.width / 750);

  addScale (value: number) {
    this.setScale(this.modal.scale + value)
  }

  setScale (newscale: number) {
    if (newscale < 0.2) {
      newscale = 0.2
    }

    if (newscale > 10) {
      newscale = 10
    }

    this.modal.scale = newscale
    this.recountPage()
  }

  /**
   * 重新计算页面布局
   */
  recountPage () {
    const viewWidth = this.modal.pageRect.width * this.modal.scale + DesignService.SPAN * 2
    if (viewWidth < this.modal.canvaseRect.width) {
      this.modal.pageRect.cwidth = this.modal.canvaseRect.width / this.modal.scale
    } else {
      this.modal.pageRect.cwidth = viewWidth / this.modal.scale
    }

    const viewHeight = (this.modal.pageRect.height + DesignService.SPAN * 2) * this.modal.scale
    if (viewHeight < this.modal.canvaseRect.height) {
      this.modal.pageRect.cheight = this.modal.canvaseRect.height / this.modal.scale
    } else {
      this.modal.pageRect.cheight = viewHeight / this.modal.scale
    }

    this.modal.pageRect.x = (this.modal.pageRect.cwidth - this.modal.pageRect.width) / 2
    this.modal.pageRect.y = DesignService.SPAN / this.modal.scale

    this.emit('page-resized', this.modal.pageRect)
  }

  clearnSelected () {
    if (this.modal.selecteds && this.modal.selecteds.length > 0) {
      for (let i = 0; i < this.modal.selecteds.length; i++) {
        this.modal.selecteds[i].state = 0
      }

      this.modal.selecteds.splice(0, this.modal.selecteds.length)
    }
  }

  addSelected (widget: DesignWidget) {
    if (widget) {
      widget.state = 1
      this.modal.selecteds.push(widget)
    }
  }

  setSelected (widgets: Array<DesignWidget>) {
    this.clearnSelected()
    if (widgets) {
      for (let i = 0; i < widgets.length; i++) {
        widgets[i].state = 1
      }
      this.modal.selecteds.push(...widgets)
    }
  }

  setSelectedArea (begin: Point, end: Point) {
    const pb = {
      x: Math.min(begin.x, end.x) - this.modal.pageRect.x,
      y: Math.min(begin.y, end.y) - this.modal.pageRect.y
    }
    const pe = {
      x: Math.max(begin.x, end.x) - this.modal.pageRect.x,
      y: Math.max(begin.y, end.y) - this.modal.pageRect.y
    }

    const selecteds = this.modal.widgets.filter(item => {
      const itemEnd = { x: item.x + item.width, y: item.y + item.height } as Point
      return Math.max(pb.x, item.x) < Math.min(pe.x, itemEnd.x) && Math.max(pb.y, item.y) < Math.min(pe.y, itemEnd.y)
    })

    if (selecteds && selecteds.length > 0) {
      this.setSelected(selecteds)
    }
  }

  createWidgetHandler (widget: Widget) {
    this.selectedNewWidget = widget
    window.addEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.addEventListener('mouseup', this.newWidgetDropRegistHandler, true)
  }

  newWidgetDragingRegistHandler = (event: MouseEvent) => {
    if (!this.modal.newWidget) {
      if (this.selectedNewWidget) {
        this.selectedMousePoint = { x: event.clientX, y: event.clientY }
        let x = event.clientX - this.selectedNewWidget.width / 2 - this.modal.rect.x
        if (x < 0) {
          x = 0
        }

        let y = event.clientY - this.selectedNewWidget.height / 2 - this.modal.rect.y
        if (y < 0) {
          y = 0
        }

        this.modal.newWidget = { ...this.selectedNewWidget, x: x, y: y, state: -1, moveing: false }
        this.selectedNewOrgState = { ...this.modal.newWidget }
      }
    } else if (this.selectedMousePoint && this.selectedNewOrgState) {
      const hspan = event.clientX - this.selectedMousePoint.x
      const vspan = event.y - this.selectedMousePoint.y

      this.modal.newWidget.x = this.selectedNewOrgState.x + hspan
      this.modal.newWidget.y = this.selectedNewOrgState.y + vspan
    }
  }

  newWidgetDropRegistHandler = (event: MouseEvent) => {
    window.removeEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.removeEventListener('mouseup', this.newWidgetDropRegistHandler, true)

    if (this.modal.newWidget && this.inCanvase()) {
      const widget = { ...this.modal.newWidget } as DesignWidget
      widget.state = 0

      const x = (widget.x - this.canvase2PanelRect.value.x + this.modal.scrollLeft) / this.modal.scale
      widget.x = x - this.modal.pageRect.x

      const y = (widget.y - this.canvase2PanelRect.value.y + this.modal.scrollTop) / this.modal.scale
      widget.y = y - this.modal.pageRect.y

      this.modal.widgets.push(widget)
      this.setSelected([widget])
    }

    this.modal.newWidget = undefined
    this.selectedNewWidget = undefined
    this.selectedMousePoint = undefined
    this.selectedNewOrgState = undefined
  }

  panelP2PagePDistance = computed(() => {
    return {
      x: this.modal.pageRect.x - this.modal.rect.x,
      y: this.modal.pageRect.y - this.modal.rect.y
    }
  })

  canvase2PanelRect = computed(() => {
    return {
      x: this.modal.canvaseRect.x - this.modal.rect.x,
      y: this.modal.canvaseRect.y - this.modal.rect.y,
      ex: this.modal.canvaseRect.x - this.modal.rect.x + this.modal.canvaseRect.width,
      ey: this.modal.canvaseRect.y - this.modal.rect.y + this.modal.canvaseRect.height
    }
  })

  inCanvase () {
    if (this.modal.newWidget) {
      return (this.modal.newWidget.x > this.canvase2PanelRect.value.x && this.modal.newWidget.y > this.canvase2PanelRect.value.y) &&
      ((this.modal.newWidget.x + this.modal.newWidget.width) < this.canvase2PanelRect.value.ex)
    } else {
      return false
    }
  }
}
