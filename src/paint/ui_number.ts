import Theme from '../theme'
import { style, firstDefined } from '../lib/utils'
import SimpleEvents from '../lib/SimpleEvents'
import wrapDrag from '../lib/drag'

export default class UINumber {
  private xStep: number
  private yStep: number
  private wheelStep: number
  private wheelStepFine: number
  private precision: number
  private containerSpan: HTMLInputElement
  public onChangeEvents: SimpleEvents
  private spanValue: number
  private unChangeValue: number
  private min: number

  constructor(config: any) {
    this.xStep = firstDefined(config.xstep, config.step, 0.001)
    this.yStep = firstDefined(config.ystep, config.step, 0.1)
    this.wheelStep = firstDefined(config.wheelStep, this.yStep)
    this.wheelStepFine = firstDefined(config.wheelStepFine, this.xStep)

    this.precision = config.precision || 3
    this.min = config.min === undefined ? -Infinity : config.min

    this.containerSpan = document.createElement('input')
    style(this.containerSpan, {
      textAlign: 'center',
      fontSize: '10px',
      padding: '1px',
      cursor: 'ns-resize',
      width: '40px',
      margin: 0,
      marginRight: '10px',
      appearance: 'none',
      outline: 'none',
      border: 0,
      background: 'none',
      borderBottom: '1px dotted '+ Theme.c,
      color: Theme.c,
    })

    this.containerSpan.addEventListener('change', () => {
      this.spanValue = parseFloat(this.containerSpan.value)
      this.onChangeEvents.fire(this.spanValue)
    })

    this.containerSpan.addEventListener('keydown', (e: any) => {
      e.stopPropagation()
    })

    this.containerSpan.addEventListener('focus', () => {
      this.containerSpan.setSelectionRange(0, this.containerSpan.value.length)
    })

    this.containerSpan.addEventListener('wheel', (e: WheelEvent) => {
      let inc = e.deltaY > 0 ? 1 : -1
      if (e.altKey) {
        inc *= this.wheelStepFine
      } else {
        inc *= this.wheelStep
      }
      this.spanValue = Math.max(this.min, this.spanValue + inc)
      this.onChangeEvents.fire(this.spanValue)
    })

    wrapDrag(this.containerSpan, this.onDown, this.onMove, this.onUp)

    this.onChangeEvents = new SimpleEvents(null)
  }

  public setValue(v: any) {
    this.spanValue = v
    this.containerSpan.value = this.spanValue.toFixed(this.precision)
  }

  public paint() {
    if (this.spanValue && document.activeElement !== this.containerSpan) {
      this.containerSpan.value = this.spanValue.toFixed(this.precision)
    }
  }

  private onMove(e: any) {
    this.spanValue = Math.max(this.min, this.unChangeValue + (e.dx * this.xStep) + (e.dy * -this.yStep))

    this.onChangeEvents.fire(this.spanValue, true)
  }

  private onUp(e: any) {
    if (e.moved) {
      this.onChangeEvents.fire(this.spanValue)
    } else {
      this.containerSpan.focus()
    }
  }

  private onDown() {
    this.unChangeValue = this.spanValue
  }

  get dom() {
    return this.containerSpan
  }
}
