import { DesignWidget, Point, Widget } from '@/types'
import { defineComponent, h, inject, onMounted, PropType, reactive, ref, Ref } from 'vue'
import CRuler from './c_ruler'
import FreeLayout from './design_free_layout'
import FreeLayoutService from '../services/free_layout.service'
import SizeBox from './size_box'
import './style.less'
import DesignContainerService from '@/services/design_panel.service'
import LayoutService from '@/services/layout.service'
import LtLayoutSrevice from '@/services/lt_layout.service'

interface PageInfo {
  width: number,
  height: number,
  hstart: number,
  vstart: number,
  hrulerWidth: number,
  vrulerWidth: number
}

const RULTER_HEIGHT = 18

export default defineComponent({
  name: 'DesignPanel',

  props: {
    layout: {
      type: String as PropType<'lt' | 'ct' | 'abslout'>,
      default: 'abslout'
    },

    // 页面分多少格
    square: {
      type: Number,
      default: 0
    },

    scale: {
      type: Number,
      default: 1
    },

    unit: {
      type: String as PropType<'px' | 'mm' | 'cm'>,
      default: 'px'
    },

    width: {
      type: Number,
      required: true
    },

    height: {
      type: Number,
      required: true
    },

    padding: {
      type: Array as PropType<Array<number>>,
      default: () => [0]
    },

    drawerBackgroud: {
      type: String,
      default: '#ffffff'
    },

    backgroundColor: {
      type: String,
      default: '#e5e5e5'
    },

    rulerColorLight: {
      type: String,
      default: '#9a9a9a'
    },

    rulerColorDark: {
      type: String,
      default: '#646464 '
    },

    children: {
      type: Array as PropType<Array<Widget>>,
      default: () => []
    }
  },

  setup (props, { emit, slots }) {
    const container: Ref<HTMLElement | null> = ref(null)
    const pageInfo = reactive({ width: 0, height: 0, hstart: RULTER_HEIGHT * 2, vstart: RULTER_HEIGHT * 3 } as PageInfo)

    const lineBegin = props.padding.length === 4 ? props.padding[3] : props.padding[0]
    const lineEnd = props.width - (props.padding.length === 4 ? props.padding[1] : props.padding[0])
    const lineMax = lineEnd - lineBegin
    const service: LayoutService = props.layout === 'abslout' ? new FreeLayoutService(lineBegin, lineEnd, lineMax, props.padding[0]) : new LtLayoutSrevice(lineBegin, lineEnd, lineMax, props.padding[0])
    const desingContainerService = inject(DesignContainerService.token) as DesignContainerService
    desingContainerService.layoutService = service
    let sizeChangeTimer: number | undefined

    onMounted(() => {
      window.addEventListener('resize', windowsResizeHandler, true)
      windowsResizeHandler()
    })

    const widgetSelectedHandler = (event: any) => {
      if (service.modal.selected) {
        service.modal.selected.state = 0
        service.modal.selected = undefined
      }

      const findChild = service.modal.placeWidgets.find((item: DesignWidget) => item.id === event.id)
      if (findChild) {
        findChild.state = 1
        service.modal.selected = findChild
      }
    }

    const widgetStateChanagedHandler = (event: any) => {
      const findChild = service.modal.placeWidgets.find((item: DesignWidget) => item.id === event.id)
      if (findChild) {
        findChild.state = event.state
      }
    }

    const widgetMoveHandler = (position: Point) => {
      if (service.modal.selected) {
        service.moveWidget(service.modal.selected, position)
      }
    }

    const widgetEndHandler = (widget: DesignWidget) => {
      service.dragEnd(widget)
      // emit('update:children', service.modal.placeWidgets)
    }

    const windowsResizeHandler = () => {
      if (container.value) {
        const elStyle = window.getComputedStyle(container.value)
        if (elStyle) {
          pageInfo.width = parseInt(elStyle.width)
          pageInfo.height = parseInt(elStyle.height)

          if (sizeChangeTimer) {
            clearTimeout(sizeChangeTimer)
          }
          sizeChangeTimer = setTimeout(() => {
            relayoutPage()
            sizeChangeTimer = undefined
          }, 100)
        }
      }
    }

    const selectedWidgetSizeChanageHandler = (size: any) => {
      if (service.modal.selected && service.modal.selected.id) {
        const children = service.modal.placeWidgets
        const findChild = children.find(item => item.id === service.modal.selected?.id) as any
        if (findChild) {
          service.resizeWidget(findChild, size)
        }
      }
    }

    const clickBackgroundHandler = () => {
      if (service.modal.selected) {
        service.modal.selected.state = 0
        service.modal.selected = undefined
      }
    }

    const relayoutPage = () => {
      pageInfo.hstart = (pageInfo.width - props.width) / 2
      if (pageInfo.height < (props.height + pageInfo.vstart * 2)) {
        pageInfo.height = (props.height + pageInfo.vstart * 2)
      }
      pageInfo.hrulerWidth = (pageInfo.width - RULTER_HEIGHT)
      pageInfo.vrulerWidth = (pageInfo.height - RULTER_HEIGHT)

      if (container.value) {
        const clientRect = container.value.getBoundingClientRect()
        desingContainerService.modal.contentRect = {
          x: clientRect.left + pageInfo.hstart,
          y: clientRect.top + pageInfo.vstart,
          width: pageInfo.width,
          height: pageInfo.height
        }
      }
      relayoutChildren()
    }

    const relayoutChildren = () => {
      service.initWidgets(props.children)
      emit('update:children', service.modal.placeWidgets)
    }

    const renderDrawer = () => {
      return h(
        FreeLayout,
        {
          background: props.drawerBackgroud,
          width: props.width,
          height: props.height,
          style: {
            left: pageInfo.hstart + 'px',
            top: pageInfo.vstart + 'px'
          },
          padding: props.padding,
          onSelectedWidget: (data: DesignWidget) => widgetSelectedHandler(data),
          onStateChanged: (changedEvent: DesignWidget) => widgetStateChanagedHandler(changedEvent),
          onPositionMove: (data: Point) => widgetMoveHandler(data),
          onDragEnd: (widget: DesignWidget) => widgetEndHandler(widget)
        },
        {
          item: (widget: any) => slots.item && slots.item(widget)
        }
      )
    }

    const renderHRulter = () => {
      if (pageInfo.hrulerWidth) {
        return h(
          'div',
          {
            class: 'ruler_container',
            style: { left: RULTER_HEIGHT + 'px', top: '0px', width: pageInfo.hrulerWidth + 'px', height: RULTER_HEIGHT + 'px' }
          },
          [
            h(
              CRuler,
              {
                scale: props.scale,
                unit: props.unit,
                h: true,
                width: pageInfo.hrulerWidth,
                height: RULTER_HEIGHT,
                start: (pageInfo.hstart - RULTER_HEIGHT),
                backgroundColor: props.backgroundColor,
                rulerColorLight: props.rulerColorLight,
                rulerColorDark: props.rulerColorDark
              }
            )
          ]
        )
      } else {
        return h(
          'div',
          {
            class: 'ruler_container'
          }
        )
      }
    }

    const renderVRulter = () => {
      if (pageInfo.vrulerWidth) {
        return h(
          'div',
          {
            class: 'ruler_container',
            style: { left: '0px', top: RULTER_HEIGHT + 'px', width: RULTER_HEIGHT + 'px', height: pageInfo.vrulerWidth + 'px' }
          },
          [
            h(
              CRuler,
              {
                scale: props.scale,
                unit: props.unit,
                start: (pageInfo.vstart - RULTER_HEIGHT),
                width: RULTER_HEIGHT,
                height: pageInfo.vrulerWidth,
                backgroundColor: props.backgroundColor,
                rulerColorLight: props.rulerColorLight,
                rulerColorDark: props.rulerColorDark,
                h: false
              }
            )
          ]
        )
      } else {
        return h(
          'div',
          {
            class: 'ruler_container'
          }
        )
      }
    }

    const renderSizeBorders = () => {
      if (service.modal.selected && service.modal.selected.state === 1) {
        return h(
          SizeBox,
          {
            widget: service.modal.selected,
            minx: lineBegin,
            maxx: lineEnd,
            miny: props.padding[0],
            xoffset: pageInfo.hstart,
            yoffset: pageInfo.vstart,
            onSizeChanged: (event:any) => selectedWidgetSizeChanageHandler(event)
          }
        )
      }
    }

    const renderChildren = () => {
      return [
        renderHRulter(),
        renderVRulter(),
        renderDrawer(),
        renderSizeBorders()
      ]
    }

    return { container, pageInfo, renderChildren, clickBackgroundHandler }
  },

  render () {
    return h(
      'div',
      {
        ref: 'container',
        class: 'design',
        style: { background: this.$props.backgroundColor, height: this.pageInfo.height + 'px' },
        onmousedown: () => this.clickBackgroundHandler()
      },
      [
        ...this.renderChildren()
      ]
    )
  }
})
