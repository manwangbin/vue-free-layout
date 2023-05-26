import { DesignWidget, Point, Widget } from '../types'
import { computed } from '@vue/reactivity'
import { ComputedRef, InjectionKey, provide, reactive, ref, Ref } from "vue";
import AlignmentLineService, { BoundaryLine } from "@/services/alignmentLine.service";
import SynchronizeService, { YWidget } from "@/services/synchronize.service";

export interface Modal {
  newWidget?: DesignWidget;
  // 页面大小
  rect: { x: number, y: number, width: number, height: number };
  // 画板区域Modal（标尺）大小
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

  drawerRef: Ref<HTMLElement | null> = ref(null)

  selectedNewWidget?: Widget;

  selectedMousePoint?: Point;

  selectedNewOrgState?: DesignWidget;

  modal: Modal;

  boundaryLine: ComputedRef<Array<BoundaryLine>>;

  syncService: SynchronizeService<DesignWidget>;

  alignLineService: AlignmentLineService

  // 所有选中元素构成的位置
  selectedPosition = computed(() => {
    const bxarray = this.modal.selecteds.map(item => <number>item.get('x'))
    const byarray = this.modal.selecteds.map(item => <number>item.get('y'))
    const begin = {
      x: Math.min(...bxarray),
      y: Math.min(...byarray)
    }

    const exarray = this.modal.selecteds.map(item => <number>item.get('x') + <number>item.get('width'))
    const eyarray = this.modal.selecteds.map(item => <number>item.get('y') + <number>item.get('height'))
    const end = {
      x: Math.max(...exarray),
      y: Math.max(...eyarray)
    }

    return {
      x: begin.x + this.modal.pageRect.x,
      y: begin.y + this.modal.pageRect.y,
      width: (end.x - begin.x),
      height: (end.y - begin.y)
    }
  })

  constructor (props: any,
               public emit: (event:'page-resized' | 'drag-moving' | 'drag-end', ...args: any)=>void) {
    provide(DesignService.token, this)

    this.syncService = new SynchronizeService()
    this.alignLineService = new AlignmentLineService(props, this)

    let {
      value: widgets,
      width, height
    }: {
      value: DesignWidget[],
      width: number,
      height: number
    } = props

    if (height === 0) {
      height = 500
    }

    this.boundaryLine = computed(()=>this.alignLineService?.boundaryLine||[])
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
          resizing: false,
          baseX: item.x,
          baseY: item.y
        }
      ))
      this.syncService.yWidget.push(w)
    }

    // 监听yjs数据更新
    this.syncService.onDataUpdate = (data, updateData)=>{
      updateData.forEach(update=>{
        update.handler(this.modal.widgets)
        this.alignLineService?.handlerAlignmentLine(update)
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

        this.modal.newWidget = {
          ...this.selectedNewWidget, x: x, y: y, state: -1,
          moveing: false, resizing: false, baseX: x, baseY: y
        }
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

      this.alignLineService?.onNewWidgetMove([widget], this)

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

  deleteWidget(widget: DesignWidget){
    const widgetIdx = this.modal.widgets.findIndex(item=>item.id === widget.id)
    if(widgetIdx===-1) return
    this.syncService.yWidget.delete(widgetIdx, 1)
    this.alignLineService?.delBoundaryLine(widget.id)
  }
}
