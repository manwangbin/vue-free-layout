import { DesignWidget, Point, Widget } from '@/types'
import { InjectionKey, provide, reactive } from 'vue'

interface Modal {
  selected?: DesignWidget;
  placeWidgets: Array<DesignWidget>;
}

export default abstract class LayoutService {
  // eslint-disable-next-line symbol-description
  static token: InjectionKey<LayoutService> = Symbol();

  modal: Modal;
  constructor () {
    this.modal = reactive({
      placeWidgets: []
    })

    provide(LayoutService.token, this)
  }

  abstract layoutAddWidget(begin: Point, end: Point): void;

  abstract addNewWidget(widget: Widget): void;

  abstract moveWidget(widget: DesignWidget, point: Point): void;

  abstract resizeWidget(widget: DesignWidget, newSize: { x: number, y: number, width: number, height: number }): void;

  abstract initWidgets(children: Array<Widget>): void;

  abstract dragEnd(widget: DesignWidget): void;
}
