import { FieldService } from "../utils/FieldService";

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


export class RadioFieldService extends FieldService{
  id: string
  label = '单选'
  value = '0'
  options = [{
    label: '选项1',
    value: '0'
  },{
    label: '选项2',
    value: '1'
  },{
    label: '选项3',
    value: '2'
  }]

  constructor(id: string) {
    super()
    this.id = id
  }
}
