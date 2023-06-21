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

  constructor(id: string) {
    super()
    this.id = id
  }

}
