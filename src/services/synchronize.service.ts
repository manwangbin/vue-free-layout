import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { onBeforeUnmount } from "vue";
import { DesignWidget } from "@/types";
import { CheckType } from "@/utils/checkType";

export type MapVal = string|number|boolean|undefined|Array<number>

export type YWidget = Y.Map<MapVal>

interface Delta {
  insert?: Array<any> | string;
  delete?: number;
  retain?: number;
}

interface KeysData {
  key: string,
  action: 'add' | 'update' | 'delete',
  value: MapVal
}

export interface UpdateData {
  type: 'array'|'map',
  path: Array<number|string>,
  target: any,
  deltaData?: Delta,
  keysData?: KeysData,
  handler: Function
}

export default class SynchronizeService<T>{

  ydoc;
  wsProvider;
  yWidget;

  constructor(serverUrl: string=`ws://localhost:1234`,
              roomName: string='root2') {
    this.ydoc = new Y.Doc()
    this.wsProvider = new WebsocketProvider(
      serverUrl, roomName, this.ydoc,
      {connect: false}
    )
    // this.wsProvider.connect()
    this.yWidget = this.ydoc.getArray<Y.Map<MapVal>>('arr')

    this.yWidget.observeDeep(this._onDataUpdate.bind(this))

    onBeforeUnmount(()=>this.destroy())
  }

  createWidget(widget: DesignWidget){
    const map = new Y.Map<MapVal>()
    for (let key in widget) {
      map.set(key, widget[key as keyof DesignWidget])
    }
    return map
  }

  // 监听Widget数组的更新
  _onDataUpdate(YArrayEvent: Array<any>, Transaction: any){
    const data = this.yWidget.toJSON() as T[]

    let updateData: UpdateData[] = []

    YArrayEvent.forEach(event=>{
      const eventData = {
        added: event.changes.added,
        deleted: event.changes.deleted,
        delta: event.changes.delta as Delta[],
        keys: event.changes.keys as Map<string, {
          action: 'add' | 'update' | 'delete';
          oldValue: any;
        }>,
        path: event.path,
        yWidget: event.currentTarget
      }
      // 向数组新增或删除widget ------
      if(eventData.delta.length!==0){
        let deltaData: Delta = {
          retain: 0
        }
        eventData.delta.forEach(item=>{
          item.retain && (deltaData.retain = item.retain)
          item.insert && (deltaData.insert = item.insert)
          item.delete && (deltaData.delete = item.delete)
        })
        updateData.push({
          type: 'array',
          path: eventData.path,
          target: event.target,
          deltaData: deltaData,
          keysData: undefined,
          handler: this.handlerArray.bind(this, eventData.path, deltaData)
        })
      }

      // 向map中添加、修改、删除
      if(eventData.keys.size !== 0){
        eventData.keys.forEach((value, key)=>{
          const keysData: KeysData = {
            key: key,
            action: value.action,
            value: event.target.get(key)
          }
          updateData.push(
            {
              type: 'map',
              path: eventData.path,
              target: event.target,
              deltaData: undefined,
              keysData: keysData,
              handler: this.handlerMap.bind(this, eventData.path, keysData)
            })
        })
      }
    })

    this.onDataUpdate(data, updateData)
  }

  onDataUpdate: (data: T[], updateData: UpdateData[])=>void = ()=>{}

  // 根据path获取当前被修改的对象
  getCurrentByPath(data: any, path: Array<string|number>){
    let current: any = data
    while (path.length>0){
      const key = path.shift()
      if(!CheckType.isExist<string|number>(key)) return current;
      current = current[key]
    }
    return current;
  }

  // 处理数组
  handlerArray(path: Array<string|number>, deltaData: Delta,  currentData: any){
    const current = this.getCurrentByPath(currentData, path)
    if(!CheckType.isArray(current)) throw 'handlerArray current not array'
    // 插入数据
    if(deltaData.insert && CheckType.isArray(deltaData.insert)){
      const insertData = deltaData.insert.map(item=>{
        if(item instanceof Y.Map || item instanceof Y.Array){
          return item.toJSON()
        }else{
          return  item
        }
      })
      current.splice(deltaData.retain||0, 0, ...insertData)
    } else if(deltaData.delete && CheckType.isNumber(deltaData.delete)){
      current.splice(deltaData.retain||0, deltaData.delete)
    }
  }

  // 处理map
  handlerMap(path: Array<string|number>, keysData: KeysData,  currentData: any){
    const current = this.getCurrentByPath(currentData, path)
    if(!CheckType.isObject(current)) throw 'handlerMap current not object'
    if(keysData.action === 'delete'){
      Reflect.deleteProperty(current, keysData.key)
    }else{
      Reflect.set(current, keysData.key, keysData.value)
    }
  }

  destroy(){
    this.yWidget.unobserveDeep(this._onDataUpdate)
    this.wsProvider.destroy()
  }

}
