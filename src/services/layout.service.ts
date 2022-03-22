import { DesignWidget, Point, Widget } from '@/types'
import { InjectionKey, provide, reactive } from 'vue'

interface Modal {
  placeWidgets: Array<DesignWidget>;
}

export default class LayoutService {
  // eslint-disable-next-line symbol-description
  static token: InjectionKey<LayoutService> = Symbol();

  modal: Modal;
  constructor () {
    this.modal = reactive({
      placeWidgets: []
    })

    provide(LayoutService.token, this)
  }

  layoutAddWidget (begin: Point, end: Point): void {
    // TODO
  }

  addNewWidget (widget: Widget): void {
    // TODO
  }
}
