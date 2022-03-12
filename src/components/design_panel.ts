import { defineComponent, h, onMounted, PropType, reactive, ref, Ref } from 'vue'
import CRuler from './c_ruler'
import DesignDrawer from './design_drawer'
import './style.less'

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
      default: 'lt'
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
      type: Array,
      required: true
    },

    dragProperty: {
      type: Object as PropType<{ x: string, y: string, width: string, height: string }>,
      default: () => { return { x: 'x', y: 'y', width: 'width', height: 'height' } }
    }
  },

  setup (props, { slots }) {
    const container: Ref<HTMLElement | null> = ref(null)
    const pageInfo = reactive({ width: 0, height: 0, hstart: RULTER_HEIGHT * 2, vstart: RULTER_HEIGHT * 3 } as PageInfo)
    let sizeChangeTimer: number|undefined

    onMounted(() => {
      if (container.value) {
        container.value.addEventListener('resize', resizeHandler)
        resizeHandler()
      }
    })

    const resizeHandler = () => {
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

    const relayoutPage = () => {
      pageInfo.hstart = (pageInfo.width - props.width) / 2
      if (pageInfo.height < (props.height + pageInfo.vstart * 2)) {
        pageInfo.height = (props.height + pageInfo.vstart * 2)
      }
      pageInfo.hrulerWidth = (pageInfo.width - RULTER_HEIGHT)
      pageInfo.vrulerWidth = (pageInfo.height - RULTER_HEIGHT)
    }

    const renderDrawer = () => {
      return h(
        DesignDrawer,
        {
          background: props.drawerBackgroud,
          width: props.width,
          height: props.height,
          style: {
            left: pageInfo.hstart + 'px',
            top: pageInfo.vstart + 'px'
          },
          children: props.children,
          dragProperty: props.dragProperty
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
              { ...props, h: true, width: pageInfo.hrulerWidth, height: RULTER_HEIGHT, start: (pageInfo.hstart - RULTER_HEIGHT) }
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
              { ...props, width: RULTER_HEIGHT, height: pageInfo.vrulerWidth, start: (pageInfo.vstart - RULTER_HEIGHT), h: false }
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

    const renderChildren = () => {
      return [
        renderHRulter(),
        renderVRulter(),
        renderDrawer()
      ]
    }

    return { container, renderChildren, pageInfo }
  },

  render () {
    return h(
      'div',
      {
        ref: 'container',
        class: 'design',
        style: { background: this.$props.backgroundColor, height: this.pageInfo.height + 'px' }
      },
      [
        ...this.renderChildren()
      ]
    )
  }
})
