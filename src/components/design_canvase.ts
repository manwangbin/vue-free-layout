import { DesignWidget, Point, Widget } from "@/types"
import { defineComponent, h, inject, onMounted, PropType, ref, Ref, watch } from "vue";
import SizeBox from './size_box'
import DesignService from '@/services/design.service'
import DragContainer from './drag_container'
import { computed } from '@vue/reactivity'
import { LineDirection } from "@/services/alignmentLine.service";

export default defineComponent({
  name: 'DesignCanvase',

  props: {
    square: {
      type: Number,
      default: -1
    },

    scale: {
      type: Number,
      default: 1
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
      default: '#eeeff0'
    },

    children: {
      type: Array as PropType<Array<Widget>>,
      default: () => []
    }
  },

  emits: ['drag-start', 'drag-moving', 'drag-end', 'resize-start', 'resizeing', 'resize-end'],
  setup (props, { emit, slots }) {
    const drawer: Ref<HTMLElement | null> = ref(null)

    const designService = inject(DesignService.token) as DesignService

    const containerWidth = computed(() => designService.modal.pageRect.cwidth * designService.modal.scale)
    const containerHeight = computed(() => designService.modal.pageRect.cheight * designService.modal.scale)

    onMounted(() => {
      window.addEventListener('resize', windowsResizeHandler, true)
      windowsResizeHandler()
    })

    const windowsResizeHandler = () => {
      relayoutChildren()
    }

    const selectedWidgetSizeChanageHandler = (size: any) => {
      if (designService.modal.selecteds && designService.modal.selecteds.length > 0) {
        if (designService.modal.selecteds.length === 1) {
          designService.modal.selecteds[0].set('x', size.x)
          designService.modal.selecteds[0].set('y', size.y)
          designService.modal.selecteds[0].set('width', size.width)
          designService.modal.selecteds[0].set('height', size.height)
        } else {
          // TODO
        }
      }
    }

    const relayoutChildren = () => {
      // service.initWidgets(props.children)
      // emit('update:children', service.modal.placeWidgets)
    }

    const converClientP2PanelP = (event: MouseEvent) => {
      return {
        x: (event.clientX - designService.modal.canvaseRect.x + designService.modal.scrollLeft) / designService.modal.scale,
        y: (event.clientY - designService.modal.canvaseRect.y + designService.modal.scrollTop) / designService.modal.scale
      } as Point
    }

    const SELECTED_SPAN = 10
    const selectedArea: Ref<{ begin: Point | undefined, end: Point | undefined }> = ref({ begin: undefined, end: undefined })
    const bgmousedownHandler = (event: MouseEvent) => {
      designService.clearnSelected()
      selectedArea.value.begin = converClientP2PanelP(event)

      window.addEventListener('mousemove', bgmousemoveHandler, true)
      window.addEventListener('mouseup', bgmouseupHandler, true)
    }

    const bgmousemoveHandler = (event: MouseEvent) => {
      const cpoint = converClientP2PanelP(event)
      if (!selectedArea.value.begin) {
        selectedArea.value.begin = cpoint
      } else {
        const xspan = Math.abs(cpoint.x - selectedArea.value.begin.x)
        const yspan = Math.abs(cpoint.y - selectedArea.value.begin.y)
        if (xspan > SELECTED_SPAN && yspan > SELECTED_SPAN) {
          selectedArea.value.end = cpoint
          designService.setSelectedArea(selectedArea.value.begin, selectedArea.value.end)
        } else {
          selectedArea.value.end = undefined
          designService.clearnSelected()
        }
      }
    }

    const bgmouseupHandler = (event: MouseEvent) => {
      window.removeEventListener('mousemove', bgmouseupHandler, true)
      window.removeEventListener('mousemove', bgmousemoveHandler, true)

      selectedArea.value = { begin: undefined, end: undefined }
    }

    const renderSelectedArea = () => {
      if (selectedArea.value.begin && selectedArea.value.end) {
        const left = Math.min(selectedArea.value.begin.x, selectedArea.value.end.x)
        const top = Math.min(selectedArea.value.begin.y, selectedArea.value.end.y)

        const width = Math.abs(selectedArea.value.begin.x - selectedArea.value.end.x)
        const height = Math.abs(selectedArea.value.begin.y - selectedArea.value.end.y)
        return h(
          'div',
          {
            class: 'selected_area',
            style: {
              left: left + 'px',
              top: top + 'px',
              width: width + 'px',
              height: height + 'px'
            }
          }
        )
      }
    }

    const renderDrawer = () => {
      return h(
        'div',
        {
          ref: 'drawer',
          class: 'drawer',
          style: {
            background: props.drawerBackgroud,
            left: designService.modal.pageRect.x + 'px',
            top: designService.modal.pageRect.y + 'px',
            width: props.width + 'px',
            height: props.height + 'px'
          }
        }
      )
    }

    const renderWidgets = () => {
      if (designService.modal.widgets) {
        return designService.modal.widgets.map((widget, idx) => h(
          DragContainer,
          {
            value: widget,
            widgetIdx: idx,
            onDragMoving: (widget: DesignWidget) => emit('drag-moving', widget),
            onDragStart: (widget: DesignWidget) => emit('drag-start', widget),
            onDragEnd: (widget: DesignWidget) => emit('drag-end', widget)
          },
          {
            default: () => [slots.item && slots.item(widget)]
          }
        ))
      }
    }

    const renderSizeBorders = () => {
      if (!designService.modal.selecteds ||
        designService.modal.selecteds.length === 0) {
        return
      }

      if (designService.modal.selecteds.find(widget => (!widget.get('enableResize') || widget.get('moveing')))) {
        return
      }

      return h(
        SizeBox,
        {
          onSizeChanged: (event: any) => selectedWidgetSizeChanageHandler(event),
          onDragMoving: (widget: DesignWidget) => emit('drag-moving', widget),
          onDragStart: (widget: DesignWidget) => emit('drag-start', widget),
          onDragEnd: (widget: DesignWidget) => emit('drag-end', widget),
          onResizeStart: (widget: DesignWidget) => emit('resize-start', widget),
          onResizeing: (widget: DesignWidget) => emit('resizeing', widget),
          onResizeEnd: (widget: DesignWidget) => emit('resize-end', widget)
        }
      )
    }

    const renderAlignmentLine = () => {
      if(designService.boundaryLine.value){
        return designService.boundaryLine.value.map(line=>{
          const {x, y} = designService.pageP2CavnaseP({ x: line.x, y: line.y })
          const option = designService.alignmentLine?.option
          const border = `${option?.alignWeight}px ${option?.alignColor} dashed`
          return  h(
            'div',
            {
              class: 'alignment-line',
              style: {
                display: line.show && option?.showAlign?'':'none',
                transform: `translate(${x}px, ${y}px)`,
                borderLeft: line.direction===LineDirection.COLUMN?border:'',
                borderTop: line.direction===LineDirection.ROW?border:'',
                width: line.width,
                height: line.height
              }
            },
            [
              // line.x, '-', line.y, '-', line.show
            ]
          )
        })
      }

      return h(
        'div',
      )
    }

    const renderChildren = () => {
      return [
        renderDrawer(),
        renderWidgets(),
        renderSizeBorders(),
        renderSelectedArea(),
        renderAlignmentLine()
      ]
    }

    return { drawer, designService, containerWidth, containerHeight, renderChildren, bgmousedownHandler }
  },

  render () {
    return h(
      'div',
      {
        style: {
          width: this.designService.modal.pageRect.cwidth + 'px',
          height: this.designService.modal.pageRect.cheight + 'px',
          transform: 'scale(' + this.designService.modal.scale + ')'
        },
        onmousedown: (event: MouseEvent) => this.bgmousedownHandler(event)
      },
      [
        ...this.renderChildren(),
      ]
    )
  }
})
