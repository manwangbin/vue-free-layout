
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
}

export class GridLayoutService {
  id: string
  rowSpan = '5'
  colSpan = '3'

  constructor(id: string) {
    this.id = id
  }
}
