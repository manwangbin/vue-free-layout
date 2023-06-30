import { onBeforeUnmount, onMounted, reactive, ref, Ref, watch } from "vue";
import { FieldInterface } from "./utils/FieldInterface";


export const stateMap = new Map<string, FieldInterface>()

export function useStateMap<S extends object>(id: string, fileObj: FieldInterface){
  const state = reactive(fileObj)

  onMounted(()=>{
    stateMap.set(id, state)
  })
  onBeforeUnmount(()=>stateMap.delete(id))
  return state as S
}

export function useOptStateMap<S>(id: Ref<string>){
  const state: Ref<FieldInterface|undefined> = ref()

  onMounted(()=>{
    state.value = stateMap.get(id.value)
  })

  watch(id,()=>{
    state.value = stateMap.get(id.value)
  },{
    flush: 'post'
  })

  return state
}
