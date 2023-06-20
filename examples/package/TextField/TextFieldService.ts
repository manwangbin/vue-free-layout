import { inject, InjectionKey, provide } from "vue";
import { Direction } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";

export interface TextFieldState{
  id: string,
  label: string,
  value: string,
  direction: 'column'|'row',
  style: {
    flexDirection: Direction,
    alignItems: string
  },
  labelStyle: {
    fontFamily: string,
    fontSize: string,
    decorations: string[],
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


export function getDefaultState(): TextFieldState{
  return {
    id: '',
    label: '普通字段',
    value: '内容内容内容内容内容内容内容内容内容内容内容',
    direction: 'column',
    style: {
      flexDirection: Direction.COLUMN,
      alignItems: 'start'
    },
    labelStyle: {
      fontFamily: 'KaiTi',
      fontSize: '14px',
      decorations: []
    },
    valueStyle: {
      fontFamily: 'KaiTi',
      fontSize: '18px',
      decorations: []
    }
  }
}

export const widgetOpt = {
  tag: 'TextField',
  name: '文本',
  width: {
    type: 'percentage',
    value: 100
  },
  height: 75,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<TextFieldService> = Symbol()

class TextFieldService extends FieldService<TextFieldState>{

  constructor() {
    super();
  }

  setDirection(id: string, direction: Direction): void {
    const state = this.getState(id)
    if(!state) return
    switch (direction) {
      case Direction.COLUMN:
        state.style.alignItems = 'start'
        break
      case Direction.ROW:
        state.style.alignItems = 'center'
        break
    }
    state.style.flexDirection = direction
  }

  setFontStyle(id: string, tag: 'labelStyle'|'valueStyle', selected: any[]){
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
    state[tag] = {
      ...state[tag],
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration
    }
  }

}

export function defineTextField(){
  provide(token, new TextFieldService())
}

export function useTextField(){
  return inject(token)!
}
