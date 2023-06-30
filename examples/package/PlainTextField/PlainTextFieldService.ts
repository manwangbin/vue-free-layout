import { FieldService } from "../utils/FieldService";

export interface FontStyle{
  fontWeight: number,
  fontStyle: string,
  textDecoration: string
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

export class PlainTextFieldService extends FieldService{
  id: string
  label = ''
  value = '内容内容内容内容内容内容内容内容内容内容内容'

  constructor(id: string, attrs: any) {
    super(attrs)
    this.id = id
    attrs.value && (this.value = attrs.value)
  }

  getState(){
    return {
      value: this.value
    }
  }
}
