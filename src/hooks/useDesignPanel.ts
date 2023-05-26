import { computed, ComputedRef, inject, Ref } from "vue";
import { DesignPanelRef, Widget } from "@/types";
import DesignService, { Modal } from "@/services/design.service";
import html2canvas from "html2canvas";
import printJS from "print-js";


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

  function print(){
      printJS({
        printable: 'drawer',
        type: 'html',
        documentTitle: '',
        targetStyles: ['*']
      })
  }

  return {
    designModal,
    createWidget,
    leftJustify,
    rightJustify,
    topJustify,
    bottomJustify,
    rowBetween,
    columnBetween,
    print
  }
}
