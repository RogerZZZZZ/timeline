import { ILayer } from '../IInterface'
import Dispatcher from '../lib/dispatcher'
import DataStore from '../lib/data-store'
import Canvas from './canvas'
import ScrollCanvas from '../paint/scrollCanvas'
import Settings from '../default'
import { style, proxyCtx, formatTimeRuler } from '../lib/utils'
import wrapperDrag from '../lib/drag'
import Theme from '../theme'

const TIME_SCROLLER_HEIGHT = 35
const MARKER_TRACK_HEIGHT = 25
const LEFT_GUTTER = 20
let tickMark1 = Settings.time_scale / 60
let tickMark2 = 2 * tickMark1
let tickMark3 = 10 * tickMark1
let frameStart = 0
let timeScale = Settings.time_scale

export default class TimelinePanel {
  private needRepaint: boolean = false
  private dispatcher: Dispatcher
  private data: DataStore
  private canvas: HTMLCanvasElement
  private dpr = window.devicePixelRatio
  private scrollHeight: number = 0
  private scrollCanvas: Canvas
  private containerDiv: HTMLDivElement
  private renderItems = [] as any[]
  private ctx: any
  private ctxProxy: any
  private layers: ILayer[]
  private pointer: {x: number, y: number} | null
  private scrollTop = 0
  private scrollLeft = 0
  private canvasBounds: any
  private mouseDownItem: any
  private mouseDown = false
  private mouseDownThenMove = false
  private overItem: any
  private currentTime: number
  private x: number

  constructor(data: DataStore, dispatcher: Dispatcher) {
    this.data = data
    this.dispatcher = dispatcher

    this.layers = this.data.get('layers').value
    this.canvas = document.createElement('canvas')
    this.containerDiv = document.createElement('div')
    this.scrollCanvas = new Canvas(Settings.width, TIME_SCROLLER_HEIGHT)

    style(this.canvas, {
      position: 'absolute',
      top: TIME_SCROLLER_HEIGHT + 'px',
      left: '0px',
    })

    style(this.scrollCanvas.dom, {
      position: 'absolute',
      top: '0px',
      left: '10px',
    })

    this.scrollCanvas.uses(new ScrollCanvas(this.dispatcher, this.data))

    this.containerDiv.appendChild(this.canvas)
    this.containerDiv.appendChild(this.scrollCanvas.dom)

    this.resize()

    this.ctx = this.canvas.getContext('2d')
    this.ctxProxy = proxyCtx(this.ctx || undefined)

    this.repaint()

    document.addEventListener('mousemove', this.onMouseMove)

    this.canvas.addEventListener('mouseout', () => {
      this.pointer = null;
    })

    wrapperDrag(this.canvas, /** down */ (e: any) => {
      this.mouseDown = true
      this.pointer = {
        x: e.offsetx,
        y: e.offsety
      }
      // Todo pointerEvents()
    }, /** move */ (e: any) => {
      this.mouseDown = false
      if (this.mouseDownItem) {
        this.mouseDownThenMove = true
        if (this.mouseDownItem.mouseDrag) {
          this.mouseDownItem.mouseDrag(e)
        }
      } else {
        dispatcher.fire('time.update', this.xToTime(e.offsetx))
      }
    }, /** up */ (e: any) => {
      if (this.mouseDownThenMove) {
        dispatcher.fire('keyframe.move')
      } else {
        dispatcher.fire('time.update', this.xToTime(e.offsetx))
      }

      this.mouseDown = false
      this.mouseDownItem = null
      this.mouseDownThenMove = false
    })
  }

  public onMouseMove(e: any) {
    this.canvasBounds = this.canvas.getBoundingClientRect()
    const mx = e.clientX - this.canvasBounds.left
    const my = e.clientY - this.canvasBounds.top
    this.onPointerMove(mx, my)
  }

  public onPointerMove(x: number, y: number) {
    if (this.mouseDownItem) return
    this.pointer = { x, y }
  }

  public scrollTo(s: number) {
    this.scrollTop = s * Math.max(this.layers.length * Settings.LINE_HEIGHT - this.scrollHeight, 0)
    this.repaint()
  }

  public xToTime(x: number) {
    const units = timeScale / tickMark3
    return frameStart + ((x - LEFT_GUTTER) / units | 0) / tickMark3
  }

  public timeToX(s: number) {
    let ds = s - frameStart
    ds *= timeScale
    ds += LEFT_GUTTER
    return ds
  }

  public yToTrack(y: number) {
    if (y - MARKER_TRACK_HEIGHT < 0) return -1
    return  (y - MARKER_TRACK_HEIGHT + this.scrollTop) / Settings.LINE_HEIGHT | 0
  }

  public repaint() {
    this.needRepaint = true
  }

  public setTimeScale() {
    const v = this.data.get('ui:timeScale').value
    if (timeScale !== v) {
      timeScale = v
      this.timeScaled()
    }
  }

  private timeScaled() {
    tickMark1 = timeScale / 60;
    tickMark2 = 2 * tickMark1;
    tickMark3 = 10 * tickMark1;
  }

  public pointerEvents() {
    if (!this.pointer) return

    this.ctxProxy
      .save()
      .scale(this.dpr, this.dpr)
      .translate(0, MARKER_TRACK_HEIGHT)
      .beginPath()
      .rect(0, 0, Settings.width, this.scrollHeight)
      .translate(-this.scrollLeft, -this.scrollTop)
      .clip()
      .run(this.check)
      .restore()
  }

  public drawLayerContents() {
    this.renderItems = []
    let y: number
    for (let i = 0, il = this.layers.length; i < il; i++) {
      this.ctx.strokeStyle = Theme.b
      this.ctx.beginPath()
      y = i * Settings.LINE_HEIGHT
      y = ~~y - 0.5

      this.ctxProxy
        .moveTo(0, y)
        .lineTo(Settings.width, y)
        .stroke()
    }

    let frame: any
    let frame2: any

    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i]
      const values: any = layer.values

      y = i * Settings.LINE_HEIGHT

      for (let j = 0; j < values.length; j++) {
        frame = values[j]
        frame2 = values[j + 1]

        const x = this.timeToX(frame.time)
        const x2 = this.timeToX(frame2.time)

        if (!frame.tween || frame.tween === 'none') continue

        const y1 = y + 2
        const y2 = y + Settings.LINE_HEIGHT - 2

        this.renderItems.push(new this.EarsingRect(this, x, y1, x2, y2, frame, frame2))
      }

      // TODO draw diamond
    }

    // render items
    for (let i = 0; i < this.renderItems.length; i++) {
      let item = this.renderItems[i]
      item.paint(this.ctxProxy)
    }
  }

  public check() {
    let item: any
    const lastOver = this.overItem
    this.overItem = null
    for (let i = 0; i < this.renderItems.length; i++) {
      item = this.renderItems[i]
      item.path(this.ctxProxy)

      if (this.pointer && this.ctx.isPointInPath(this.pointer.x * this.dpr, this.pointer.y * this.dpr)) {
        this.overItem = item
        break
      }
    }

    if (this.overItem && this.overItem !== lastOver) {
      item = lastOver
      if (item.mouseout) item.mouseout()
    }

    if (this.overItem) {
      item = this.overItem
      if (item.mouseover) item.mouseover()

      if (this.mouseDown) this.mouseDownItem = item
    }
  }

  public paint() {
    if (!this.needRepaint) {
      this.pointerEvents()
      return
    }

    this.scrollCanvas.repaint()
    this.setTimeScale()

    this.currentTime = this.data.get('ui:currentTime').value
    frameStart = this.data.get('ui:scrollTime').value

    this.ctx.fillStyle = Theme.a
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.save()
    this.ctx.scale(this.dpr, this.dpr)
    this.ctx.lineWidth = 1

    let units = timeScale / tickMark1
    const offsetUnits = (frameStart * timeScale) % units

    let count = (Settings.width - LEFT_GUTTER + offsetUnits) / units

    for (let i = 0; i < count; i++) {
      this.x = i * units + LEFT_GUTTER - offsetUnits

      this.ctx.strokeStyle = Theme.b
      this.ctx.beginPath()
      this.ctx.moveTo(this.x, 0)
      this.ctx.lineTo(this.x, Settings.height)
      this.ctx.stroke()

      this.ctx.fillStyle = Theme.b
      this.ctx.textAlign = 'center'

      const t = formatTimeRuler((i * units - offsetUnits) / timeScale + frameStart)
      this.ctx.fillText(t, this.x, 38)
    }

    units = timeScale / tickMark2
    count = (Settings.width - LEFT_GUTTER + offsetUnits) / units

    for (let i = 0; i < count; i++) {
      this.ctx.strokeStyle = Theme.c
      this.ctx.beginPath()
      this.x = i * units + LEFT_GUTTER - offsetUnits
      this.ctx.moveTo(this.x, MARKER_TRACK_HEIGHT)
      this.ctx.lineTo(this.x, MARKER_TRACK_HEIGHT - 16)
      this.ctx.stroke()
    }

    const muliple = tickMark3 / tickMark2
    units = timeScale / tickMark3
    count = (Settings.width - LEFT_GUTTER + offsetUnits) / units

    for (let i = 0; i < count; i++) {
      if (i % muliple !== 0) {
        this.ctx.strokeStyle = Theme.c
        this.ctx.beginPath()
        this.x = i * units + LEFT_GUTTER - offsetUnits
        this.ctx.moveTo(this.x, MARKER_TRACK_HEIGHT)
        this.ctx.lineTo(this.x, MARKER_TRACK_HEIGHT - 10)
        this.ctx.stroke()
      }
    }

    this.ctxProxy
      .save()
      .translate(0, MARKER_TRACK_HEIGHT)
			.beginPath()
			.rect(0, 0, Settings.width, this.scrollHeight)
			.translate(-this.scrollLeft, -this.scrollTop)
			.clip()
				.run(this.drawLayerContents)
      .restore();

    this.ctx.strokeStyle = 'red'
    this.x = (this.currentTime - frameStart) * timeScale + LEFT_GUTTER

    const txt = formatTimeRuler(this.currentTime)
    const txtWidth = this.ctx.measureText(txt).width
    const baseLine = MARKER_TRACK_HEIGHT - 5
    const halfRect = txtWidth / 2 + 4

    this.ctx.beginPath()
    this.ctx.moveTo(this.x, baseLine)
    this.ctx.lineTo(this.x, Settings.height)
    this.ctx.stroke()

    this.ctx.fillStyle = 'ref'
    this.ctx.textAlign = 'center'
    this.ctx.beginPath()
    this.ctx.moveTo(this.x, baseLine + 5)
    this.ctx.lineTo(this.x + 5, baseLine)
    this.ctx.lineTo(this.x + halfRect, baseLine);
		this.ctx.lineTo(this.x + halfRect, baseLine - 14);
		this.ctx.lineTo(this.x - halfRect, baseLine - 14);
		this.ctx.lineTo(this.x - halfRect, baseLine);
		this.ctx.lineTo(this.x - 5, baseLine);
		this.ctx.closePath();
		this.ctx.fill();

		this.ctx.fillStyle = 'white';
		this.ctx.fillText(txt, this.x, baseLine - 4);

		this.ctx.restore();

		this.needRepaint = false;

  }

  private EarsingRect = class {
    private superThis: TimelinePanel
    private x1: number
    private y1: number
    private x2: number
    private y2: number
    private frame: any
    private frame2: any

    constructor(
      superThis: TimelinePanel,
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      frame: any,
      frame2: any) {
      this.superThis = superThis
      this.x1 = x1
      this.y1 = y1
      this.x2 = x2
      this.y2 = y2
      this.frame = frame
      this.frame2 = frame2
    }

    public path() {
      this.superThis.ctxProxy.beginPath()
        .rect(this.x1, this.y1, this.x2 - this.x1, this.y2 - this.y1)
        .closePath()
    }

    public paint() {
      this.path()
      this.superThis.ctx.fillStyle = this.frame._color
      this.superThis.ctx.fill()
    }

    public mouseover() {
      this.superThis.canvas.style.cursor = 'pointer'
    }

    public mouseout() {
      this.superThis.canvas.style.cursor = 'default'
    }

    public mouseDrag(e: any) {
      const t1 = Math.max(0, this.superThis.xToTime(this.x1 + e.dx))
      this.frame.time = t1

      const t2 = Math.max(0, this.superThis.xToTime(this.x2 + e.dx))
      this.frame2.time = t2
    }
  }

  public resize() {
    const h = Settings.height - TIME_SCROLLER_HEIGHT
    this.dpr = window.devicePixelRatio
    this.canvas.width = Settings.width * this.dpr
    this.canvas.height = h * this.dpr
    this.canvas.style.width = Settings.width + 'px'
    this.canvas.style.height = h + 'px'
    this.scrollHeight = Settings.height - TIME_SCROLLER_HEIGHT
    this.scrollCanvas.setSize(Settings.width, TIME_SCROLLER_HEIGHT)
  }

  // private setState(state: any) {
  //   this.layers = state.value
  //   this.repaint()
  // }

  get dom() {
    return this.containerDiv
  }
}
