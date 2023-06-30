import { FieldService } from "../utils/FieldService";

export interface FontStyle{
  fontWeight: number,
  fontStyle: string,
  textDecoration: string
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


export class TextFieldService extends FieldService{
  id: string
  label = '普通字段'
  value = '内容内容内容内容内容内容内容内容内容内容内容'

  constructor(id: string, attrs: any) {
    super(attrs)
    this.id = id
    attrs.label && (this.label = attrs.label)
    attrs.value && (this.value = attrs.value)
  }

  getState() {
    return {
      label: this.label,
      value: this.value,
      style: this.style,
      direction: this.direction,
      labelStyle: this.labelStyle,
      valueStyle: this.valueStyle
    }
  }

}
