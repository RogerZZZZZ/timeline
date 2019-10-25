import { style } from '../lib/utils'
import SimpleEvents from '../lib/SimpleEvents'

const scrolltrack_style = {
	position: 'absolute',
	background: '-webkit-gradient(linear, left top, right top, color-stop(0, rgb(29,29,29)), color-stop(0.6, rgb(50,50,50)) )',
	border: '1px solid rgb(29, 29, 29)',
	textAlign: 'center',
	cursor: 'pointer'
};

const scrollbar_style = {
	background: '-webkit-gradient(linear, left top, right top, color-stop(0.2, rgb(88,88,88)), color-stop(0.6, rgb(64,64,64)) )',
	border: '1px solid rgb(25,25,25)',
	position: 'relative',
	borderRadius: '6px'
};


export default class ScrollBar {
  private h: number
  private scrollTrack: HTMLDivElement
  private scrollBar: HTMLDivElement
  private barLength: number
  private barY: number
  private scrollTrackHeight: number
  private mouseDownGrip: number

  private SCROLLBAR_WIDTH: number = 12
  private SCROLLBAR_MARGIN: number = 3
  private SCROLL_WIDTH: number
  private MIN_BAR_LENGTH: number = 25

  public onScrollEvents: SimpleEvents

  constructor(w: number, h: number) {
    this.h = h

    this.SCROLLBAR_WIDTH = w ? w : 12
    this.SCROLL_WIDTH = this.SCROLLBAR_WIDTH + this.SCROLLBAR_MARGIN * 2

    this.scrollTrack = document.createElement('div')
    this.scrollTrack.classList.add('timeline_scrollTrack')
    style(this.scrollTrack, scrolltrack_style)
    this.scrollTrackHeight = h - 2
    this.scrollTrack.style.height = this.scrollTrackHeight + 'px'
    this.scrollTrack.style.width = this.SCROLL_WIDTH + 'px'

    this.scrollBar = document.createElement('div')
    this.scrollBar.classList.add('timeline_scrollBar')
    style(this.scrollBar, scrollbar_style)
    this.scrollBar.style.width = this.SCROLLBAR_WIDTH + 'px'
    this.scrollBar.style.height = h / 2 + 'px'
    this.scrollBar.style.top = 0 + 'px'
    this.scrollBar.style.left = this.SCROLLBAR_MARGIN + 'px'

    this.scrollTrack.appendChild(this.scrollBar)

    this.onScrollEvents = new SimpleEvents(null)

    this.setLength(1)
    this.setPosition(0)

    this.scrollTrack.addEventListener('mousedown', this.onDown, false)
  }

  public onDown(event: any) {
    event.preventDefault()

    if (event.target === this.scrollBar) {
      this.mouseDownGrip = event.clientY
      document.addEventListener('mousemove', this.onMove, false)
      document.addEventListener('mouseup', this.onUp, false)
    } else {
      if (event.clientY < this.barY) {
        this.onScrollEvents.fire('pageup')

      } else if (event.clientY > (this.barY + this.barLength)) {
        this.onScrollEvents.fire('pagedown')
      }
    }
  }

  public setLength(length: number) {
    const l = Math.max(Math.min(1, length), 0) * this.scrollTrackHeight
    this.barLength = Math.max(l, this.MIN_BAR_LENGTH)
    this.scrollBar.style.height = this.barLength + 'px'
  }

  public setHeight(height: number) {
    this.h = height
    this.scrollTrackHeight = this.h - 2
    this.scrollTrack.style.height = this.scrollTrackHeight + 'px'
  }

  public setPosition(position: number) {
    const p = Math.max(Math.min(1, position), 0)
    const emptyTrack = this.scrollTrackHeight - this.barLength
    this.barY = p * emptyTrack
    this.scrollBar.style.top = this.barY + 'px'
  }

  private onMove(event: any) {
    event.preventDefault()

    const emptyTrack = this.scrollTrackHeight - this.barLength
    const scrollTo = (event.clientY - this.mouseDownGrip) / emptyTrack > 1 ? 1 : 0

    this.setPosition(scrollTo)
    this.onScrollEvents.fire('scrollto', scrollTo)
  }

  private onUp(event: any) {
    this.onMove(event)
    document.removeEventListener('mousemove', this.onMove, false)
    document.removeEventListener('mouseup', this.onUp, false)
  }

  get dom() {
    return this.scrollTrack
  }
}
