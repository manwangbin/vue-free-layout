
export enum Direction{
  ROW='row',
  COLUMN='column'
}

export interface FieldInterface<S>{

  // 状态
  stateMap: Map<string,S>

  initState: (id: string, defaultState: S) => S

  getState: (id: string) => S | undefined

  delState: (id: string) => void

  // 设置标签对齐方式
  setDirection: (id: string, direction: Direction) => void
}
