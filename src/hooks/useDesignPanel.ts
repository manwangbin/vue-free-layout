import { computed, ComputedRef, inject, nextTick, onBeforeUnmount, Ref } from "vue";
import { DesignPanelRef, DesignWidget, Widget } from "@/types";
import DesignService, { Modal } from "@/services/design.service";
import { printHTML } from "@/utils/print";


export function useDesignPanel(designPanel?: Ref<DesignPanelRef|null>){
  const designService = designPanel?undefined:inject(DesignService.token)
  if(!designPanel && !designService) console.error('designPanel 不存在');

  const service = computed(()=>{
    if(designPanel?.value){
      return designPanel?.value?.service
    }else {
      return designService
    }
  })

  const designModal: ComputedRef<Modal> = computed(()=>service.value?.modal!)

  function createWidget(widget: Widget){

    service.value?.createWidgetHandler(widget)

  }

  function getPageWidgets(){
    return service.value?.getPageWidgets()
  }

  function getYWidgets(){
    return service.value?.syncService.yWidget
  }

  function updateWidget(widget: DesignWidget){
    if(!service.value) return
    const { yWidget } = service.value.utils.getYWidgetById(widget.id)
    if(yWidget){
      for (const key in widget) {
        yWidget.set(key, widget[key as keyof DesignWidget])
      }
    }else{
      console.error('设置的widget不存在' + widget.id)
    }
  }

  function delWidget(id: string){
    if(!service.value) return
    service.value.deleteSelected(id)
    service.value.deleteWidget(id)
  }

  function getPageRect(){
    return designModal.value?.pageRect
  }

  function leftJustify(){
    service.value?.alignLineService.leftJustify()
  }

  function rightJustify(){
    service.value?.alignLineService.rightJustify()
  }

  function topJustify(){
    service.value?.alignLineService.topJustify()
  }

  function bottomJustify(){
    service.value?.alignLineService.bottomJustify()
  }

  function rowBetween(){
    service.value?.alignLineService.rowBetween()
  }

  function columnBetween(){
    service.value?.alignLineService.columnBetween()
  }

  function changePageSize(width: number, height: number){
    service.value?.resizePage({
      newWidth: Number(width),
      newHeight: Number(height),
      oldWidth: designModal.value.pageRect.width,
      oldHeight: designModal.value.pageRect.height,
      newPadding: designModal.value.pageRect.padding,
      oldPadding: designModal.value.pageRect.padding
    })
  }

  function setPadding(padding: number[]){
    if(!service.value) return
    const [top, right, bottom, left] = designModal.value.pageRect.padding
    service.value.modal.pageRect.padding = service.value?.utils.paddingFormat(padding)
    service.value.resizePage({
      newWidth: designModal.value.pageRect.width,
      newHeight: designModal.value.pageRect.height,
      oldWidth: designModal.value.pageRect.width,
      oldHeight: designModal.value.pageRect.height,
      newPadding: designModal.value.pageRect.padding,
      oldPadding: [top, right, bottom, left]
    })
  }

  function print(){
    service.value?.setSelected([])
    nextTick().then(()=>{
      printHTML({
        domId: 'drawer',
        width: designModal.value.pageRect.width,
        height: designModal.value.pageRect.height
      })
    })
  }

  function onLayout(callback: (event: any)=>void){
    service.value?.emitter.on('onLayout', callback)
  }

  onBeforeUnmount(()=>{
    service.value?.emitter.off('onLayout')
  })

  return {
    designModal,
    getPageRect,
    onLayout,
    createWidget,
    getPageWidgets,
    getYWidgets,
    updateWidget,
    delWidget,
    leftJustify,
    rightJustify,
    topJustify,
    bottomJustify,
    rowBetween,
    columnBetween,
    print,
    changePageSize,
    setPadding
  }
}
