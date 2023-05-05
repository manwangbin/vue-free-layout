import { DesignWidget, Point, Widget } from '../types'
import { computed } from '@vue/reactivity'
import { ComputedRef, InjectionKey, provide, reactive } from "vue";
import AlignmentLine, { BoundaryLine } from "@/services/alignmentLine.service";
import SynchronizeService, { YWidget } from "@/services/synchronize.service";
import * as Y from "yjs";
import { CheckType } from "@/util/checkType";

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

  selecteds: Array<YWidget>;
  widgets: Array<DesignWidget>;
}

export default class DesignService {
  static token:InjectionKey<DesignService> = Symbol('DesignService');

  static SPAN = 40

  selectedNewWidget?: Widget;

  selectedMousePoint?: Point;

  selectedNewOrgState?: DesignWidget;

  modal: Modal;

  boundaryLine: ComputedRef<Array<BoundaryLine>>;

  syncService: SynchronizeService<DesignWidget>;

  constructor (widgets: Array<Widget>,
               width: number, height: number,
               public emit: (event:'page-resized' | 'drag-moving' | 'drag-end', ...args: any)=>void,
               public alignmentLine:AlignmentLine|null) {
    if (height === 0) {
      height = 500
    }
    provide(DesignService.token, this)

    this.syncService = new SynchronizeService()

    this.boundaryLine = computed(()=>this.alignmentLine?.boundaryLine||[])
    this.modal = reactive({
      scale: 1,

      rect: { x: 0, y: 0, width: 0, height: 0 },
      canvaseRect: { x: 0, y: 0, width: 0, height: 0 },
      pageRect: { x: 0, y: 0, width: width, height: height, cwidth: 0, cheight: 0 },

      scrollLeft: 0,
      scrollTop: 0,

      moveing: false,
      selecteds: [],
      widgets: [],
    })
    if (widgets) {
      let w = widgets.map(item =>
        this.syncService.createWidget({
          ...item,
          state: 0,
          moveing: false,
          baseX: item.x,
          baseY: item.y
        }
      ))
      this.syncService.yWidget.push(w)
    }

    this.syncService.onDataUpdate = (data, updateHandlers)=>{
      // this.modal.widgets = data
      updateHandlers.forEach(updateHandler=>{
        updateHandler(this.modal.widgets)
      })
    }
    this.modal.canvaseRect.height = height + DesignService.SPAN * 2 / this.modal.scale

  }

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

  newWidgetP2CavnaseP = (point: Point) => {
    return {
      x: (point.x - this.canvase2PanelRect.value.x + this.modal.scrollLeft) / this.modal.scale - this.modal.pageRect.x,
      y: (point.y - this.canvase2PanelRect.value.y + this.modal.scrollTop) / this.modal.scale - this.modal.pageRect.y
    }
  }

  cavnaseP2NewWidgetP = (point: Point) => {
    return {
      x: (point.x + this.modal.pageRect.x)*this.modal.scale - this.modal.scrollLeft + this.canvase2PanelRect.value.x,
      y: (point.y + this.modal.pageRect.y)*this.modal.scale - this.modal.scrollTop + this.canvase2PanelRect.value.y
    }
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
        this.modal.selecteds[i].set('state', 0)
      }

      this.modal.selecteds.splice(0, this.modal.selecteds.length)
    }
  }

  addSelected (widget: YWidget) {
    if (widget) {
      widget.set('state', 1)
      this.modal.selecteds.push(widget)
    }
  }

  setSelected (widgets: Array<YWidget>) {
    this.clearnSelected()
    if (widgets) {
      for (let i = 0; i < widgets.length; i++) {
        widgets[i].set('state', 1)
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
    const selecteds: Array<YWidget> = []

    this.syncService.yWidget.toJSON().forEach((item, index) => {
      const itemEnd = { x: item.x + item.width, y: item.y + item.height } as Point
      if(Math.max(pb.x, item.x) < Math.min(pe.x, itemEnd.x) && Math.max(pb.y, item.y) < Math.min(pe.y, itemEnd.y)){
        selecteds.push(this.syncService.yWidget.get(index))
      }
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

        this.modal.newWidget = { ...this.selectedNewWidget, x: x, y: y, state: -1, moveing: false, baseX: x, baseY: y }
        this.selectedNewOrgState = { ...this.modal.newWidget }
      }
    } else if (this.selectedMousePoint && this.selectedNewOrgState) {
      const hspan = event.clientX - this.selectedMousePoint.x
      const vspan = event.y - this.selectedMousePoint.y

      this.modal.newWidget.x = this.selectedNewOrgState.x + hspan
      this.modal.newWidget.y = this.selectedNewOrgState.y + vspan
      this.modal.newWidget.baseX = this.selectedNewOrgState.x + hspan
      this.modal.newWidget.baseY = this.selectedNewOrgState.y + vspan

      const {x, y} = this.newWidgetP2CavnaseP(this.modal.newWidget)

      const widget = {
        ...this.modal.newWidget,
        x, y
      }

      this.alignmentLine?.onNewWidgetMove([widget], this)

      this.emit("drag-moving", this.modal.newWidget)
    }
  }

  newWidgetDropRegistHandler = (event: MouseEvent) => {
    window.removeEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.removeEventListener('mouseup', this.newWidgetDropRegistHandler, true)

    if (this.modal.newWidget && this.inCanvase()) {
      const widget = {
        ...this.modal.newWidget,
      } as DesignWidget
      widget.state = 0

      const { x, y } =this.newWidgetP2CavnaseP(widget)

      widget.x = x
      widget.y = y
      widget.baseX = x
      widget.baseY = y
      const yWidget = this.syncService.createWidget(widget)
      this.syncService.yWidget.push([yWidget])
      this.setSelected([yWidget])
      this.alignmentLine?.addBoundaryLine(widget)
      // 停止移动后隐藏所有边界线
      this.alignmentLine?.hideAllLine()
      this.emit('drag-end', widget)
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
