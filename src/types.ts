import DesignService from "@/services/design.service";
import { Ref } from "vue";

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
  // 宽度
  width: number;
  // 高度
  height: number;
  // margin
  margin: [number, number, number, number];
  // padding
  padding: [number, number, number, number];
  // 是否可以改变大小
  enableResize: boolean;
  // 是否运行拖动
  enableDragable: boolean;
  // 是否允许重叠 enable
  enableOverlap: boolean,
  levels: number,
  // components
  components?: Array<Omit<Widget, 'components'>>
}

export interface DesignWidget extends Widget{
  // -1:未添加； 0: 普通状态；1: 选择状态； 2:编辑状态; 3: draging; 4: auto resize
  state: number;
  // 是否正在被拖动
  moveing: boolean;
  // 是否正在改变大小
  resizing: boolean;
  // 基础横坐标（鼠标在画布上的坐标）
  baseX: number;
  // 基础纵坐标
  baseY: number;
  // 是否重叠了
  isOverlapping: boolean
}

export interface DesignPanelRef {
  service: DesignService;
  createWidget(widget: Widget): void;
  getPageWidgets(): Array<DesignWidget>;
}

export interface Boundary{
  top: number,
  bottom: number,
  left: number,
  right: number
}
