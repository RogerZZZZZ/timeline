import { ILayer } from '../IInterface'
import { IData, IListener } from '../IInterface'
import Settings from '../default'

class DataProx {
  private path: string
  private store: DataStore

  constructor(store: DataStore, path: string) {
    this.path = path
    this.store = store
  }

  get value() {
    return this.store.getValue(this.path)
  }

  set value(value: any) {
    this.store.setValue(this.path, value)
  }

  public get(path: any) {
    return this.store.get(path, this.path)
  }
}

export default class DataStore {
  private DELIMITER = ':'
  private listeners = [] as IListener[]
  private defaultData: IData = {
    modified: (new Date()).toString(),
    ui: {
      currentTime: 0,
      totalTime: Settings.default_length,
      scrollTime: 0,
      timeScale: Settings.time_scale,
    },
    layers: [] as ILayer[],
  }
  private data = Object.assign({}, this.defaultData)

  public addListener(path: string, cb: Function) {
    this.listeners.push({
      path,
      callback: cb,
    })
  }

  public clear() {
    this.data = Object.assign({}, this.defaultData)
  }

  public toJsonString() {
    return JSON.stringify(this.data)
  }

  public getValue(paths: string) {
    const path = paths.split(this.DELIMITER)
    let ref = this.data
    for (let i = 0, il = path.length; i < il; i++) {
      const tmpPath = path[i]
      if (ref[tmpPath] === undefined) {
        return
      }
      ref = ref[tmpPath]
    }
    return ref
  }

  public setValue(paths: string, value: any) {
    const path = paths.split(this.DELIMITER)
    let ref: any = this.data
    for (let i = 0, il = path.length; i < il; i++) {
      const tmpRef = ref[path[i]]
      if (tmpRef) {
        ref = tmpRef
      } else {
        ref[path[i]] = {}
      }
    }
    ref = value
  }

  public get(path: string, suffix?: string) {
    if (suffix) {
      path = suffix + this.DELIMITER + path
    }
    return new DataProx(this, path)
  }

}
