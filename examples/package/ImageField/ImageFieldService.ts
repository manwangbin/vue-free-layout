import { FieldService } from "../utils/FieldService";
import { Direction } from "../utils/FieldInterface";
import { inject, InjectionKey, provide } from "vue";

export interface ImageFieldState{
  id: string,
  src: string,
  fit: 'fill'|'contain'|'cover'|'none'|'scale-down'
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
export function getDefaultState(): ImageFieldState{
  return {
    id: '',
    src: '',
    fit: 'cover',
    style: {},
    labelStyle: {},
    valueStyle: {}
  }
}

export const widgetOpt = {
  tag: 'ImageField',
  name: '图片',
  width: {
    type: 'percentage',
    value: 50
  },
  height: 220,
  margin: [0],
  padding: [0],
}

export const token: InjectionKey<ImageFieldService> = Symbol()

class ImageFieldService extends FieldService<ImageFieldState> {

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


export function defineImageField(){
  provide(token, new ImageFieldService())
}

export function useImageField(){
  return inject(token)!
}

