import { Direction, FieldInterface } from "./FieldInterface";
import { FontStyle } from "../TextField/TextFieldService";


export abstract class FieldService implements FieldInterface{
  abstract id: string;
  abstract label: string;
  abstract value: string;
  direction = Direction.COLUMN;
  style = {
    flexDirection: Direction.COLUMN,
    alignItems: 'start'
  }
  labelStyle = {
    fontWeight: 400,
    fontStyle: '',
    fontFamily: 'KaiTi',
    fontSize: '14px',
    textDecoration: '',
    decorations: []
  }
  valueStyle = {
    fontWeight: 400,
    fontStyle: '',
    fontFamily: 'KaiTi',
    fontSize: '18px',
    textDecoration: '',
    decorations: []
  }

  setDirection(id: string, direction: Direction): void{
    switch (direction) {
      case Direction.COLUMN:
        this.style.alignItems = 'start'
        break
      case Direction.ROW:
        this.style.alignItems = 'center'
        break
    }
    this.style.flexDirection = direction
  }

  setFontStyle(id: string, tag: "labelStyle" | "valueStyle", selected: any[]): void{
    let style: FontStyle = {
      fontWeight: 400,
      fontStyle: '',
      textDecoration: ''
    }
    selected.forEach(item=>{
      style = {
        ...style,
        ...item.style
      }
    })
    this[tag] = {
      ...this[tag],
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration
    }
  }

}
