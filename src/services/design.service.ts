import { Boundary, DesignWidget, Point, Widget } from "../types";
import { computed } from '@vue/reactivity'
import { ComputedRef, InjectionKey, nextTick, provide, reactive, ref, Ref, watch } from "vue";
import AlignmentLineService, { BoundaryLine } from "@/services/alignmentLine.service";
import SynchronizeService, { YWidget } from "@/services/synchronize.service";
import mitt from 'mitt'
import UtilsService from "@/services/utils.service";

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
      x: begin.x,
      y: begin.y,
      width: (end.x - begin.x),
      height: (end.y - begin.y)
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

  emitter = mitt<Record<string, any>>()

  constructor (props: any,
               public emit: (event:'page-resized' | 'drag-start' | 'drag-moving' | 'drag-end', ...args: any)=>void) {
    provide(DesignService.token, this)

    this.syncService = new SynchronizeService()
    this.alignLineService = new AlignmentLineService(props, this)
    this.utils = new UtilsService(this)

    let {value: widgets,width, height}: {
      value: DesignWidget[],
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

    if (widgets) {
      let w = widgets.map(item =>
        this.syncService.createWidget({
          ...item,
          state: 0,
          moveing: false,
          resizing: false,
          baseX: item.x,
          baseY: item.y,
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

        let y = event.clientY - this.selectedNewWidget.height / 2 - this.modal.rect.y

        this.modal.newWidget = {
          ...this.selectedNewWidget, x: x, y: y, state: -1,
          moveing: false, resizing: false, baseX: x, baseY: y,
          parent: 'root',
          isOverlap: false
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
      // 判断是否重叠
      this.modal.newWidget.isOverlap = !this.utils.isNotOverlap([widget]);

      this.utils.autoHeight(widget.y+widget.height)

      this.emitter.emit('onWidgetMove', widget)

      this.emit("drag-moving", this.modal.newWidget)
    }
  }

  newWidgetDropRegistHandler = (event: MouseEvent) => {
    window.removeEventListener('mousemove', this.newWidgetDragingRegistHandler, true)
    window.removeEventListener('mouseup', this.newWidgetDropRegistHandler, true)
    if (this.modal.newWidget && !this.modal.newWidget.isOverlap) {
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

  deleteWidget(widget: DesignWidget){
    const widgetIdx = this.modal.widgets.findIndex(item=>item.id === widget.id)
    if(widgetIdx===-1) return
    this.syncService.yWidget.delete(widgetIdx, 1)
    this.alignLineService?.delBoundaryLine(widget.id)
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
    }
  }

  clearnSelected () {
    if (this.modal.selecteds && this.modal.selecteds.length > 0) {
      for (let i = 0; i < this.modal.selecteds.length; i++) {
        this.modal.selecteds[i].set('state', 0)
      }

      this.modal.selecteds.splice(0, this.modal.selecteds.length)
    }
  }

  // 删除选中的widget
  removeSelected(id: string){
    const idx = this.modal.selecteds.findIndex(yWidget=>yWidget.get('id')===id)
    this.modal.selecteds[idx].set('state', 0)
    this.modal.selecteds.splice(idx, 1)
  }

  // 修改页面尺寸内边距
  resizePage({newWidth,newHeight,oldWidth,oldHeight,newPadding,oldPadding}: Record<string, any>){
    this.modal.pageRect.width = newWidth
    this.modal.pageRect.height = newHeight
    // 清空选中的widget
    this.modal.selecteds = []
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

}
