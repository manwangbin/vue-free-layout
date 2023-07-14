import { computed, defineComponent, h, inject } from "vue";
import DesignService from "@/services/design.service";
import { DesignWidget } from "@/types";

const HEIGHR = 28

const WIDTH = 35

export default defineComponent({
  setup(){
    const designService = inject(DesignService.token)!

    const position = computed(()=>{
      const bxarray = designService.modal.selecteds.map(item => <number>item.get('x'))
      const byarray = designService.modal.selecteds.map(item => <number>item.get('y'))
      const begin = {
        x: Math.min(...bxarray),
        y: Math.min(...byarray)
      }

      const exarray = designService.modal.selecteds.map(item => <number>item.get('x') + <number>item.get('width'))
      const eyarray = designService.modal.selecteds.map(item => <number>item.get('y') + <number>item.get('height'))
      const end = {
        x: Math.max(...exarray),
        y: Math.max(...eyarray)
      }
      return {
        x: begin.x,
        y: begin.y,
        width: (end.x - begin.x),
        height: (end.y - begin.y)
      }
    })

    function deleteWidget(){
      const delWidgets: Array<DesignWidget> = []
      designService.modal.selecteds.forEach((yWidget)=>{
        delWidgets.push(yWidget.toJSON() as DesignWidget)
        designService.deleteWidget(yWidget.get('id'))
      })

      designService.emitter.emit('delWidgets', delWidgets)
      designService.emit('deleted', delWidgets)
      designService.modal.selecteds = []
    }

    return {
      position,
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
          top: this.position.y + 2 + 'px',
          left: this.position.x + this.position.width - WIDTH - 2 + 'px',
          width: WIDTH + 'px',
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
            innerHTML: `<svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M695.96 953.65h-367.3c-76.07 0-137.74-61.67-137.74-137.74V293.63H833.7v522.28c0 76.07-61.67 137.74-137.74 137.74zM626.6 186.44H398.02c0-63.12 51.17-114.29 114.29-114.29S626.6 123.32 626.6 186.44z" data-spm-anchor-id="a313x.7781069.0.i29"></path><path d="M833.7 243.09H188.97c-19.02 0-34.43-15.42-34.43-34.43s15.41-34.43 34.43-34.43H833.7c19.02 0 34.43 15.42 34.43 34.43s-15.41 34.43-34.43 34.43z" data-spm-anchor-id="a313x.7781069.0.i30"></path><path d="M511.33 813.52c-19.02 0-34.43-15.42-34.43-34.43V466.61c0-19.02 15.42-34.43 34.43-34.43s34.43 15.42 34.43 34.43v312.48c.01 19.01-15.41 34.43-34.43 34.43zm-157.27 1.59c-19.02 0-34.43-15.42-34.43-34.43V586.03c0-19.02 15.42-34.43 34.43-34.43s34.43 15.42 34.43 34.43v194.64c.01 19.02-15.41 34.44-34.43 34.44zm314.54 0c-19.02 0-34.43-15.42-34.43-34.43V586.03c0-19.02 15.42-34.43 34.43-34.43s34.43 15.42 34.43 34.43v194.64c.01 19.02-15.41 34.44-34.43 34.44z" data-spm-anchor-id="a313x.7781069.0.i28"></path></svg>`,
            onClick: () => this.deleteWidget()
          }
        ),
      ]
    )
  }
})
