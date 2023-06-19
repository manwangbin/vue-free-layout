import { Direction, FieldInterface } from "./FieldInterface";
import { onBeforeUnmount, onMounted, reactive, ref, Ref, watch } from "vue";


export abstract class FieldService<S extends object> implements FieldInterface<S>{

  stateMap = new Map<string, S>()

  protected constructor() {
  }

  initState(id: string, defaultState: S): S{
    const state = reactive({
      ...defaultState,
      id: id
    }) as S

    onMounted(()=>{
      this.stateMap.set(id, state)
    })
    onBeforeUnmount(()=>this.delState(id))
    return state
  }

  getState(id: string){
    return this.stateMap.get(id)
  }

  delState(id: string){
    this.stateMap.delete(id)
  }

  abstract setDirection(id: string, direction: Direction): void
}
