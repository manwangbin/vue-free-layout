import { Direction } from "../utils/FieldInterface";


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

export class ImageFieldService{
  id: string
  src = ''
  fit = 'cover'
  style = {}
  labelStyle = {}
  valueStyle = {}

  constructor(id: string) {
    this.id = id
  }

  setDirection(id: string, direction: Direction): void {}
}
