import { reactive } from "vue";
import { DesignWidget } from "@/types";
import DesignService from "@/services/design.service";
import { YWidget } from "@/services/synchronize.service";


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
    this.onWidgetMove(boundary, this.adsorbNewWidge.bind(this, designService))
  }

  onWidgetGroupMove(yWidgets: Array<YWidget>){
    if(!yWidgets.length) return
    const widgets = yWidgets.map(item=>item.toJSON()) as DesignWidget[]
    const boundary = this.getBoundaryByWidget(widgets)
    this.onWidgetMove(boundary, this.adsorbWidgets.bind(this, yWidgets))
  }

  // 监听widget移动，如果designService存在，则说明是newWidget移动的
  onWidgetMove(boundary: Boundary, adsorbHandler: Function){
    this.boundaryLine.forEach(line=>{
      if(line.direction===LineDirection.ROW){
        const topDistance = this.getDistance(boundary.top, line.y)
        const bottomDistance = this.getDistance(boundary.bottom, line.y)
        if(topDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(topDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 吸附到这条线
            adsorbHandler('top', line, boundary)
          }
        }else if(bottomDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(bottomDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 移动到这条线
            adsorbHandler('bottom', line, boundary)
          }
        }else {
          line.show = false
        }
      }else if(line.direction===LineDirection.COLUMN){
        const leftDistance = this.getDistance(boundary.left, line.x)
        const rightDistance = this.getDistance(boundary.right, line.x)
        if(leftDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(leftDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 移动到这条线
            adsorbHandler('left', line, boundary)
          }
        }else if(rightDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(rightDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 移动到这条线
            adsorbHandler('right', line, boundary)
          }
        }else {
          line.show = false
        }
      }
    })
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
    this.boundaryLine.forEach(line=>{
      // 上
      if(direct[1] === 't'){
        const topDistance = this.getDistance(boundary.top, line.y)
        if(topDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(topDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 吸附到这条线
            selecteds.forEach(yWidget=>{
              // 离线的距离 = 边界位置 - 线的位置
              const offset = boundary.top - line.y
              // 渲染位置 = 鼠标位置 - 离线的距离
              yWidget.set('y', <number>yWidget.get('baseY') - offset)
              yWidget.set('height', <number>yWidget.get('height') + offset)
            })
          }
        }
      }
      //  下
      if(direct[1] === 'b'){
        const bottomDistance = this.getDistance(boundary.bottom, line.y)
        if(bottomDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(bottomDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 吸附到这条线
            selecteds.forEach(widget=>{
              // 离线的距离 = 边界位置 - 线的位置
              const offset = boundary.bottom - line.y
              // 渲染位置 = 鼠标位置 - 离线的距离
              widget.set('y', <number>widget.get('baseY'))
              widget.set('height', <number>widget.get('height') - offset)
            })
          }
        }
      }
      //  左
      if(direct[0] === 'l'){
        const leftDistance = this.getDistance(boundary.left, line.x)
        if(leftDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(leftDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 吸附到这条线
            selecteds.forEach(widget=>{
              // 离线的距离 = 边界位置 - 线的位置
              const offset = boundary.left - line.x
              // 渲染位置 = 鼠标位置 - 离线的距离
              widget.set('x', <number>widget.get('baseX') - offset)
              widget.set('width', <number>widget.get('width') + offset)
            })
          }
        }
      }
      //  右
      if(direct[0] === 'r'){
        const rightDistance = this.getDistance(boundary.right, line.x)
        if(rightDistance <= DistanceEnum.SHOW_LINE){
          // 显示这条线
          line.show = true
          if(rightDistance <= DistanceEnum.ADSORB && this.option.enableAdsorb){
            // 吸附到这条线
            selecteds.forEach(widget=>{
              // 离线的距离 = 边界位置 - 线的位置
              const offset = boundary.right - line.x
              // 渲染位置 = 鼠标位置 - 离线的距离
              widget.set('x', <number>widget.get('baseX'))
              widget.set('width', <number>widget.get('width') - offset)
            })
          }
        }
      }
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

  // 获取Widget离某条线的距离，1：达到吸附距离，2：达到显示距离，3：距离较远
  getDistance(span: number, line: number){
    const distance = Math.abs(span-line)
    if(distance < this.option.adsorbSpan) return DistanceEnum.ADSORB
    if(distance < this.option.showAlignSpan) return DistanceEnum.SHOW_LINE
    return DistanceEnum.REMOTE
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
    this.boundaryLine.push(...[
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
    ])
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
}
