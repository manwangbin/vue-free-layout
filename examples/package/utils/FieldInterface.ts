
export enum Direction{
  ROW='row',
  COLUMN='column'
}

export interface FontStyle {
  fontWeight: number,
  fontStyle: string,
  fontFamily: string,
  fontSize: string,
  textDecoration: string,
  decorations: Array<'block'|'slanting'|'underline'>
}

export interface FieldInterface{
  id: string
  label: string
  value: string
  direction: Direction
  style: {
    flexDirection: Direction,
    alignItems: string
  }
  labelStyle: FontStyle
  valueStyle: FontStyle

  setDirection(id: string, direction: Direction): void

  setFontStyle(id: string, tag: 'labelStyle'|'valueStyle', selected: any[]): void

  getState(): unknown
}
