import { inject } from "vue";
import { Direction } from "./utils/FieldInterface";
import {
  defineTextField,
  token as TextFieldToken
} from "./TextField/TextFieldService";
import {
  definePlainTextField,
  token as PlainTextFieldToken
} from "./PlainTextField/PlainTextFieldService";
import {
  defineImageField,
  token as ImageFieldToken
} from "./ImageField/ImageFieldService";
import {
  defineLineBetween,
  token as LineBetweenToken
} from "./LineBetween/LineBetweenService";
import {
  defineRadioField,
  token as RadioToken
} from "./RadioField/RadioFieldService";
import {
  defineGridLayout,
  token as GridLayoutToken
} from "./GridLayout/GridLayoutService";


export function defineFields(){
  defineTextField()
  definePlainTextField()
  defineImageField()
  defineLineBetween()
  defineRadioField()
  defineGridLayout()
}


export function useFields(){
  const serviceSet = new Set([
    inject(TextFieldToken),
    inject(RadioToken),
  ])
  function setDirection(id: string, direction: Direction){
    serviceSet.forEach(service=>{
      if(service){
        service.setDirection(id, direction)
      }
    })
  }

  return{
    setDirection
  }
}
