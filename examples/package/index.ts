import "./style.less"

import TextField from "./TextField/index.vue";
import TextFieldOpt from "./TextField/option.vue";

import PlainTextField from "./PlainTextField/index.vue";
import PlainTextFieldOpt from "./PlainTextField/option.vue";

import ImageField from "./ImageField/index.vue";
import ImageFieldOpt from "./ImageField/option.vue";

import LineBetween from "./LineBetween/index.vue";
import LineBetweenOpt from "./LineBetween/option.vue";

import RadioField from "./RadioField/index.vue";
import RadioFieldOpt from "./RadioField/option.vue";

import GridLayout from "./GridLayout/index.vue";
import GridLayoutOpt from "./GridLayout/option.vue";

import { widgetOpt as TextFieldWidgetOpt } from "./TextField/TextFieldService";
import { widgetOpt as PlainTextFieldWidgetOpt } from "./PlainTextField/PlainTextFieldService";
import { widgetOpt as ImageFieldWidgetOpt } from "./ImageField/ImageFieldService";
import { widgetOpt as LineBetweenWidgetOpt } from "./LineBetween/LineBetweenService";
import { widgetOpt as RadioFieldWidgetOpt } from "./RadioField/RadioFieldService";
import { widgetOpt as GridLayoutWidgetOpt } from "./GridLayout/GridLayoutService";

export const Package = {
  TextField,
  TextFieldOpt,
  PlainTextField,
  PlainTextFieldOpt,
  ImageField,
  ImageFieldOpt,
  LineBetween,
  LineBetweenOpt,
  RadioField,
  RadioFieldOpt,
  GridLayout,
  GridLayoutOpt
}

export const widgets = [
  TextFieldWidgetOpt,
  PlainTextFieldWidgetOpt,
  ImageFieldWidgetOpt,
  LineBetweenWidgetOpt,
  RadioFieldWidgetOpt,
  GridLayoutWidgetOpt
]

export enum FieldEnum{
  TextField = 'TextField',
  PlainText = 'PlainText',
  ImageField = 'ImageField',
  LineBetween = 'LineBetween',
  RadioField = 'RadioField',
  GridLayout = 'GridLayout'
}

export enum FieldOptEnum{
  TextFieldOpt = 'TextFieldOpt',
  PlainTextFieldOpt = 'PlainTextFieldOpt',
  ImageFieldOpt = 'ImageFieldOpt',
  LineBetweenOpt = 'LineBetweenOpt',
  RadioFieldOpt = 'RadioFieldOpt',
  GridLayoutOpt = 'GridLayoutOpt'
}
