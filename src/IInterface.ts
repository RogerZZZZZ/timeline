export interface IListener {
  path: string
  callback: Function
}

export interface IUiAttr {
  currentTime: number
  totalTime: number
  scrollTime: number
  timeScale: number
}

export interface IData {
  modified: string
  ui: IUiAttr
  layers: any[]
}

export interface ILayer {
  name: string
  values: any
  _value: number
  _color: string
  _mute: boolean
}


export interface ICanvas {
  paint(ctx: CanvasRenderingContext2D): void
  add(item: any): void
  remove(item: any): void
}
