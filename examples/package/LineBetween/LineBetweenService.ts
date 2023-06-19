import { inject, InjectionKey, provide } from "vue";
import { Direction } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";

export interface LineBetweenState{
  id: string,
  borderSize: number,
  borderStyle: string,
  borderColor: string
}

export function getDefaultState(): LineBetweenState{
  return {
    id: '',
    borderSize: 1,
    borderStyle: 'solid',
    borderColor: '#c9c9c9'
  }
}

export const widgetOpt = {
  tag: 'LineBetween',
  name: '分割线',
  width: {
    type: 'percentage',
    value: 100
  },
  height: 50,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<LineBetweenService> = Symbol()

class LineBetweenService extends FieldService<LineBetweenState>{

  constructor() {
    super();
  }

  setDirection(id: string, direction: Direction): void {
  }

}

export function defineLineBetween(){
  provide(token, new LineBetweenService())
}

export function useLineBetween(){
  return inject(token)!
}
