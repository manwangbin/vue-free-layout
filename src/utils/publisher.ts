import {CheckType} from "./checkType";


export class Publisher<T extends (...args: Array<any>)=>any, R> {
  // 订阅者列表
  private subscriberList: Array<T> = []

  // 发布
  emit(...args: Array<R>){
    return this.subscriberList.map(item=>{
      if(CheckType.isFunction(item)){
        return item.apply(this, args)
      }else{
        console.error('Publisher emit is not Function');
        return item
      }
    })
  }

  // 订阅
  on(callback: T){
    this.subscriberList.push(callback)
  }

  // 取消订阅
  off(callback: T){
    this.subscriberList = this.subscriberList.filter(fun=>fun!==callback)
  }

  // 清空订阅者
  clear(){
    this.subscriberList.length = 0
  }
}
