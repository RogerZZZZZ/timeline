import Settings from '../default'
import Theme from '../theme'

export default class TimeStampPoint {
  private x: number
  private y: number
  private isOver: boolean = false
  private canvas: HTMLCanvasElement
  private ctxProxy: any

  constructor(x: number, y: number, canvas: HTMLCanvasElement, ctxProxy: any) {
    this.x = x
    this.y = y + Settings.LINE_HEIGHT * 0.5 - Settings.DIAMOND_SIZE / 2
    this.canvas = canvas
    this.ctxProxy = ctxProxy
  }

  public mouseOver() {
    this.isOver = true
    this.canvas.style.cursor = 'move'
    this.paint(this.ctxProxy)
  }

  public mouseOut() {
    this.isOver = false
    this.canvas.style.cursor = 'default'
    this.paint(this.ctxProxy)
  }

  public paint(ctx: any) {
    this.path(ctx)
    if (!this.isOver) {
      ctx.fillStyle(Theme.c)
    } else {
      ctx.fillStyle('yellow')
    }

    ctx.fill().stroke()
  }

  private path(ctx: any) {
    ctx.beginPath()
      .moveTo(this.x, this.y)
      .lineTo(this.x + Settings.DIAMOND_SIZE / 2, this.y + Settings.DIAMOND_SIZE / 2)
      .lineTo(this.x, this.y + Settings.DIAMOND_SIZE)
      .lineTo(this.x - Settings.DIAMOND_SIZE / 2, this.y + Settings.DIAMOND_SIZE / 2)
      .closePath()
  }
}
