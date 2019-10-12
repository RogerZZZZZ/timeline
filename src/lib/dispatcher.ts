export default class Dispatcher {
  private eventListener: any = {}

  public on(type: string, listener: Function) {
    if (!(type in this.eventListener)) {
      this.eventListener[type] = []
    }

    this.eventListener[type].push(listener)
  }

  public fire(type: string, ...arg: any[]) {
    const listeners = this.eventListener[type]
    if (!listeners) return

    for (let i = 0; i < listeners.length; i++) {
      listeners[i].apply(listeners[i], arg)
    }
  }
}
