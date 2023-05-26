import { DesignWidget, Widget } from './../types'
import { defineComponent, h, onMounted, ref, Ref, PropType, InjectionKey, provide } from "vue";
import DesignService from '../services/design.service'
import DesignCanvase from './design_canvase'
import { getClientRect } from '../util/size.util'
import DragContainer from './drag_container'
import CRuler from './c_ruler'
import '../style.less'
import AlignmentLineService from "@/services/alignmentLine.service";


const RULER_WIDTH = 24
export default defineComponent({
  name: 'DesignPanel',

  props: {
    value: {
      type: Array as PropType<Array<Widget>>,
      default: () => new Array()
    },

    width: {
      type: Number,
      required: true
    },

    height: {
      type: Number,
      required: true
    },

    unit: {
      type: String as PropType<'px' | 'mm' | 'cm'>,
      default: 'px'
    },

    drawerBackgroud: {
      type: String,
      default: '#ffffff'
    },

    backgroundColor: {
      type: String,
      default: '#eeeff0'
    },

    showRuler: {
      type: Boolean,
      default: false
    },

    rulerColorLight: {
      type: String,
      default: '#9a9a9a'
    },

    rulerColorDark: {
      type: String,
      default: '#646464 '
    },

    // 是否显示对齐线
    showAlign: {
      type: Boolean,
      default: true
    },

    // 是否吸附
    enableAdsorb: {
      type: Boolean,
      default: true
    },

    // 对齐线宽度
    alignWeight: {
      type: Number,
      default: 1
    },

    // 对齐线颜色
    alignColor: {
      type: String,
      default: '#3ca4fc'
    },

    // 显示对齐线的距离
    showAlignSpan: {
      type: Number,
      default: 20
    },

    // 吸附距离
    adsorbSpan: {
      type: Number,
      default: 10
    }
  },

  emits: ['update:value', 'page-resized', 'added', 'deleted', 'drag-start',
    'drag-moving', 'drag-end', 'resize-start', 'resizeing', 'resize-end',
    'del-widgets'
  ],
  setup (props, { emit, slots }) {

    const designContainer: Ref<HTMLElement | undefined> = ref()
    const designBody: Ref<HTMLElement | undefined> = ref()

    const service = new DesignService(props, emit)

    /**
     * 添加新的控件
     *
     * @param widget
     */
    const createWidget = (widget: Widget) => {
      service.createWidgetHandler(widget)
      emit('added', widget)
      emit('update:value', service.modal.widgets)
    }

    /**
     * 获取当前页面的weidgets
     *
     * @returns
     */
    const getPageWidgets = (): Array<DesignWidget> => {
      return service.modal.widgets;
    }

    onMounted(() => {
      window.addEventListener('resize', resizeHandler, true)
      resizeHandler()
    })

    const resizeHandler = () => {
      if (designContainer.value) {
        getClientRect(designContainer.value).then(value => {
          service.modal.rect = value
        })
      }

      if (designBody.value) {
        getClientRect(designBody.value).then(value => {
          service.modal.canvaseRect = value
          service.recountPage()
        })
      }
    }

    // 渲染从左侧开始拖动的组件
    const renderAddWdiget = () => {
      if (service.modal.newWidget) {
        return h(
          DragContainer,
          {
            value: service.modal.newWidget,
          },
          {
            default: () => [slots.item && slots.item(service.modal.newWidget)]
          }
        )
      }
    }

    const renderHRulter = () => {
      if (props.showRuler) {
        return h(
          CRuler,
          {
            width: service.modal.canvaseRect.width,
            height: RULER_WIDTH,
            start: (service.modal.pageRect.x * service.modal.scale),
            offset: service.modal.scrollLeft,
            scale: service.modal.scale,
            unit: props.unit,
            h: true,
            backgroundColor: props.backgroundColor,
            rulerColorLight: props.rulerColorLight,
            rulerColorDark: props.rulerColorDark,
            style: {
              left: (service.modal.canvaseRect.x - service.modal.rect.x) + 'px',
              top: (service.modal.canvaseRect.y - service.modal.rect.y) + 'px'
            }
          }
        )
      }
    }

    const renderVRulter = () => {
      if (props.showRuler) {
        return h(
          CRuler,
          {
            width: RULER_WIDTH,
            height: service.modal.canvaseRect.height,
            start: (service.modal.pageRect.y * service.modal.scale),
            offset: service.modal.scrollTop,
            scale: service.modal.scale,
            unit: props.unit,
            backgroundColor: props.backgroundColor,
            rulerColorLight: props.rulerColorLight,
            rulerColorDark: props.rulerColorDark,
            h: false,
            style: {
              left: (service.modal.canvaseRect.x - service.modal.rect.x) + 'px',
              top: (service.modal.canvaseRect.y - service.modal.rect.y) + 'px'
            }
          }
        )
      }
    }

    const renderBody = () => {
      return h(
        DesignCanvase,
        {
          class: 'canvase',
          scale: service.modal.scale,
          ...props,
          onDragMoving: (widget: DesignWidget) => { emit('drag-moving', widget); emit('update:value', service.modal.widgets); },
          onDragStart: (widget: DesignWidget) => { emit('drag-start', widget); emit('update:value', service.modal.widgets); },
          onDragEnd: (widget: DesignWidget) => { emit('drag-end', widget); emit('update:value', service.modal.widgets); },
          onResizeStart: (widget: DesignWidget) => { emit('resize-start', widget); emit('update:value', service.modal.widgets); },
          onResizeing: (widget: DesignWidget) => { emit('resizeing', widget); emit('update:value', service.modal.widgets);},
          onResizeEnd: (widget: DesignWidget) => { emit('resize-end', widget); emit('update:value', service.modal.widgets);}
        },
        {
          item: slots.item
        }
      )
    }

    const mouseWheelHandler = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        event.stopPropagation()
        service.addScale(event.deltaY / 100)
      }
    }

    return { designContainer, designBody, service, createWidget, getPageWidgets, renderHRulter, renderVRulter, renderBody, renderAddWdiget, mouseWheelHandler }
  },

  render () {
    return h(
      'div',
      {
        ref: 'designContainer',
        class: 'design'
      },
      [
        this.$slots.header && this.$slots.header(),
        h(
          'div',
          {
            class: 'content'
          },
          [
            this.$slots.left && this.$slots.left(),
            h(
              'div',
              {
                ref: 'designBody',
                class: 'body',
                onscroll: () => {
                  if (this.designBody) {
                    this.service.modal.scrollLeft = this.designBody.scrollLeft
                    this.service.modal.scrollTop = this.designBody.scrollTop
                  }
                },
                onmousewheel: (event: WheelEvent) => { this.mouseWheelHandler(event) }
              },
              [
                this.renderHRulter(),
                this.renderVRulter(),
                this.renderBody()
              ]
            ),
            this.$slots.right && this.$slots.right()
          ]
        ),

        this.renderAddWdiget()
      ]
    )
  }
})
