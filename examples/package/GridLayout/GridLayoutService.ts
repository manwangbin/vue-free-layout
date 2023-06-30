import { FieldInterface } from "../utils/FieldInterface";
import { FieldService } from "../utils/FieldService";

export const widgetOpt = {
  tag: 'GridLayout',
  name: '网格',
  width: {
    type: 'percentage',
    value: 100
  },
  height: 300,
  margin: [0],
  padding: [0],
  allowOverlap: true
}

export class GridLayoutService extends FieldService{
  id: string
  label = ''
  value = ''
  rowSpan = '5'
  colSpan = '3'

  constructor(id: string, attrs: any) {
    super(attrs);
    this.id = id
    attrs.rowSpan && (this.rowSpan = attrs.rowSpan)
    attrs.colSpan  && (this.colSpan = attrs.colSpan)
  }

  getState(){
    return {
      rowSpan: this.rowSpan,
      colSpan: this.colSpan
    }
  }
}
