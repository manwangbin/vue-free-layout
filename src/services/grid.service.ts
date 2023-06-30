import DesignService from "@/services/design.service";
import { reactive } from "vue";
import { DesignWidget, Point, Widget } from "@/types";
import { YWidget } from "@/services/synchronize.service";
import DraggingService from "@/services/dragging.service";

export interface Props {
  id: string
  rowSpan: number,
  colSpan: number
}

interface GridItem extends Pick<Widget, 'x'|'y'|'width'|'height'>{
  row: number,
  col: number,
  active: boolean,
  widget: DesignWidget|null,
  inGrid: boolean
}

interface Model{
  gridRowGap: Array<{
    y: number,
    width: number
  }>
  gridColGap: Array<{
    x: number,
    height: number
  }>
  gridItems: Array<GridItem>
}

export default class GridService{

  service: DesignService

  props: Props

  model: Model

  // 当前网格中激活的子组件
  activeWidget: DesignWidget|null = null

  constructor(service: DesignService, props: Props) {

    this.service = service
    this.props = props
    this.model = reactive({
      gridRowGap: [],
      gridColGap: [],
      gridItems: [],
      gridWidgets: []
    })
  }

  getGridWidget(): DesignWidget{
    let gridWidget = this.service.modal.widgets.find(item=>item.id===this.props.id)
    if(!gridWidget){
      gridWidget = this.service.modal.newWidget
    }
    return gridWidget!
  }

  setGridGap(rowSpan: number|string, colSpan: number|string, width: number, height: number){
    rowSpan = Number(rowSpan)
    colSpan = Number(colSpan)
    const gridWidgets = this.model.gridItems.map(item=>({widget: item.widget, row: item.row, col: item.col}))

    this.model.gridRowGap = []
    this.model.gridColGap = []
    this.model.gridItems = []
    for (let ri=1;ri<rowSpan;ri++){
      this.model.gridRowGap.push({
        y: (height / rowSpan * ri) - 1,
        width: width
      })
    }
    for (let ci=1;ci<colSpan;ci++){
      this.model.gridColGap.push({
        x: (width / colSpan * ci) - 1,
        height: height
      })
    }
    for (let ri=0;ri<rowSpan;ri++){
      for (let ci=0;ci<colSpan;ci++){
        const gridWidget = gridWidgets.find(gridWidget=>(gridWidget.row===ri&&gridWidget.col===ci))
        this.model.gridItems.push({
          x: width / colSpan * ci,
          y: height / rowSpan * ri,
          width: width / colSpan,
          height: height / rowSpan,
          row: ri,
          col: ci,
          active: false,
          widget: gridWidget?.widget || null,
          inGrid: !!gridWidget?.widget
        })
      }
    }
  }

  resetGridWidgets(){
    const newWidgetList: Array<DesignWidget> = []
    this.model.gridItems.forEach(({widget, x, y,width})=>{
      if(!widget) return
      widget.x = x
      widget.y = y
      widget.width = width
      newWidgetList.push(widget)
    })
    const { yWidget } = this.service.utils.getYWidgetById(this.props.id)
    yWidget.set('list', newWidgetList)
  }

  initGridWidgets(){
    const gridWidget = this.getGridWidget()
    if(!gridWidget.list) return
    for (const cWidget of gridWidget.list) {
      const center = this.getCenterPoint(cWidget)
      for (const gridItem of this.model.gridItems) {
        if(this.pointInArea(center, gridItem)){
          gridItem.widget = cWidget
          gridItem.inGrid = true
          break
        }
      }
    }
  }

  // 监听组件放下(已排除重叠)
  onAddWidget(yWidget: YWidget){
    const widget = yWidget.toJSON() as DesignWidget
    if(widget.id === this.props.id) return
    const gridWidget = this.getGridWidget()
    const centerPoint = this.getCenterPoint(widget)
    if(this.pointInArea(centerPoint, gridWidget)){
      // 判断在哪个格子中
      this.model.gridItems.forEach(gridItem=>{
        const point = this.canvasP2GridP(centerPoint)
        gridItem.active = false
        if(this.pointInArea(point, gridItem)){
          this.setWidgetPointToGrid(yWidget, gridItem)
        }else{
          // 如果其他格子有拖动的组件则删除
          if(gridItem.widget?.id===yWidget.get('id')){
            gridItem.widget = null
            gridItem.inGrid = false
          }
        }
      })
    }else{
      // 如果移出网格也删除
      this.model.gridItems.forEach(gridItem=>{
        // 如果其他格子有拖动的组件则删除
        if(gridItem.widget?.id===yWidget.get('id')){
          gridItem.widget = null
          gridItem.inGrid = false
          this.activeWidget = null
        }
      })
    }
  }

  // 监听渲染在canvas上的组件开始拖动
  onMousedown(yWidget?: YWidget){
    if(!yWidget){
      this.setWidgetToGridChild()
    }else if(this.activeWidget && this.activeWidget.id !== yWidget.get('id')){
      this.setWidgetToGridChild()
    }
  }

  // 监听子组件被拖拽,将网格子组件设置为全局并选中
  onGridChildDragStart(event: MouseEvent, widget: DesignWidget){
    const { yWidget: gridYWidget } = this.service.utils.getYWidgetById(this.props.id)
    // 删除子组件并创建yWidget添加到全局
    const {x, y} = this.gridP2CanvasP(widget)
    const yWidget = this.service.syncService.createWidget({
      ...widget,
      x, y
    })
    this.service.syncService.yWidget.push([yWidget])
    // 删除子组件
    const list = gridYWidget.get('list') as Array<DesignWidget>
    const idx = list?.findIndex(item=>item.id===widget.id)
    idx!==undefined && list?.splice(idx, 1)
    gridYWidget.set('list', list)
    // 删除gridWidgets
    for (const gridItem of this.model.gridItems) {
      if(gridItem.widget && gridItem.widget.id === widget.id){
        gridItem.inGrid = false
        this.activeWidget = gridItem.widget
      }
    }
    const draggingService = new DraggingService(this.service, ()=>{})
    draggingService.mousedownHandler(event, yWidget)
  }

  // 将拖入网格的组件设置到对应网格位置
  setWidgetPointToGrid(yWidget: YWidget, gridItem: GridItem){
    const {x, y} = this.gridP2CanvasP(gridItem)
    yWidget.set('x', x)
    yWidget.set('y', y)
    yWidget.set('width', gridItem.width)
    yWidget.set('height', gridItem.height)
    gridItem.widget = yWidget.toJSON() as DesignWidget
    gridItem.inGrid = false
    this.activeWidget = gridItem.widget
    // 删除对齐线
    this.service.alignLineService.delBoundaryLine(yWidget.get('id'))
  }

  // 将组件设置为对应网格的子组件
  setWidgetToGridChild(){
    // 将widget设置到这个格子中
    this.model.gridItems.forEach((gridItem)=>{
      if(!gridItem.widget || (gridItem.widget && gridItem.inGrid)) return
      gridItem.inGrid = true
      const { yWidget: gridYWidget } = this.service.utils.getYWidgetById(this.props.id)
      const list: Array<DesignWidget> = gridYWidget.get('list') || []
      gridItem.widget.x = gridItem.x
      gridItem.widget.y = gridItem.y
      gridItem.widget.width = gridItem.width - 1
      gridItem.widget.height = gridItem.height - 1
      gridItem.widget.state = 0
      list.push(gridItem.widget)
      gridYWidget.set('list', list)
      // 删除全局的yWidget
      this.service.deleteWidget(gridItem.widget.id)
      this.activeWidget = null
      // 删除对齐线
      this.service.alignLineService.delBoundaryLine(gridItem.widget.id)
    })
  }

  // 设置拖动的组件是否在网格中覆盖了其他组件 覆盖false 不覆盖true
  setNotOverlapInGrid(widgets: Array<DesignWidget>): boolean{
    if(widgets.length!==1) {
      return !!widgets.find(w=>w.id === this.props.id)
    }
    const widget = widgets[0]
    if(widget.id === this.props.id) return true
    const centerPoint = this.getCenterPoint(widget)
    const gridWidget = this.getGridWidget()
    if(this.pointInArea(centerPoint, gridWidget)){
      if(widget.tag==='GridLayout') return false;
      // 判断在哪个格子中
      return this.model.gridItems.every((gridItems,index)=>{
        const point = this.canvasP2GridP(centerPoint)
        if(this.pointInArea(point, gridItems)){
          // 判断是否在格子中并且格子没有组件
          gridItems.active = !(gridItems.widget && gridItems.inGrid)
          return !(gridItems.widget && gridItems.inGrid)
        }else{
          gridItems.active = false;
          return true
        }
      })
    }else{
      this.model.gridItems.forEach(item=>{
        item.active = false
      })
      // 如果拖动组件的中心点不在网格组件中，判断边缘是否重叠
      return!(widget.x + widget.width > gridWidget.x &&
        gridWidget.x + gridWidget.width > widget.x &&
        widget.y + widget.height > gridWidget.y &&
        gridWidget.y + gridWidget.height > widget.y);
    }
  }

  pointInArea(point: Point, area: Pick<Widget, 'x'|'y'|'width'|'height'>){
    // 判断widget的中心是否在网格控件中
    return (point.x > area.x && point.x < (area.x + area.width)
      && point.y > area.y && point.y < (area.y + area.height))
  }

  canvasP2GridP(point: Point){
    const gridWidget = this.getGridWidget()
    return{
      x: point.x - gridWidget.x,
      y: point.y - gridWidget.y
    }
  }

  gridP2CanvasP(point: Point|DesignWidget){
    const gridWidget = this.getGridWidget()
    return{
      x: point.x + gridWidget.x,
      y: point.y + gridWidget.y
    }
  }

  getCenterPoint(widget: DesignWidget){
    return {
      x: widget.x + widget.width / 2,
      y: widget.y + widget.height / 2
    }
  }
}
