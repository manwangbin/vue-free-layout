import { onBeforeUnmount, onMounted, reactive, ref, Ref, watch } from "vue";


const stateMap = new Map<string, any>()

export function useStateMap<S extends object>(id: string, fileObj: S){
  const state = reactive(fileObj)

  onMounted(()=>{
    stateMap.set(id, state)
  })
  onBeforeUnmount(()=>stateMap.delete(id))
  return state as S
}

export function useOptStateMap<S>(id: Ref<string>){
  const state: Ref<S|undefined> = ref()

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
