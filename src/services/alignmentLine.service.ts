import { reactive } from "vue";
import { Boundary, DesignWidget } from "@/types";
import DesignService from "@/services/design.service";
import { UpdateData, YWidget } from "@/services/synchronize.service";
import { CheckType } from "@/utils/checkType";
import * as Y from "yjs";


export enum LineDirection {
  ROW,
  COLUMN
}

export enum DistanceEnum {
  ADSORB,
  SHOW_LINE,
  REMOTE
}


interface Line {
  id: string
  direction: LineDirection,
  x: number,
  y: number,
  show: boolean
}

export interface BoundaryLine extends Line{
  width: number|string,
  height: number|string
}

export interface AlignmentOption {
  showAlign: boolean,
  enableAdsorb: boolean,
  alignWeight: number,
  alignColor: string,
  showAlignSpan: number,
  adsorbSpan: number,
  pagePadding: [number,number,number,number]
}


export default class AlignmentLineService {

  boundaryLine: Array<BoundaryLine> = []

  constructor(public option: AlignmentOption, public designService: DesignService) {
    // 初始化边界线
    this.boundaryLine = reactive([])
    designService.emitter.on('onLayout', this.setPaddingLine.bind(this))
  }

  setPaddingLine(){
    this.designService.emitter.off('onLayout', this.setPaddingLine)
    this.delBoundaryLine('padding')
    const padding = this.designService.modal.pageRect.padding
    this.boundaryLine.push(...[
      {
        id: 'padding-top',
        direction: LineDirection.ROW,
        show: false,
        x: 0,
        y: padding[0],
        width: '100%',
        height: '0'
      },{
        id: 'padding-bottom',
        direction: LineDirection.ROW,
        show: false,
        x: 0,
        y: this.designService.modal.pageRect.height - padding[2],
        width: '100%',
        height: '0'
      },{
        id: 'padding-left',
        direction: LineDirection.COLUMN,
        show: false,
        x: padding[3],
        y: 0,
        width: '0',
        height: '100%'
      },{
        id: 'padding-right',
        direction: LineDirection.COLUMN,
        show: false,
        x: this.designService.modal.pageRect.width - padding[1],
        y: 0,
        width: '0',
        height: '100%'
      }
    ])
  }

  // 监听newWidget移动的
  onNewWidgetMove(widgets: Array<DesignWidget>, designService: DesignService){
    if(!widgets.length) return
    const boundary = this.designService.utils.getBoundaryByWidget(widgets)
    this.handlerWidgetMove(boundary, this.adsorbNewWidge.bind(this, designService))
  }

  // 监听一组Widget移动
  onWidgetGroupMove(yWidgets: Array<YWidget>){
    if(!yWidgets.length) return
    const widgets = yWidgets.map(item=>item.toJSON()) as DesignWidget[]
    const boundary = this.designService.utils.getBoundaryByWidget(widgets)
    this.handlerWidgetMove(boundary, this.adsorbWidgets.bind(this, yWidgets))
  }

  // 处理widget移动
  handlerWidgetMove(boundary: Boundary, adsorbHandler: Function){
    // 横向距离最小的线
    let minRow: any = null
    // 纵向距离最小的线
    let minCol: any = null
    this.boundaryLine.forEach(line=>{
      if(line.direction===LineDirection.ROW){
        const topDistance = this.getDistance(boundary.top, line.y)
        const bottomDistance = this.getDistance(boundary.bottom, line.y)
        if(topDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(topDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minRow===null || topDistance.distance < minRow.distance){
              minRow = {
                place: 'top',
                line,
                boundary,
                distance: topDistance.distance
              }
            }
          }
        }else if(bottomDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(bottomDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minRow===null || bottomDistance.distance < minRow.distance){
              minRow = {
                place: 'bottom',
                line,
                boundary,
                distance: bottomDistance.distance
              }
            }
          }
        }else {
          line.show = false
        }
      }
      if(line.direction===LineDirection.COLUMN){
        const leftDistance = this.getDistance(boundary.left, line.x)
        const rightDistance = this.getDistance(boundary.right, line.x)
        if(leftDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(leftDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minCol===null || leftDistance.distance < minCol.distance){
              minCol = {
                place: 'left',
                line,
                boundary,
                distance: leftDistance.distance
              }
            }
          }
        }else if(rightDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(rightDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minCol===null || rightDistance.distance < minCol.distance){
              minCol = {
                place: 'right',
                line,
                boundary,
                distance: rightDistance.distance
              }
            }
          }
        }else {
          line.show = false
        }
      }
    })
    minRow && adsorbHandler(minRow.place, minRow.line, minRow.boundary)
    minCol && adsorbHandler(minCol.place, minCol.line, minCol.boundary)
  }

  // 吸附新创建的widget
  adsorbNewWidge(designService: DesignService, place: string, line: BoundaryLine){
    if(!designService.modal.newWidget) return
    const {x, y} = designService.utils.cavnaseP2NewWidgetP(line)
    switch (place){
      case 'top':
        designService.modal.newWidget.y = y
        break
      case 'bottom':
        designService.modal.newWidget.y = y - designService.modal.newWidget.height
        break
      case 'left':
        designService.modal.newWidget.x = x
        break
      case 'right':
        designService.modal.newWidget.x = x - designService.modal.newWidget.width
        break
    }
  }

  // 吸附移动的一组widget
  adsorbWidgets(yWidgets: Array<YWidget>, place: string, line: BoundaryLine, boundary: Boundary){
    switch(place){
      case 'top':
        yWidgets.forEach(yWidget=>{
          // 离线的距离 = 边界位置 - 线的位置
          const offset = boundary.top - line.y
          // 渲染位置 = 鼠标位置 - 离线的距离
          yWidget.set('y', <number>yWidget.get('baseY') - offset)
        })
        break
      case 'bottom':
        yWidgets.forEach(yWidget=>{
          // 离线的距离 = 边界位置 - 线的位置
          const offset = boundary.bottom - line.y
          yWidget.set('y', <number>yWidget.get('baseY') - offset)
        })
        break
      case 'left':
        yWidgets.forEach(yWidget=>{
          // 离线的距离 = 边界位置 - 线的位置
          const offset = boundary.left - line.x
          // 渲染位置 = 鼠标位置 - 离线的距离
          yWidget.set('x', <number>yWidget.get('baseX') - offset)
        })
        break
      case 'right':
        yWidgets.forEach(yWidget=>{
          // 离线的距离 = 边界位置 - 线的位置
          const offset = boundary.right - line.x
          // 渲染位置 = 鼠标位置 - 离线的距离
          yWidget.set('x', <number>yWidget.get('baseX') - offset)
        })
        break
    }
  }

  // 监听选中区域边界的移动
  onBoundaryMove(selecteds: Array<YWidget>, direct: string[]){
    const widgets = selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const boundary = this.designService.utils.getBoundaryByWidget(widgets)

    let minTop: any = null
    let minBottom: any = null
    let minLeft: any = null
    let minRight: any = null

    this.boundaryLine.forEach(line=>{
      // 上
      if(direct[1] === 't'){
        const topDistance = this.getDistance(boundary.top, line.y)
        if(topDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(topDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minTop===null || topDistance.distance < minTop.distance){
              minTop = {
                line,
                distance: topDistance.distance
              }
            }
          }
        }
      }
      //  下
      if(direct[1] === 'b'){
        const bottomDistance = this.getDistance(boundary.bottom, line.y)
        if(bottomDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(bottomDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minBottom===null || bottomDistance.distance < minBottom.distance){
              minBottom = {
                line,
                distance: bottomDistance.distance
              }
            }
          }
        }
      }
      //  左
      if(direct[0] === 'l'){
        const leftDistance = this.getDistance(boundary.left, line.x)
        if(leftDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(leftDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minLeft===null || leftDistance.distance < minLeft.distance){
              minLeft = {
                line,
                distance: leftDistance.distance
              }
            }
          }
        }
      }
      //  右
      if(direct[0] === 'r'){
        const rightDistance = this.getDistance(boundary.right, line.x)
        if(rightDistance.tag <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(rightDistance.tag <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            if(minRight===null || rightDistance.distance < minRight.distance){
              minRight = {
                line,
                boundary,
                distance: rightDistance.distance
              }
            }
          }
        }
      }
    })

    if(minTop!==null){
      // 吸附到这条线
      selecteds.forEach(yWidget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.top - minTop.line.y
        // 渲染位置 = 鼠标位置 - 离线的距离
        yWidget.set('y', <number>yWidget.get('baseY') - offset)
        yWidget.set('height', <number>yWidget.get('height') + offset)
      })
    }
    if(minBottom!==null){
      // 吸附到这条线
      selecteds.forEach(yWidget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.bottom - minBottom.line.y
        // 渲染位置 = 鼠标位置 - 离线的距离
        yWidget.set('y', <number>yWidget.get('baseY'))
        yWidget.set('height', <number>yWidget.get('height') - offset)
      })
    }
    if(minLeft!==null){
      // 吸附到这条线
      selecteds.forEach(yWidget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.left - minLeft.line.x
        // 渲染位置 = 鼠标位置 - 离线的距离
        yWidget.set('x', <number>yWidget.get('baseX') - offset)
        yWidget.set('width', <number>yWidget.get('width') + offset)
      })
    }
    if(minRight!==null){
      // 吸附到这条线
      selecteds.forEach(yWidget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.right - minRight.line.x
        // 渲染位置 = 鼠标位置 - 离线的距离
        yWidget.set('x', <number>yWidget.get('baseX'))
        yWidget.set('width', <number>yWidget.get('width') - offset)
      })
    }
  }


  // 获取Widget离某条线的距离，1：达到吸附距离，2：达到显示距离，3：距离较远
  getDistance(span: number, line: number): {distance: number, tag: DistanceEnum}{
    const distance = Math.abs(span-line)
    let tag = DistanceEnum.REMOTE
    if(distance < this.option.showAlignSpan) {tag = DistanceEnum.SHOW_LINE}
    if(distance < this.option.adsorbSpan) {tag = DistanceEnum.ADSORB}
    return {
      distance,
      tag
    }
  }

  // 新增线
  addBoundaryLine(widget: DesignWidget){
    const lineList = [
      {
        id: widget.id + '-top',
        direction: LineDirection.ROW,
        show: false,
        x: 0,
        y: widget.y,
        width: '100%',
        height: '0'
      },{
        id: widget.id + '-bottom',
        direction: LineDirection.ROW,
        show: false,
        x: 0,
        y: widget.y + widget.height,
        width: '100%',
        height: '0'
      },{
        id: widget.id + '-left',
        direction: LineDirection.COLUMN,
        show: false,
        x: widget.x,
        y: 0,
        width: '0',
        height: '100%'
      },{
        id: widget.id + '-right',
        direction: LineDirection.COLUMN,
        show: false,
        x: widget.x + widget.width,
        y: 0,
        width: '0',
        height: '100%'
      }
    ]
    lineList.forEach(line=>{
      const idx = this.boundaryLine.findIndex(item=>item.id === line.id)
      // 已存在的修改，不存在的新增
      if(idx!==-1){
        this.boundaryLine[idx] = Object.assign(this.boundaryLine[idx], line)
      }else{
        this.boundaryLine.push(line)
      }
    })
  }

  // 删除线
  delBoundaryLine(id: string){
    let idx = this.boundaryLine.findIndex(item=>item.id === id+'-top')
    idx!==-1&&this.boundaryLine.splice(idx,1)
    idx = this.boundaryLine.findIndex(item=>item.id === id+'-bottom')
    idx!==-1&&this.boundaryLine.splice(idx,1)
    idx = this.boundaryLine.findIndex(item=>item.id === id+'-left')
    idx!==-1&&this.boundaryLine.splice(idx,1)
    idx = this.boundaryLine.findIndex(item=>item.id === id+'-right')
    idx!==-1&&this.boundaryLine.splice(idx,1)
  }

  // 删除所有线
  clearAllLine(){
    this.boundaryLine.length = 0
  }

  // 隐藏所有线
  hideAllLine(){
    this.boundaryLine.forEach(line=>{
      line.show = false
    })
  }

  // 根据yjs更新的数据处理对齐线
  handlerAlignmentLine(updateData: UpdateData){
    if(updateData.type==='array'){
      if(CheckType.isArray(updateData.deltaData?.insert)){
        updateData.deltaData?.insert.forEach(item=>{
          if(item instanceof Y.Map){
            this.addBoundaryLine(item.toJSON() as DesignWidget)
          }
        })
      }
    }else if(updateData.type==='map'){
      if(updateData.target.get('moveing') === true || updateData.target.get('resizing') === true){
        // 移动或改变大小时删除线
        this.delBoundaryLine(updateData.target.get('id'))
      }else if(updateData.target.get('moveing') === false || updateData.target.get('resizing') === false){
        // 停止移动或停止改变大小新增线
        this.addBoundaryLine(updateData.target.toJSON())
        this.hideAllLine()
      }
    }
  }

  // 左对齐
  leftJustify(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {left} = this.designService.utils.getBoundaryByWidget(widgets)
    this.designService.modal.selecteds.forEach(yWidgets=>yWidgets.set('x', left))
  }

  // 右对齐
  rightJustify(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {right} = this.designService.utils.getBoundaryByWidget(widgets)
    this.designService.modal.selecteds.forEach(yWidgets=>{
      const width = yWidgets.get('width') as number
      yWidgets.set('x', right - width)
    })
  }

  // 上对齐
  topJustify(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {top} = this.designService.utils.getBoundaryByWidget(widgets)
    this.designService.modal.selecteds.forEach(yWidgets=>yWidgets.set('y', top))
  }

  // 下对齐
  bottomJustify(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {bottom} = this.designService.utils.getBoundaryByWidget(widgets)
    this.designService.modal.selecteds.forEach(yWidgets=>{
      const height = yWidgets.get('height') as number
      yWidgets.set('y', bottom - height)
    })
  }

  // 横向两端对齐
  rowBetween(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {left, right} = this.designService.utils.getBoundaryByWidget(widgets)
    // 计算所有widget的宽度
    const widgetsWidth = widgets.reduce((total, widget)=>total + widget.width, 0)
    const boundaryWidth = right - left
    const interval = (boundaryWidth - widgetsWidth) / (widgets.length - 1)

    let currentLeft = left
    this.designService.modal.selecteds.sort((a, b)=><number>a.get('x') - <number>b.get('x'))
      .forEach((yWidget,index)=>{
        if(index===0){
          currentLeft += yWidget.get('width') as number
        }else{
          currentLeft += interval
          yWidget.set('x', currentLeft)
          currentLeft += yWidget.get('width') as number
        }
      })
  }

  // 纵向两端对齐
  columnBetween(){
    const widgets = this.designService.modal.selecteds.map(item=>item.toJSON()) as DesignWidget[]
    const {top, bottom} = this.designService.utils.getBoundaryByWidget(widgets)
    // 计算所有widget的宽度
    const widgetsHeight = widgets.reduce((total, widget)=>total + widget.height, 0)
    const boundaryHeight = bottom - top
    const interval = (boundaryHeight - widgetsHeight) / (widgets.length - 1)

    let currentTop = top
    this.designService.modal.selecteds.sort((a, b)=><number>a.get('y') - <number>b.get('y'))
      .forEach((yWidget,index)=>{
        if(index===0){
          currentTop += yWidget.get('height') as number
        }else{
          currentTop += interval
          yWidget.set('y', currentTop)
          currentTop += yWidget.get('height') as number
        }
      })
  }
}
