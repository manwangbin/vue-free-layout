import { FieldService } from "../utils/FieldService";
import { Direction } from "../utils/FieldInterface";
import { inject, InjectionKey, provide } from "vue";

export interface GridLayoutState{
  id: string,
  rowSpan: number,
  colSpan: number,
  style: {
    [key: string]: string
  },
  labelStyle: {
    [key: string]: string
  },
  valueStyle: {
    [key: string]: string
  }
}

// https://resource.zhuyiyun.com/790241614973665283/nosvA9Fvk0jj7GlQj4g1S.png
export function getDefaultState(): GridLayoutState{
  return {
    id: '',
    rowSpan: 5,
    colSpan: 3,
    style: {},
    labelStyle: {},
    valueStyle: {}
  }
}

export const widgetOpt = {
  tag: 'GridLayout',
  name: '网格',
  width: {
    type: 'percentage',
    value: 100
  },
  height: 300,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<GridLayoutService> = Symbol()

class GridLayoutService extends FieldService<GridLayoutState> {

  constructor() {
    super();
  }

  setDirection(id: string, direction: Direction): void {}

}


export function defineGridLayout(){
  provide(token, new GridLayoutService())
}

export function useGridLayout(){
  return inject(token)!
}

