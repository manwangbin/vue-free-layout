import { defineComponent, h, inject } from "vue";
import DesignService from "@/services/design.service";
import { DesignWidget } from "@/types";

const HEIGHR = 25

export default defineComponent({
  setup(){
    const designService = inject(DesignService.token)!

    function deleteWidget(){
      designService.modal.selecteds.forEach((yWidget)=>{
        designService.deleteWidget(yWidget.toJSON() as DesignWidget)
      })
      designService.modal.selecteds = []
    }

    return {
      position: designService.selectedPosition,
      deleteWidget,
      designService
    }

  },
  render(){
    return h(
      'div',
      {
        class: 'operation-bar',
        style: {
          top: this.position.y - HEIGHR + 'px',
          left: this.position.x + 'px',
          width: this.position.width + 'px',
          height: HEIGHR + 'px'
        },
        onmousedown: (event: MouseEvent)=>{
          event.preventDefault()
          event.stopPropagation()
        }
      },
      [
        h(
          'div',
          {
            class: 'del-icon',
            innerHTML: `<svg t="1683510918742" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2402" width="16" height="16" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M214.6048 298.666667v598.613333a41.429333 41.429333 0 0 0 41.386667 41.386667h513.28c22.869333 0 41.386667-18.56 41.386666-41.386667V298.666667h-596.053333z m554.666667 725.333333h-513.28c-69.845333 0-126.72-56.832-126.72-126.72V213.333333h766.72v683.946667c0 69.888-56.832 126.72-126.72 126.72z" fill="#f44d50" p-id="2403"></path><path d="M981.333333 298.666667H42.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667s19.2-42.666667 42.666667-42.666667h938.666666c23.466667 0 42.666667 19.2 42.666667 42.666667s-19.2 42.666667-42.666667 42.666667M768 213.333333H682.666667V128c0-23.509333-19.114667-42.666667-42.666667-42.666667H384c-23.509333 0-42.666667 19.157333-42.666667 42.666667v85.333333H256V128c0-70.570667 57.429333-128 128-128h256c70.570667 0 128 57.429333 128 128v85.333333zM384 810.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667V469.333333c0-23.466667 19.2-42.666667 42.666667-42.666666s42.666667 19.2 42.666667 42.666666v298.666667c0 23.466667-19.2 42.666667-42.666667 42.666667M640 810.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667V469.333333c0-23.466667 19.2-42.666667 42.666667-42.666666s42.666667 19.2 42.666667 42.666666v298.666667c0 23.466667-19.2 42.666667-42.666667 42.666667" fill="#f44d50" p-id="2404"></path></svg>`,
            onClick: () => this.deleteWidget()
          }
        ),
        this.designService.modal.selecteds.length + ''
      ]
    )
  }
})
