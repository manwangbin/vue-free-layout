import { defineComponent, h, onMounted, PropType, reactive, ref, watch } from 'vue'

export default defineComponent({
  name: 'CRuler',

  props: {
    scale: {
      type: Number,
      required: true
    },

    unit: {
      type: String as PropType<'px' | 'mm' | 'cm'>,
      required: true
    },

    start: {
      type: Number,
      required: true
    },

    width: {
      type: Number,
      required: true
    },

    height: {
      type: Number,
      required: true
    },

    backgroundColor: {
      type: String,
      required: true
    },

    rulerColorLight: {
      type: String,
      default: '#848484'
    },

    rulerColorDark: {
      type: String,
      default: '#646464'
    },

    h: {
      type: Boolean,
      defaut: true
    }
  },

  setup (props) {
    const state = reactive({
      canvasContext: null as CanvasRenderingContext2D | null
    })
    const canvas = ref<HTMLCanvasElement | null>(null)

    onMounted(() => {
      state.canvasContext = canvas.value && canvas.value.getContext('2d')
      updateCanvasContext()
      drawCavaseRuler()
    })

    watch([() => props.width, () => props.height, () => props.start], () => {
      updateCanvasContext()
      drawCavaseRuler()
    })

    const updateCanvasContext = () => {
      if (canvas.value) {
        // 比例宽高
        canvas.value.width = props.width
        canvas.value.height = props.height
        const ctx = state.canvasContext
        if (ctx) {
          ctx.font = `${12}px -apple-system, "Helvetica Neue", ".SFNSText-Regular", "SF UI Text", Arial, "PingFang SC", "Hiragino Sans GB",
                "Microsoft YaHei", "WenQuanYi Zen Hei", sans-serif`
          ctx.lineWidth = 1
          ctx.textBaseline = 'middle'
        }
      }
    }

    const getGridSize = (scale: number) => {
      if (scale <= 0.25) return 40
      if (scale <= 0.5) return 20
      if (scale <= 1) return 10
      if (scale <= 2) return 5
      if (scale <= 4) return 2
      return 1
    }

    const drawCavaseRuler = () => {
      const ctx = state.canvasContext
      if (ctx) {
        const { scale, width, height, start, h, backgroundColor, rulerColorLight, rulerColorDark } = props

        // 缩放ctx, 以简化计算
        ctx.scale(scale, scale)
        ctx.clearRect(0, 0, width, height)

        // 1. 画标尺底色
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)

        const gridSize = getGridSize(scale) // 每小格表示的宽度
        const gridSize10 = gridSize * 10 // 每大格表示的宽度
        const gridPixel = gridSize * scale
        const gridPixel10 = gridSize10 * scale

        let position = start
        // 绘制短间隔
        ctx.beginPath()
        ctx.strokeStyle = rulerColorLight
        if (start > gridSize) {
          position = start - gridPixel
          while (position > 0) {
            drawLine(ctx, h, position, h ? height : width, false)
            position -= gridPixel
          }
        }

        position = start + gridPixel
        while (h ? position < width : position < height) {
          drawLine(ctx, h, position, h ? height : width, false)
          position += gridPixel
        }

        ctx.stroke()
        ctx.closePath()

        // 3. 画刻度和文字(因为刻度遮住了阴影)
        ctx.beginPath() // 一定要记得开关路径,因为clearRect并不能清除掉路径,如果不关闭路径下次绘制时会接着上次的绘制
        ctx.fillStyle = rulerColorDark
        ctx.strokeStyle = rulerColorDark

        // 长间隔和短间隔需要两次绘制，才可以完成不同颜色的设置；分开放到两个for循环是为了节省性能，因为如果放到一个for循环的话，每次循环都会重新绘制操作dom
        // 绘制长间隔和文字
        let value = 0
        position = start
        if (start > gridPixel10) {
          while (position > 0) {
            position -= gridPixel10
            value -= gridSize10
            drawLine(ctx, h, position, h ? height : width)
            drawText(ctx, h, position, h ? height : width, value)
          }

          position = start
          value = 0
        }

        while (h ? position < width : position < height) {
          drawLine(ctx, h, position, h ? height : width)
          drawText(ctx, h, position, h ? height : width, value)

          position += gridPixel10
          value += gridSize10
        }

        ctx.stroke()
        ctx.closePath()

        // 恢复ctx matrix
        ctx.setTransform(1, 0, 0, 1, 0, 0)
      }
    }

    const drawLine = (ctx: CanvasRenderingContext2D, h: boolean, position: number, length: number, max = true) => {
      const lineEnd = max ? length * 9 / 16 : length / 3
      if (h) {
        ctx.moveTo(position, 0)
        ctx.lineTo(position, lineEnd)
      } else {
        ctx.moveTo(0, position)
        ctx.lineTo(lineEnd, position)
      }
    }

    const drawText = (ctx: CanvasRenderingContext2D, h: boolean, position: number, length: number, value: number) => {
      const end = length * 0.4
      ctx.save()
      h ? ctx.translate(position, end) : ctx.translate(end, position)
      if (!h) {
        ctx.rotate(-Math.PI / 2) // 旋转 -90 度
      }
      ctx.fillText(value.toString(), 4, 7)
      ctx.restore()
    }

    return {
      canvas
    }
  },

  render () {
    return h(
      'canvas',
      {
        ref: 'canvas',
        style: { width: this.$props.width + 'px', height: this.$props.height + 'px' }
      }
    )
  }
})
