import { inject, InjectionKey, provide } from "vue";
import { Direction } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";

export interface PlainTextFieldState{
  id: string,
  value: string,
  style: {},
  labelStyle: {
    [key: string]: string|number|string[]
  },
  valueStyle: {
    fontFamily: string,
    fontSize: string,
    decorations: string[],
    [key: string]: string|number|string[]
  }
}

export interface FontStyle{
  fontWeight: number,
  fontStyle: string,
  textDecoration: string
}


export function getDefaultState(): PlainTextFieldState{
  return {
    id: '',
    value: '内容内容内容内容内容内容内容内容内容内容内容',
    style: {},
    labelStyle: {},
    valueStyle: {
      fontFamily: 'KaiTi',
      fontSize: '18px',
      decorations: []
    }
  }
}

export const widgetOpt = {
  tag: 'PlainTextField',
  name: '空白文本',
  width: {
    type: 'percentage',
    value: 100
  },
  height: 36,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<PlainTextFieldService> = Symbol()

class PlainTextFieldService extends FieldService<PlainTextFieldState>{

  constructor() {
    super();
  }

  setDirection(id: string, direction: Direction): void {}

  setFontStyle(id: string, selected: any[]){
    const state = this.getState(id)
    if(!state) return
    let style: FontStyle = {
      fontWeight: 400,
      fontStyle: '',
      textDecoration: ''
    }
    selected.forEach(item=>{
      style = {
        ...style,
        ...item.style
      }
    })
    state.valueStyle = {
      ...state.valueStyle,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration
    }
  }

}

export function definePlainTextField(){
  provide(token, new PlainTextFieldService())
}

export function usePlainTextField(){
  return inject(token)!
}
