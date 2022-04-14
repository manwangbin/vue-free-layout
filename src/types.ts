
export interface Point {
  x: number;
  y: number;
}

export interface Widget {
  id: string;
  tag: string;
  x: number;
  y: number;
  width: number;
  height: number;
  margin: Array<number>;
}

export interface DesignWidget extends Widget{
  // -1:未添加； 0: 普通状态；1: 选择状态； 2:编辑状态; 3: draging; 4: auto resize
  state: number;
}
