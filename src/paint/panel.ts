import Dispatcher from '../lib/dispatcher'
import DataStore from '../lib/data-store'
import Canvas from './canvas'
import ScrollCanvas from '../paint/scrollCanvas'
import Settings from '../default'
import { style } from '../lib/utils'

const TIME_SCROLLER_HEIGHT = 35
const MARKER_TRACK_HEIGHT = 25

export default class TimelinePanel {
  private needRepaint: boolean = false
  private dispatcher: Dispatcher
  private data: DataStore
  private canvas: HTMLCanvasElement
  private dpr = window.devicePixelRatio
  private scrollHeight: number
  private scrollCanvas: Canvas
  private containerDiv: HTMLDivElement

  constructor(data: DataStore, dispatcher: Dispatcher) {
    this.data = data
    this.dispatcher = dispatcher

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

    const ctx = this.canvas.getContext('2d')
  }

  private resize() {
    const h = Settings.height - TIME_SCROLLER_HEIGHT
    this.dpr = window.devicePixelRatio
    this.canvas.width = Settings.width * this.dpr
    this.canvas.height = h * this.dpr
    this.canvas.style.width = Settings.width + 'px'
    this.canvas.style.height = h + 'px'
    this.scrollHeight = Settings.height - TIME_SCROLLER_HEIGHT

  }

  get dom() {
    return this.containerDiv
  }
}
