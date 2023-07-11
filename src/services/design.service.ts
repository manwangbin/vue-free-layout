import { DesignWidget, Point, Widget } from "../types";
import { computed } from '@vue/reactivity'
import { Component, InjectionKey, provide, reactive, ref, Ref, toRaw, watch } from "vue";
import AlignmentLineService from "@/services/alignmentLine.service";
import SynchronizeService, { YWidget } from "@/services/synchronize.service";
import mitt from 'mitt'
import UtilsService from "@/services/utils.service";
import { Publisher } from "@/utils/publisher";
import { FieldInterface } from "@/package/utils/FieldInterface";

export interface Modal {
  newWidget?: DesignWidget;
  // 页面大小
  rect: { x: number, y: number, width: number, height: number };
  // canvase 画板区域Modal（标尺）大小
  canvaseRect: { x: number, y: number, width: number, height: number };
  // drawer 画布大小
  pageRect: {
    x: number, y: number, width: number, height: number,
    cwidth: number, cheight: number, padding: [number, number, number, number]
  };
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
  static itemSlot: InjectionKey<(widget: DesignWidget)=>Component> = Symbol()

  static SPAN = 40

  drawerRef: Ref<HTMLElement | null> = ref(null)

  selectedNewWidget?: Widget;

  selectedMousePoint?: Point;

  selectedNewOrgState?: DesignWidget;

  modal: Modal;

  utils: UtilsService

  boundaryLine = computed(()=>this.alignLineService?.boundaryLine||[])

  syncService: SynchronizeService<DesignWidget>;

  alignLineService: AlignmentLineService

  // 获取在网格是否重叠的函数
  isNotOverlapInGridPublisher = new Publisher<(widgets: Array<DesignWidget>)=>boolean, Array<DesignWidget>>()

  canvase2PanelRect = computed(() => {
    return {
      x: this.modal.canvaseRect.x - this.modal.rect.x,
      y: this.modal.canvaseRect.y - this.modal.rect.y,
      ex: this.modal.canvaseRect.x - this.modal.rect.x + this.modal.canvaseRect.width,
      ey: this.modal.canvaseRect.y - this.modal.rect.y + this.modal.canvaseRect.height
    }
  })

  emitter = mitt<Record<string, any>>()

  constructor (props: any,
               public emit: (event:'page-resized' | 'drag-start' | 'drag-moving' |
                 'drag-end' | 'selected-change' | 'del-widgets', ...args: any)=>void,
               slots: any) {
    provide(DesignService.token, this)
    provide(DesignService.itemSlot, slots.item)

    this.syncService = new SynchronizeService()
    this.alignLineService = new AlignmentLineService(props, this)
    this.utils = new UtilsService(this)

    let {value: widgets, width, height}: {
      value: Widget[],
      width: number,
      height: number
    } = props

    this.modal = reactive({
      scale: 1,
      rect: { x: 0, y: 0, width: 0, height: 0 },
      canvaseRect: { x: 0, y: 0, width: 0, height: 0 },
      pageRect: {
        x: 0, y: 0, width: width, height: height, cwidth: 0, cheight: 0,
        padding: this.utils.paddingFormat(props.pagePadding)
      },
      scrollLeft: 0,
      scrollTop: 0,
      moveing: false,
      selecteds: [],
      widgets: [],
    })

    // 监听yjs数据更新
    this.syncService.onDataUpdate = (data, updateData)=>{
      updateData.forEach(update=>{
        update.handler(this.modal.widgets)
        this.alignLineService?.handlerAlignmentLine(update)
      })
    }

    this.initWidgets(widgets)

    this.modal.canvaseRect.height = height + DesignService.SPAN * 2 / this.modal.scale

    // 监听页面宽高修改
    watch([()=>props.width, ()=>props.height], (newVal, oldVal)=>{
      this.resizePage({
        newWidth: newVal[0],
        newHeight: newVal[1],
        oldWidth: oldVal[0],
        oldHeight: oldVal[1],
        newPadding: this.modal.pageRect.padding,
        oldPadding: this.modal.pageRect.padding
      })
    })

    watch(()=> props.value, ()=>this.initWidgets(props.value))
  }

  initWidgets(widgets: Array<Widget>) {
    if (widgets) {
      this.syncService.yWidget.delete(0, this.syncService.yWidget.length)
      this.modal.selecteds = []
      this.alignLineService.clearAllLine()
      this.alignLineService.setPaddingLine()

      this.alignLineService
      let w = widgets.map(item =>
        this.syncService.createWidget({
            ...item,
            state: 0,
            moveing: false,
            resizing: false,
            isOverlapping: false,
            baseX: item.x,
            baseY: item.y
          }
        ))
      this.syncService.yWidget.push(w)
    }
  }

  createWidgetHandler (widget: Widget) {
    this.selectedNewWidget = widget
    this.emitter.emit('onCreateWidget')
    window.addEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.addEventListener('mouseup', this.newWidgetDropRegistHandler, true)
  }

  newWidgetDragingRegistHandler = (event: MouseEvent) => {
    if (!this.modal.newWidget) {
      if (this.selectedNewWidget) {
        this.selectedMousePoint = { x: event.clientX, y: event.clientY }
        let x = event.clientX - this.selectedNewWidget.width / 2 - this.modal.rect.x

        let y = event.clientY - this.selectedNewWidget.height / 2 - this.modal.rect.y

        this.modal.newWidget = {
          ...this.selectedNewWidget, x: x, y: y, state: -1,
          moveing: false, resizing: false, baseX: x, baseY: y,
          isOverlapping: false
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

      const {x, y} = this.utils.newWidgetP2CavnaseP(this.modal.newWidget)

      const widget = {
        ...this.modal.newWidget,
        x, y
      }

      this.alignLineService?.onNewWidgetMove([widget], this)

      // 不重叠为true
      const gridNotOverlapping = this.isNotOverlapInGridPublisher.emit([widget]).every(item=>item)
      // 判断是否重叠
      this.modal.newWidget.isOverlapping = !(this.utils.isNotOverlap([widget]) && gridNotOverlapping);

      this.utils.autoHeight(widget.y+widget.height)

      this.emit("drag-moving", this.modal.newWidget)
    }
  }

  newWidgetDropRegistHandler = (event: MouseEvent) => {
    window.removeEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.removeEventListener('mouseup', this.newWidgetDropRegistHandler, true)
    if (this.modal.newWidget && !this.modal.newWidget.isOverlapping) {
      const widget = {
        ...this.modal.newWidget,
      } as DesignWidget
      widget.state = 0

      const { x, y } =this.utils.newWidgetP2CavnaseP(widget)

      widget.x = x
      widget.y = y
      widget.baseX = x
      widget.baseY = y
      const yWidget = this.syncService.createWidget(widget)
      this.syncService.yWidget.push([yWidget])
      this.setSelected([yWidget])

      this.emitter.emit('onAddWidget', yWidget)
      this.emit('drag-end', widget)
    }

    this.modal.newWidget = undefined
    this.selectedNewWidget = undefined
    this.selectedMousePoint = undefined
    this.selectedNewOrgState = undefined
  }

  deleteWidget(id: string){
    const widgetIdx = this.syncService.yWidget.toArray().findIndex(item=>item.get('id') === id)
    if(widgetIdx===-1) return
    const widget = this.syncService.yWidget.get(widgetIdx).toJSON()
    this.syncService.yWidget.delete(widgetIdx, 1)
    this.alignLineService?.delBoundaryLine(id)
  }

  addScale (value: number) {
    this.setScale(this.modal.scale + value)
  }

  // 设置缩放
  setScale (newscale: number) {
    if (newscale < 0.2) {
      newscale = 0.2
    }

    if (newscale > 10) {
      newscale = 10
    }

    this.modal.scale = newscale
    this.utils.recountPage()
  }

  // 设置选中区域
  setSelectedArea (begin: Point, end: Point) {
    const pb = {
      x: Math.min(begin.x, end.x),
      y: Math.min(begin.y, end.y)
    }
    const pe = {
      x: Math.max(begin.x, end.x),
      y: Math.max(begin.y, end.y)
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

  // 设置选中的widget
  addSelected (widget: YWidget) {
    if (widget) {
      widget.set('state', 1)
      this.modal.selecteds.push(widget)
      this.emit('selected-change', this.modal.selecteds.map(item=>item.toJSON()))
    }
  }

  // 设置选中的widgets
  setSelected (widgets: Array<YWidget>) {
    this.clearnSelected()
    if (widgets) {
      for (let i = 0; i < widgets.length; i++) {
        widgets[i].set('state', 1)
      }
      this.modal.selecteds.push(...widgets)
      this.emit('selected-change', this.modal.selecteds.map(item=>item.toJSON()))
    }
  }

  clearnSelected () {
    if (this.modal.selecteds && this.modal.selecteds.length > 0) {
      for (let i = 0; i < this.modal.selecteds.length; i++) {
        this.modal.selecteds[i].set('state', 0)
      }

      this.modal.selecteds.splice(0, this.modal.selecteds.length)
      this.emit('selected-change', [])
    }
  }

  // 删除选中的widget
  deleteSelected(id: string){
    const idx = this.modal.selecteds.findIndex(widget=>widget.get('id')===id)
    this.modal.selecteds[idx].set('state', 0)
    this.modal.selecteds.splice(idx, 1)
  }

  // 修改页面尺寸内边距
  resizePage({newWidth,newHeight,oldWidth,oldHeight,newPadding,oldPadding}: Record<string, any>){
    this.modal.pageRect.width = newWidth
    this.modal.pageRect.height = newHeight
    // 清空选中的widget
    this.clearnSelected()
    // 重新设置内边距线
    this.alignLineService.setPaddingLine()

    const [nTop, nRight, nBottom, nLeft] = newPadding
    const [oTop, oRight, oBottom, oLeft] = oldPadding
    newWidth -= (nLeft+nRight)
    oldWidth -= (oLeft+oRight)
    // 计算宽度新增了百分之几
    const widthRatio = (newWidth - oldWidth) / oldWidth
    const heightRatio = (newHeight - oldHeight) / oldHeight
    this.syncService.yWidget.forEach(yWidget=>{
      const yWidth = yWidget.get('width') as number
      const x = yWidget.get('x') as number
      const y = yWidget.get('y') as number
      yWidget.set('width', yWidth + (yWidth * widthRatio))
      yWidget.set('x', (x + (x - nLeft) * widthRatio) + (nLeft - oLeft))
      yWidget.set('y', (y + (y - nTop) * heightRatio) + (nTop - oTop))
    })
    this.utils.recountPage()
  }

  getPageWidgets(){
    // 通知各个组件格式好数据
    this.emitter.emit('formatWidget')
    return this.modal.widgets;
  }
}
