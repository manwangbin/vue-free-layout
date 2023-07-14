import { defineComponent, h, inject, onBeforeUnmount, watch } from "vue";
import DesignService from "@/services/design.service";
import GridService, { Props } from "@/services/grid.service";
import DragContainer from "../components/drag_container";
import { DesignWidget } from "@/types";

export default defineComponent({
  name: 'GridWidget',
  components: {DragContainer},
  props: {
    id: {
      type: String,
      required: true
    },
    rowSpan: {
      type: String,
      default: '5'
    },
    colSpan: {
      type: String,
      default: '3'
    },
    // 不允许拖入的组件
    excludeComponents: {
      type: Array,
      default: () => []
    },
    components: {
      type: Array,
      default: () => []
    }
  },
  setup(props){

    const service = inject(DesignService.token) as DesignService

    const gridService = new GridService(service, props as unknown as Props)

    const gridWidget = gridService.getGridWidget()

    gridService.initGridWidgets()
    // 监听行列变化
    watch([
      ()=>props.rowSpan,
      ()=>props.colSpan
    ], ([rowSpan, colSpan])=>{
      gridService.setGridGap(rowSpan, colSpan, gridWidget.width, gridWidget.height)
      if(gridWidget.components?.length!==0){
        gridService.resetGridWidgets()
      }
    })

    // 监听宽高变化
    watch([
      ()=>gridWidget.width,
      ()=>gridWidget.height
    ], ([width, height])=>{
      gridService.setGridGap(props.rowSpan, props.colSpan, width, height)
      if(gridWidget.components?.length!==0){
        gridService.resetGridWidgets()
      }
    })

    gridService.setGridGap(Number(props.rowSpan), Number(props.colSpan), gridWidget.width, gridWidget.height)



    const setNotOverlapInGrid = gridService.setNotOverlapInGrid.bind(gridService)
    const onAddWidget = gridService.onAddWidget.bind(gridService)
    const setWidgetToGridChild = gridService.setWidgetToGridChild.bind(gridService)
    const onMousedown = gridService.onMousedown.bind(gridService)
    const onDelWidgets = gridService.onDelWidgets.bind(gridService)

    function formatWidget(){
      gridService.setWidgetToGridChild()
      service.clearnSelected()
    }

    // 监听widget拖动
    service.emitter.on('onAddWidget', onAddWidget)
    service.emitter.on('onMousedown', onMousedown)
    service.emitter.on('onBGMousedown', setWidgetToGridChild)
    service.emitter.on('onCreateWidget',setWidgetToGridChild)
    service.emitter.on('delWidgets', onDelWidgets)
    service.emitter.on('formatWidget',formatWidget)

    service.isNotOverlapInGridPublisher.on(setNotOverlapInGrid)

    onBeforeUnmount(()=>{
      service.emitter.off('onAddWidget', onAddWidget)
      service.emitter.off('onMousedown', onMousedown)
      service.emitter.off('onBGMousedown', setWidgetToGridChild)
      service.emitter.off('onCreateWidget', setWidgetToGridChild)
      service.emitter.off('delWidgets', onDelWidgets)
      service.emitter.off('formatWidget',formatWidget)
      service.isNotOverlapInGridPublisher.off(setNotOverlapInGrid)
    })


    function renderGridRowGap(){
      return gridService.model.gridRowGap.map(item=>
        h('div', {
            style:{
              position: 'absolute',
              top: item.y + 'px',
              left: 0,
              height: 0,
              width: item.width + 'px',
              borderBottom: '1px dashed rgb(201, 201, 201)'
            }
          }
        )
      )
    }
    function renderGridColGap(){
      return gridService.model.gridColGap.map(item=>
        h('div', {
            style:{
              position: 'absolute',
              left: item.x + 'px',
              top: 0,
              height: item.height + 'px',
              width: 0,
              borderLeft: '1px dashed rgb(201, 201, 201)'
            }
          }
        )
      )
    }
    function renderGridItems(){
      return gridService.model.gridItems.map((item,index)=>
        h('div', {
            style:{
              position: 'absolute',
              left: item.x + 'px',
              top: item.y + 'px',
              height: item.height+'px',
              width: item.width+'px',
              background: item.active?'#ecf4fc':''
            }
          },
          [
            // h('div',{},[index+'']),
            // h('div',{},[item.widget?.id+'']),
            // h('div',{},[item.inGrid+'']),
          ]
        )
      )
    }
    function renderGridWidgets(){
      if(!gridWidget.components) return null
      return gridWidget.components.map(widget=>
        // @ts-ignore
        h(DragContainer,
        {
          key: widget.id,
          value: widget,
          style: {
            zIndex: 1600
          },
          onDragStart: gridService.onGridChildDragStart.bind(gridService),
          onDelWidgets: (widget: Array<DesignWidget>) => gridService.onDelWidgets(widget)
        }
      ))
    }
    return {
      gridWidget,
      renderGridRowGap,
      renderGridColGap,
      renderGridItems,
      renderGridWidgets
    }
  },
  render(){
    return h(
      'div',
      {
        style: {
          position: 'relative',
          width: 'calc(100% - 2px)',
          height: 'calc(100% - 2px)',
          border: '1px solid #9a9a9a'
        }
      },
      [
        this.renderGridWidgets(),
        this.renderGridItems(),
        this.renderGridRowGap(),
        this.renderGridColGap(),
        // h('div',{},[JSON.stringify(this.gridWidget.components)])
      ]
    )
  }
})
