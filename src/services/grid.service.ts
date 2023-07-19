import DesignService from "@/services/design.service";
import { computed, reactive } from "vue";
import { DesignWidget, Point, Widget } from "@/types";
import { YWidget } from "@/services/synchronize.service";
import DraggingService from "@/services/dragging.service";

export interface Props {
  id: string;
  tag: string;
  rowSpan: number;
  colSpan: number;
  excludeComponents: Array<string>;
  components: Array<DesignWidget>;
}

export interface GridItem extends Pick<Widget, 'x'|'y'|'width'|'height'>{
  row: number,
  col: number,
  active: boolean,
  widget: DesignWidget|null,
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
  gridItems: Array<GridItem>,

  height: number
}

export default class GridService{
  gridWidget: DesignWidget

  containerRef: HTMLDivElement | null = null

  model: Model

  gridChildWidgets = computed(()=>{
    const widgets: Array<DesignWidget> = []
    this.model.gridItems.forEach(item=>{
      item.widget && widgets.push(item.widget)
    })
    return widgets
  })

  constructor(public service: DesignService, public props: Props) {
    this.gridWidget = this.getGridWidget()

    this.model = reactive({
      gridRowGap: [],
      gridColGap: [],
      gridItems: [],
      height: this.gridWidget.height
    })
  }

  getGridWidget(): DesignWidget{
    let gridWidget = this.service.modal.widgets.find(item=>item.id===this.props.id)
    if(!gridWidget){
      gridWidget = this.service.modal.newWidget
    }
    return gridWidget!
  }

  initGridGap(rowSpan: number|string, colSpan: number|string, width: number, height: number){
    rowSpan = Number(rowSpan)
    colSpan = Number(colSpan)
    const gridWidgets = this.model.gridItems.map(item=>({widget: item.widget, row: item.row, col: item.col}))

    this.model.gridRowGap = []
    this.model.gridColGap = []
    this.model.gridItems = []
    this.model.height = height

    for (let ri = 0; ri < rowSpan - 1; ri++){
      this.model.gridRowGap.push({
        y: (height / rowSpan * (ri + 1)) - 1,
        width: width
      })
    }
    for (let ci = 0; ci < colSpan - 1; ci++){
      this.model.gridColGap.push({
        x: (width / colSpan * (ci + 1)) - 1,
        height: height
      })
    }
    for (let ri = 0; ri < rowSpan; ri++){
      for (let ci = 0; ci < colSpan; ci++){
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
        })
      }
    }
  }

  resetGridWidgets(){
    this.model.gridItems.forEach(({widget, x, y,width})=>{
      if(!widget) return
      widget.x = x
      widget.y = y
      widget.width = width
    })
  }

  initGridWidgets(){
    if(!this.props.components.length) return
    for (const item of this.props.components) {
      const cWidget = {
        ...item,
        state: 0,
        moveing: false,
        resizing: false,
        isOverlapping: false,
        baseX: item.x,
        baseY: item.y
      }

      const center = this.getCenterPoint(<DesignWidget>cWidget)
      for (const gridItem of this.model.gridItems) {
        if(this.pointInArea(center, gridItem)){
          gridItem.widget = cWidget as DesignWidget
          break
        }
      }
    }
  }

  setGridRowGap(row: number, height: number){
    let addHeight = 0
    const items = this.model.gridItems.filter(item => item.row === row)
    items.forEach(item => {
      const span = height - item.height
      if(span > addHeight) {
        addHeight = span
      }
      item.height = height
    })

    for (let i = row + 1; i <= this.model.gridRowGap.length; i++){
      const items = this.model.gridItems.filter(item => item.row === i)
      items.forEach(item => {
        if(item.widget){
          item.widget.y += addHeight
        }
        // 下面的行修改y
        item.y += addHeight
      })
    }

    this.model.gridRowGap.forEach((item, index) => {
      if(index >= row) {
        item.y += addHeight
      }
    })
    this.model.gridColGap.forEach(item => {
      item.height += addHeight
    })

    this.model.height += addHeight
  }

  // 监听组件放下(已排除重叠)
  onAddWidget(yWidget: YWidget){
    const widget = yWidget.toJSON() as DesignWidget
    if(widget.id === this.props.id) return
    const centerPoint = this.getCenterPoint(widget)
    if(this.pointInArea(centerPoint, this.gridWidget)){
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
          }
        }
      })
    }else{
      // 如果移出网格也删除
      this.model.gridItems.forEach(gridItem=>{
        // 如果其他格子有拖动的组件则删除
        if(gridItem.widget?.id===yWidget.get('id')){
          gridItem.widget = null
        }
      })
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
    for (const gridItem of this.model.gridItems) {
      if(gridItem.widget?.id === widget.id) {
        gridItem.widget = null
        break
      }
    }

    const draggingService = new DraggingService(this.service, ()=>{})
    draggingService.mousedownHandler(event, yWidget)
  }

  onDelWidgets(widgets: Array<DesignWidget>){
    widgets.forEach(widget=>{
      const idx = this.model.gridItems.findIndex(item=>item.widget?.id === widget.id)
      if(idx!==-1){
        this.model.gridItems[idx].widget = null
      }
      const { yWidget: gridYWidget } = this.service.utils.getYWidgetById(this.props.id)
      const components: Array<DesignWidget> = gridYWidget?.get('components') || []
      const cIdx = components.findIndex(item=>item.id === widget.id)
      if(cIdx!==-1){
        components.splice(cIdx, 1)
        gridYWidget?.set('components', components)
      }
    })
  }

  // 将拖入网格的组件设置到对应网格位置
  setWidgetPointToGrid(yWidget: YWidget, gridItem: GridItem){
    const widget = {
      ...yWidget.toJSON(),
      x: gridItem.x,
      y: gridItem.y,
      width: gridItem.width,
      height: gridItem.height,
      state: 0
    }
    // 删除全局的yWidget
    this.service.deleteWidget(yWidget.get("id"))
    this.service.modal.selecteds = []
    gridItem.widget = widget as DesignWidget
  }

  // 设置拖动的组件是否在网格中覆盖了其他组件 覆盖false 不覆盖true
  setNotOverlapInGrid(widgets: Array<DesignWidget>): boolean{
    if(widgets.length!==1) {
      return !!widgets.find(w=>w.id === this.props.id)
    }
    const widget = widgets[0]
    if(widget.id === this.props.id) return true
    const centerPoint = this.getCenterPoint(widget)
    if(this.pointInArea(centerPoint, this.gridWidget)){
      if(this.props.excludeComponents.includes(widget.tag)) return false;
      // 判断在哪个格子中
      return this.model.gridItems.every((gridItems,index)=>{
        const point = this.canvasP2GridP(centerPoint)
        if(this.pointInArea(point, gridItems)){
          // 判断在格子中 有没有组件 且组件不是自己
          if(gridItems.widget && gridItems.widget.id === widget.id) {
            gridItems.active = false
            return true
          }else {
            gridItems.active = !gridItems.widget;
            return !gridItems.widget
          }
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
      return!(widget.x + widget.width > this.gridWidget.x &&
        this.gridWidget.x + this.gridWidget.width > widget.x &&
        widget.y + widget.height > this.gridWidget.y &&
        this.gridWidget.y + this.gridWidget.height > widget.y);
    }
  }

  pointInArea(point: Point, area: Pick<Widget, 'x'|'y'|'width'|'height'>){
    // 判断widget的中心是否在网格控件中
    return (point.x > area.x && point.x < (area.x + area.width)
      && point.y > area.y && point.y < (area.y + area.height))
  }

  canvasP2GridP(point: Point){
    return{
      x: point.x - this.gridWidget.x,
      y: point.y - this.gridWidget.y
    }
  }

  gridP2CanvasP(point: Point|DesignWidget){
    return{
      x: point.x + this.gridWidget.x,
      y: point.y + this.gridWidget.y
    }
  }

  getCenterPoint(widget: DesignWidget){
    return {
      x: widget.x + widget.width / 2,
      y: widget.y + widget.height / 2
    }
  }
}
