import { reactive } from "vue";
import { DesignWidget } from "@/types";
import DesignService from "@/services/design.service";
import { UpdateData, YWidget } from "@/services/synchronize.service";
import { CheckType } from "@/util/checkType";
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

interface Boundary{
  top: number,
  bottom: number,
  left: number,
  right: number
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
  adsorbSpan: number
}


export default class AlignmentLine {

  boundaryLine: Array<BoundaryLine> = []

  constructor(public option: AlignmentOption) {
    this.boundaryLine = reactive([])
  }

  // 监听newWidget移动的
  onNewWidgetMove(widgets: Array<DesignWidget>, designService: DesignService){
    if(!widgets.length) return
    const boundary = this.getBoundaryByWidget(widgets)
    this.handlerWidgetMove(boundary, this.adsorbNewWidge.bind(this, designService))
  }

  // 监听一组Widget移动
  onWidgetGroupMove(yWidgets: Array<YWidget>){
    if(!yWidgets.length) return
    const widgets = yWidgets.map(item=>item.toJSON()) as DesignWidget[]
    const boundary = this.getBoundaryByWidget(widgets)
    this.handlerWidgetMove(boundary, this.adsorbWidgets.bind(this, yWidgets))
  }

  // 处理widget移动
  handlerWidgetMove(boundary: Boundary, adsorbHandler: Function){
    // 横行距离最小的线
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
    const {x, y} = designService.cavnaseP2NewWidgetP(line)
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
    const boundary = this.getBoundaryByWidget(widgets)

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
      selecteds.forEach(widget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.bottom - minBottom.line.y
        // 渲染位置 = 鼠标位置 - 离线的距离
        widget.set('y', <number>widget.get('baseY'))
        widget.set('height', <number>widget.get('height') - offset)
      })
    }
    if(minLeft!==null){
      // 吸附到这条线
      selecteds.forEach(widget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.left - minLeft.line.x
        // 渲染位置 = 鼠标位置 - 离线的距离
        widget.set('x', <number>widget.get('baseX') - offset)
        widget.set('width', <number>widget.get('width') + offset)
      })
    }
    if(minRight!==null){
      // 吸附到这条线
      selecteds.forEach(widget=>{
        // 离线的距离 = 边界位置 - 线的位置
        const offset = boundary.right - minRight.line.x
        // 渲染位置 = 鼠标位置 - 离线的距离
        widget.set('x', <number>widget.get('baseX'))
        widget.set('width', <number>widget.get('width') - offset)
      })
    }
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

  widget2Boundary(widget: DesignWidget){
    return {
      left: widget.x,
      right: widget.x + widget.width,
      top: widget.y,
      bottom: widget.y + widget.height
    }
  }

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
}
