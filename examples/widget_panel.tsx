import { defineComponent } from "vue";
import { nanoid } from 'nanoid'
import { Widget } from "@/types";
import { useDesignPanel } from "../src/hooks/useDesignPanel";
// import { useDesignPanel } from "../dist/vue3-free-layout.esm";
import { FieldEnum, widgets } from "./package";

export default defineComponent({
  name: 'WidgetPanel',

  emits: ['create-widget'],
  setup (_, { emit }) {

    const {
      designModal,
      onLayout,
      getPageRect
    } = useDesignPanel()


    onLayout(()=>{
    })

    function getWidgetOpt(widget: Record<string, any>): Widget{
      const { width, padding } = getPageRect()
      let widgetWidth = width - padding[1] - padding[3]
      switch (widget.width.type){
        case 'percentage':
          widgetWidth = widgetWidth * widget.width.value / 100
          break
        case 'px':
          widgetWidth = widget.width.value
          break
      }
      return{
        id: nanoid(),
        x: 0, y: 0,
        enableResize: true,
        enableDragable: true,
        ...widget,
        width: widgetWidth,
      }
    }

    const renderWidgets = (widget: any) => {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '50px',
          height: '50px',
          fontSize: '14px',
          lineHeight: '',
          textAlign: 'center',
          border: '1px solid #eee',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
             onmousedown={() => emit('create-widget', getWidgetOpt(widget))}>
          {widget.name}
        </div>
      )
    }
    return { renderWidgets }
  },

  render () {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        alignContent: 'start',
        gridRowGap: '10px',
        padding: '10px',
        width: '200px',
        background: '#FFFFFF',
        boxSizing: 'border-box'
      }}>
        {widgets.map(widget=>this.renderWidgets(widget))}
      </div>
    )
  }
})
