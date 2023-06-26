import { computed, ComputedRef, inject, nextTick, onBeforeUnmount, Ref } from "vue";
import { DesignPanelRef, Widget } from "@/types";
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
    console.log(width, height);
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
