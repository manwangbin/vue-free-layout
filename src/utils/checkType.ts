/*
 * @Description: 获取类型
 * @Author: yanxiaos
 * @Github: https://github.com/yanxiaos
 * @Date: 2022/4/15 17:01
 * @LastEditors: yanxiaos
 * @Path: src/utils/checkType.ts
 */

export class CheckType {
  static getType(v: unknown): string {
    return Object.prototype.toString.call(v)
  }

  static isNumber(v: unknown): v is number {
    return CheckType.getType(v) === '[object Number]'
  }

  static isString(v: unknown): v is string {
    return CheckType.getType(v) === '[object String]'
  }

  static isBoolean(v: unknown): v is boolean {
    return CheckType.getType(v) === '[object Boolean]'
  }

  static isObject<T=Record<keyof any, unknown>>(v: unknown): v is T {
    return CheckType.getType(v) === '[object Object]'
  }

  static isArray<T=Array<unknown>>(v: unknown): v is T {
    return CheckType.getType(v) === '[object Array]'
  }

  static isEmptyObj(v: unknown): v is {} {
    return CheckType.isObject(v) && !Object.keys(v).length
  }

  static isEmptyArr(v: unknown): v is [] {
    return CheckType.isArray(v) && !v.length
  }

  static isFunction<T=Function>(v: unknown): v is T {
    return CheckType.getType(v) === '[object Function]'
  }

  // 不为 undefined && null
  static isExist<T=unknown>(v: unknown): v is T {
    return v !== undefined && v !== null
  }

  static isDate(v: unknown): v is Date {
    return CheckType.getType(v) === '[object Date]'
  }
}