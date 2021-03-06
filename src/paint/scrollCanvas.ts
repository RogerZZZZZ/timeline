import Theme from '../theme'
import DataStore from '../lib/dataStore'
import Dispatcher from '../lib/dispatcher'

class Rect {
  private x: number
  private y: number
  private w: number
  private h: number

  public setSize(
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  public paint(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = Theme.b
    ctx.strokeStyle = Theme.c

    this.shape(ctx)
    ctx.stroke()
    ctx.fill()
  }

  public shape(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.rect(this.x, this.y, this.w, this.h)
  }

  public contains(x: number, y: number) {
    return x >= this.x
          && y >= this.y
          && x <= this.x + this.w
          && y <= this.y + this.h;
  }
}

export default class ScrollCanvas {
  private width: number
  private height: number
  private MARGINS = 15
  private scroller = {
    left: 0,
    grip_length: 0,
    k: 1,
  }
  private rect: Rect
  private dispatcher: Dispatcher
  private data: DataStore
  private draggingOffset: number | null = 0

  public add: any
  public remove: any

  constructor(dispatcher: Dispatcher, data: DataStore) {
    this.dispatcher = dispatcher
    this.data = data
    this.rect = new Rect()
  }

  public setSize(w: number, h: number) {
    this.width = w
    this.height = h
  }

  public paint(ctx: CanvasRenderingContext2D) {
    const totalTime = this.data.get('ui:totalTime').value
    const scrollTime = this.data.get('ui:scrollTime').value
    const pixelsPreSecond = this.data.get('ui:timeScale').value
    const w = this.width - 2 * this.MARGINS
    const h = 16

    ctx.save()
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.translate(this.MARGINS, 5)
    ctx.beginPath()
    ctx.strokeStyle = Theme.b
    ctx.rect(0, 0, w, h)
    ctx.stroke()

    const totalTimePixels = totalTime * pixelsPreSecond
    const k = w / totalTimePixels
    this.scroller.k = k
    const len = w * k
    const left = scrollTime / totalTime * w
    if (len + left <= w) {
      this.scroller.grip_length = len
      this.scroller.left = left
    } else {
      this.scroller.grip_length = len
      this.scroller.left = w - len
    }
    this.rect.setSize(this.scroller.left, 0, this.scroller.grip_length, h)
    this.rect.paint(ctx)
    ctx.restore()
  }

  public onDown(e: any) {
    if (this.rect.contains(e.offsetx - this.MARGINS, e.offsety - 5)) {
      this.draggingOffset = this.scroller.left
      return
    }

    const totalTime = this.data.get('ui:totalTime').value
    const w = this.width - 2 * this.MARGINS
    const t = (e.offsetx - this.MARGINS) / w * totalTime

    this.dispatcher.fire('time.update', t)
  }

  public onMove(e: any) {
    if (this.draggingOffset !== null) {
      const totalTime = this.data.get('ui:totalTime').value
      const w = this.width - 2 * this.MARGINS
      if (this.scroller.grip_length + this.scroller.left <= w) {
        this.dispatcher.fire('update.scrollTime', (this.draggingOffset + e.dx) / w * totalTime)
      }
    } else {
      this.onDown(e)
    }
  }

  public onUp() {
    this.draggingOffset = null
  }
}
