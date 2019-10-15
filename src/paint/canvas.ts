import { ICanvas } from '../IInterface'
import ScrollCanvas from './scrollCanvas'
import wrapDrag from '../lib/drag'

export default class Canvas implements ICanvas {
  private width: number
  private height: number
  private canvasItems = [] as any[]
  private ctx: any
  private dpr: number
  private canvas: HTMLCanvasElement
  private child: ScrollCanvas

  constructor(w: number, h: number) {
    this.width = w
    this.height = h
    this.create()
    this.setSize(w, h)

    wrapDrag(this.canvas,
      /** down */ (e: any) => {
        this.child && this.child.onDown && this.child.onDown(e)
      }, /** move */ (e: any) => {
        this.child && this.child.onMove && this.child.onMove(e)
      }, /** up */ () => {
        this.child && this.child.onUp && this.child.onUp()
      })
  }

  public create() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  public setSize(w: number, h: number) {
    this.width = w
    this.height = h
    this.dpr = window.devicePixelRatio
    this.canvas.width = this.width * this.dpr
    this.canvas.height = this.height * this.dpr
    this.canvas.style.width = this.width + 'px'
    this.canvas.style.height = this.height + 'px'

    if (this.child) this.child.setSize(w, h)
  }

  public paint(ctx: any) {
    if (this.child && typeof this.child.paint === 'function') {
      this.child.paint(ctx)
    }

    for (let i = 0; i < this.canvasItems.length; i++) {
      this.canvasItems[i].paint()
    }
  }

  public repaint() {
    this.paint(this.ctx)
  }

  public add(item: any) {
    this.canvasItems.push(item)
  }

  public remove(item: any) {
    this.canvasItems.splice(this.canvasItems.indexOf(item), 1)
  }

  public uses(c: ScrollCanvas) {
    this.child = c
    this.child.add = this.add
    this.child.remove = this.remove
  }

  get dom() {
    return this.canvas
  }
}
