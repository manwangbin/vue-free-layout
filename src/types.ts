import DesignService from './services/design.service'

export interface Point {
  // 横坐标
  x: number;
  // 纵坐标
  y: number;
}

export interface Widget extends Point {
  // 控件id
  id: string;
  // 控件类型
  tag: string;
  // 宽度，总宽度安置750来计算
  width: number;
  // 高度
  height: number;
  // margin
  margin: Array<number>;
  // padding
  padding: Array<number>;
}

export interface DesignWidget extends Widget{
  // -1:未添加； 0: 普通状态；1: 选择状态； 2:编辑状态; 3: draging; 4: auto resize
  state: number;
}

export abstract class LayoutService {
  designService?: DesignService;

  setDesignService (designService: DesignService) {
    this.designService = designService
  }

  abstract addNewWidget(widget: Widget): void;

  abstract dragBegin(widget: DesignWidget): void

  abstract dragEnd(widget: DesignWidget, oldPosition: Point): void;

  abstract resizedWidget(widget: DesignWidget, newSize: { x: number, y: number, width: number, height: number }): void;
}
