export default class Dispatcher {
  private eventListener: any = {}

  public on(type: string, listener: Function, context: any) {
    if (!(type in this.eventListener)) {
      this.eventListener[type] = []
    }

    this.eventListener[type].push({
      listener: listener,
      context: context
    })
  }

  public fire(type: string, ...arg: any[]) {
    console.log('type', type)
    const listeners = this.eventListener[type]
    if (!listeners) return

    for (let i = 0; i < listeners.length; i++) {
      const t = listeners[i]
      t.listener.apply(t.context, arg)
    }
  }
}
