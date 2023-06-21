import { Direction } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";


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


export class LineBetweenService{
  id: string
  borderSize = 1
  borderStyle = 'solid'
  borderColor = '#c9c9c9'
  constructor(id: string) {
    this.id = id
  }
}
