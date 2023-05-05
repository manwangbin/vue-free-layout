export interface Point {
  // 横坐标（组件渲染时的坐标）
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
  // 是否可以改变大小
  enableResize: boolean;
  // 是否运行拖动
  enableDragable: boolean;
}

export interface DesignWidget extends Widget{
  // -1:未添加； 0: 普通状态；1: 选择状态； 2:编辑状态; 3: draging; 4: auto resize
  state: number;
  // 是否正在被拖动
  moveing: boolean;
  // 基础横坐标（鼠标在画布上的坐标）
  baseX: number;
  // 基础纵坐标
  baseY: number;
}

export interface DesignPanelRef {
  createWidget(widget: Widget): void;
  getPageWidgets(): Array<DesignWidget>;
}

export type Mixin<T, K> = {
  [P in keyof (T & K)]: (T & K)[P]
};
