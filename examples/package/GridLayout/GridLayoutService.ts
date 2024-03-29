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
  levels: 0,
  enableOverlap: true
}

export class GridLayoutService extends FieldService{
  gridLayoutRef: any = null;
  active: any = null
  id: string
  label = ''
  value = ''
  rowSpan = '5'
  colSpan = '3'
  components = []
  gridBorder = [
    'INNER_HORIZONTAL',
    'INNER_VERTICAL',
    'UP',
    'DOWN',
    'LEFT',
    'RIGHT'
  ]

  constructor(id: string, attrs: any) {
    super(attrs);
    this.id = id
    attrs.rowSpan && (this.rowSpan = attrs.rowSpan)
    attrs.colSpan  && (this.colSpan = attrs.colSpan)
    attrs.components && (this.components = attrs.components)
  }

  getState(){
    return {
      rowSpan: this.rowSpan,
      colSpan: this.colSpan
    }
  }
}
