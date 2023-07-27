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
    tag: {
      type: String,
      required: true
    },
    active: {
      type: Object || null
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
    gridBorder: {
      type: Array,
      default: () => [
        'INNER_HORIZONTAL',
        'INNER_VERTICAL',
        'UP',
        'DOWN',
        'LEFT',
        'RIGHT'
      ]
    },
    components: {
      type: Array,
      default: () => []
    }
  },
  emits: ["update:active"],
  setup(props, {emit}){

    const service = inject(DesignService.token) as DesignService

    const gridService = new GridService(service, props as unknown as Props, emit)

    gridService.initGridGap(Number(props.rowSpan), Number(props.colSpan),
      gridService.gridWidget.width, gridService.gridWidget.height)

    gridService.initGridWidgets()
    // 监听行列变化
    watch([
      ()=>props.rowSpan,
      ()=>props.colSpan
    ], ([rowSpan, colSpan])=>{
      gridService.initGridGap(rowSpan, colSpan, gridService.gridWidget.width, gridService.gridWidget.height)
      gridService.resetGridWidgets()
    })

    // 监听宽高变化
    watch([
      ()=>gridService.gridWidget.width,
      ()=>gridService.gridWidget.height
    ], ([width, height])=>{
      gridService.initGridGap(props.rowSpan, props.colSpan, width, height)
      gridService.resetGridWidgets()
    })

    const setNotOverlapInGrid = gridService.setNotOverlapInGrid.bind(gridService)
    const onAddWidget = gridService.onAddWidget.bind(gridService)

    // 监听widget拖动
    service.emitter.on('onAddWidget', onAddWidget)

    service.isNotOverlapInGridPublisher.on(setNotOverlapInGrid)

    onBeforeUnmount(()=>{
      service.emitter.off('onAddWidget', onAddWidget)
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
              width: item.width - 1 + 'px',
              borderBottom: props.gridBorder?.includes('INNER_HORIZONTAL') ? "1px dashed rgb(201, 201, 201)":''
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
              borderLeft: props.gridBorder?.includes('INNER_VERTICAL') ? "1px dashed rgb(201, 201, 201)":''
            }
          }
        )
      )
    }
    function renderGridItems(){
      return gridService.model.gridItems.map((item,index)=>{
        return h('div', {
            style:{
              position: 'absolute',
              left: item.x + 'px',
              top: item.y + 'px',
              height: item.height+'px',
              width: item.width+'px',
              // zIndex: 50,
              background: (props.active && props.active?.id === item.widget?.id) || item.active?'#ecf4fc':'',
            }
          },
          []
        )
      })
    }
    function renderGridWidgets(){
      return gridService.gridChildWidgets.value.map(widget=>
        // @ts-ignore
        h(DragContainer,
        {
          key: widget.id,
          value: widget,
          style: {
            zIndex: 1600
          },
          onDragStart: gridService.onGridChildDragStart.bind(gridService),
        }
      ))
    }
    return {
      gridService,
      renderGridRowGap,
      renderGridColGap,
      renderGridItems,
      renderGridWidgets,
      deleteWidget: gridService.deleteWidget.bind(gridService),
      getComponents: () => gridService.gridChildWidgets.value,
      getGridItems: () => gridService.model.gridItems,
      setGridRowGap: gridService.setGridRowGap.bind(gridService),
      getBoundingClientRect: () => gridService.containerRef?.getBoundingClientRect()
    }
  },
  render(){
    return h(
      'div',
      {
        ref: (el: any) => this.gridService.containerRef = el,
        style: {
          position: 'relative',
          width: '100%',
          height: this.gridService.model.height + 'px',
          borderLeft: this.$props.gridBorder?.includes('LEFT') ? '1px solid #9a9a9a':'',
          borderRight: this.$props.gridBorder?.includes('RIGHT') ? '1px solid #9a9a9a':'',
          borderTop: this.$props.gridBorder?.includes('UP') ? '1px solid #9a9a9a':'',
          borderBottom: this.$props.gridBorder?.includes('DOWN') ? '1px solid #9a9a9a':''
        }
      },
      [
        this.renderGridItems(),
        this.renderGridRowGap(),
        this.renderGridColGap(),
        this.renderGridWidgets(),
        // h('div',{},[JSON.stringify(this.gridWidget.components)])
      ]
    )
  }
})
