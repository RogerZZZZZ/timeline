export default class SimpleEvents {
  private ctx: any
  private listeners: any[] = []

  constructor(ctx: any) {
    this.ctx = ctx
  }

  public push(event: Function) {
    this.listeners.push(event)
  }

  public remove(event: Function) {
    this.listeners.splice(this.listeners.indexOf(event), 1)
  }

  public fire(...args: any[]) {
    for (let i = 0; i < this.listeners.length; i++) {
      this.listeners[i].apply(this.ctx, args)
    }
  }
}
