import { Direction } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";


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

export class ImageFieldService extends FieldService{
  id: string
  src = ''
  fit = 'cover'
  label = ''
  value = '';

  constructor(id: string, attrs: any) {
    super(attrs);
    this.id = id
    attrs.src && (this.src = attrs.src)
    attrs.fit && (this.fit = attrs.fit)
    attrs.label && (this.label = attrs.label)
    attrs.value && (this.value = attrs.value)
  }

  setDirection(id: string, direction: Direction): void {}

  getState(){
    return {
      src: this.src,
      fit: this.fit,
      style: this.style,
      labelStyle: this.labelStyle,
      valueStyle: this.labelStyle
    }
  }
}
