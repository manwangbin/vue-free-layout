import { FieldService } from "../utils/FieldService";
import { Direction } from "../utils/FieldInterface";
import { inject, InjectionKey, provide } from "vue";

export interface RadioFieldState{
  id: string,
  label: string,
  value: string,
  direction: 'column'|'row',
  options: Array<{label: string,value: string,disabled?: boolean}>
  style: {
    flexDirection: Direction,
    alignItems: string
    [key: string]: string
  },
  labelStyle: {
    [key: string]: string
  },
  valueStyle: {
    [key: string]: string
  }
}

export function getDefaultState(): RadioFieldState{
  return {
    id: '',
    label: '单选',
    value: '0',
    direction: 'column',
    options: [{
      label: '选项1',
      value: '0'
    },{
      label: '选项2',
      value: '1'
    },{
      label: '选项3',
      value: '2'
    }],
    style: {
      flexDirection: Direction.COLUMN,
      alignItems: 'start'
    },
    labelStyle: {},
    valueStyle: {}
  }
}

export const widgetOpt = {
  tag: 'RadioField',
  name: '单选',
  width: {
    type: 'percentage',
    value: 50
  },
  height: 75,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<RadioFieldService> = Symbol()

class RadioFieldService extends FieldService<RadioFieldState> {

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

}


export function defineRadioField(){
  provide(token, new RadioFieldService())
}

export function useRadioField(){
  return inject(token)!
}

