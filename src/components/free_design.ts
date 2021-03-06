import { defineComponent, h, onMounted, ref, Ref, PropType } from 'vue'
import DesignService from '@/services/design.service'
import DesignCanvase from './design_canvase'
import { getClientRect } from '@/util/size.util'
import DragContainer from './drag_container'
import CRuler from './c_ruler'
import './style.less'

const RULER_WIDTH = 24
export default defineComponent({
  name: 'DesignPanel',

  props: {
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

    rulerColorLight: {
      type: String,
      default: '#9a9a9a'
    },

    rulerColorDark: {
      type: String,
      default: '#646464 '
    }
  },

  setup (props, { emit, slots }) {
    const designContainer: Ref<HTMLElement | undefined> = ref()
    const designBody: Ref<HTMLElement | undefined> = ref()
    const service = new DesignService(props.width, props.height)

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

    const renderAddWdiget = () => {
      if (service.modal.newWidget) {
        return h(
          DragContainer,
          {
            value: service.modal.newWidget
          },
          {
            default: () => [slots.item && slots.item(service.modal.newWidget)]
          }
        )
      }
    }

    const renderHRulter = () => {
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

    const renderVRulter = () => {
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

    const renderBody = () => {
      return h(
        DesignCanvase,
        {
          class: 'canvase',
          scale: service.modal.scale,
          ...props
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

    return { designContainer, designBody, service, renderHRulter, renderVRulter, renderBody, renderAddWdiget, mouseWheelHandler }
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
