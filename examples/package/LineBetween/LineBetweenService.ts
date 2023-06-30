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


export class LineBetweenService extends FieldService{
  id: string
  label = ''
  value = ''
  borderSize = 1
  borderStyle = 'solid'
  borderColor = '#c9c9c9'
  constructor(id: string, attrs: any) {
    super(attrs);
    this.id = id
    attrs.borderSize && (this.borderSize = attrs.borderSize)
    attrs.borderStyle && (this.borderStyle = attrs.borderStyle)
    attrs.borderColor && (this.borderColor = attrs.borderColor)
  }

  getState(){
    return{
      borderSize: this.borderSize,
      borderStyle: this.borderStyle,
      borderColor: this.borderColor
    }
  }
}
