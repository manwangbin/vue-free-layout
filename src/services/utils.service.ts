import DesignService from "@/services/design.service";
import { Boundary, DesignWidget, Point } from "@/types";
import { YWidget } from "@/services/synchronize.service";


export default class UtilsService{


  constructor(private service: DesignService) {
  }


  /**
   * 重新计算页面布局
   */
  recountPage () {
    const modal = this.service.modal
    const viewWidth = modal.pageRect.width * modal.scale + DesignService.SPAN * 2
    if (viewWidth < modal.canvaseRect.width) {
      modal.pageRect.cwidth = modal.canvaseRect.width / modal.scale
    } else {
      modal.pageRect.cwidth = viewWidth / modal.scale
    }

    const viewHeight = (modal.pageRect.height + DesignService.SPAN * 2) * modal.scale
    if (viewHeight < modal.canvaseRect.height) {
      modal.pageRect.cheight = modal.canvaseRect.height / modal.scale
    } else {
      modal.pageRect.cheight = viewHeight / modal.scale
    }

    modal.pageRect.x = (modal.pageRect.cwidth - modal.pageRect.width) / 2
    modal.pageRect.y = DesignService.SPAN / modal.scale

    this.service.emit('page-resized', modal.pageRect)
  }

  // 拖动widget时自动拓展高度
  autoHeight(bottom: number){
    if (!this.service.props.autoHeight) return
    // 自动高度
    let span = bottom - this.service.modal.pageRect.height+this.service.modal.pageRect.padding[2]
    if(span>=0){
      span = span>10?span:10
      this.service.modal.pageRect.height += span
      this.service.modal.pageRect.cheight += span
      this.service.alignLineService?.setPaddingLine()
      this.service.emit("addHeight", this.service.modal.pageRect.height, span)
    }
  }

  paddingFormat(padding: number[]): [number,number,number,number]{
    let p: [number,number,number,number] = [0, 0, 0, 0]
    if(padding.length===1){
      p = [padding[0],padding[0],padding[0],padding[0]]
    }else if(padding.length===2){
      p = [padding[0],padding[1],padding[0],padding[1]]
    }else if(padding.length===3){
      p = [padding[0],padding[1],padding[1],padding[2]]
    }else if(padding.length===4){
      p = padding as [number,number,number,number]
    }
    return p
  }

  // 拖动的widgets是否不覆盖页面上的widgets
  isNotOverlap(widgets: DesignWidget[]){
    const {top, bottom, left, right} = this.getBoundaryByWidget(widgets)
    // 先判断是否在页面中
    const pageRect = this.service.modal.pageRect

    if(left + (right-left)/2 < 0 || top + (bottom-top)/2 < 0 || right - (right-left)/2>pageRect.width){
      return false
    }
    // 拖动的组件每个都允许覆盖则返回true
    if(widgets.every(item=>item.enableOverlap)) return true
    return this.service.modal.widgets.every(widget=>{
      if(widget.enableOverlap) return true
      // 排除被选中的widget
      if(widgets.some(item=>item.id===widget.id)) return true

      let span = this.service.props.adsorbSpan - 1

      span = span < 0 ? 0 : span

      return !(right > widget.x + span &&
        widget.x + widget.width > left + span &&
        bottom > widget.y + span &&
        widget.y + widget.height > top + span);
    })
  }

  // 计算多个widget构成的边界
  getBoundaryByWidget(widgets: Array<DesignWidget>): Boundary{
    const tList: number[] = []
    const bList: number[] = []
    const lList: number[] = []
    const rList: number[] = []
    widgets.forEach(widget=>{
      const {
        top, bottom,
        left, right
      } = this.widget2Boundary(widget)
      tList.push(top)
      bList.push(bottom)
      lList.push(left)
      rList.push(right)
    })
    const top = Math.min.apply(null, tList)
    const bottom = Math.max.apply(null, bList)
    const left = Math.min.apply(null, lList)
    const right = Math.max.apply(null, rList)
    return {
      top, bottom, left, right
    }
  }

  // 是否在页面内
  inCanvase (event: MouseEvent) {
    const modal = this.service.modal
    if (modal.newWidget) {
      return (event.clientX - modal.canvaseRect.x - modal.pageRect.x > 0) &&
        (event.clientY - modal.canvaseRect.y - modal.pageRect.y > 0) &&
        (event.clientX < modal.canvaseRect.x + modal.pageRect.x + modal.pageRect.width) &&
        (event.clientY < modal.canvaseRect.y + modal.pageRect.y + modal.pageRect.height)
    } else {
      return false
    }
  }

  // 获取widget的边界
  widget2Boundary(widget: DesignWidget){
    return {
      left: widget.x,
      right: widget.x + widget.width,
      top: widget.y,
      bottom: widget.y + widget.height
    }
  }

  newWidgetP2CavnaseP = (point: Point) => {
    return {
      x: (point.x - this.service.canvase2PanelRect.value.x + this.service.modal.scrollLeft) /
        this.service.modal.scale - this.service.modal.pageRect.x,
      y: (point.y - this.service.canvase2PanelRect.value.y + this.service.modal.scrollTop) /
        this.service.modal.scale - this.service.modal.pageRect.y
    }
  }

  cavnaseP2NewWidgetP = (point: Point) => {
    return {
      x: (point.x + this.service.modal.pageRect.x)*this.service.modal.scale -
        this.service.modal.scrollLeft + this.service.canvase2PanelRect.value.x,
      y: (point.y + this.service.modal.pageRect.y)*this.service.modal.scale -
        this.service.modal.scrollTop + this.service.canvase2PanelRect.value.y
    }
  }

  getYWidgetById(id: string): {yWidget: YWidget|undefined, index: number}{
    let yWidgets = this.service.syncService.yWidget.toArray()
    const idx = yWidgets.findIndex(item=>item.get('id')===id)
    return {
      yWidget: this.service.syncService.yWidget.get(idx),
      index: idx
    }
  }
}
