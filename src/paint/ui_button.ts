import Theme from '../theme'
import { style } from '../lib/utils'
const font = require('./font.json')

const buttonStyle = {
  padding: '0.2em 0.4em',
  margin: '0em',
  background: 'none',
  outline: 'none',
  fontSize: '16px',
  border: 'none',
  borderRadius: '0.2em',
}

const borders = {
  border: '1px solid ' + Theme.b
}

const noBorders = {
  border: '1px solid transparent'
}

export default class IconButton {
  private LONG_HOLD_DURATION = 500
  private button: HTMLButtonElement
  private cavnas: HTMLCanvasElement
  private ctx: any
  private size: any
  private icon: string
  private tooltip: string
  private dp: any
  private dpr: number = 1
  private onLongHoldTimer: any

  public CMD_MAP = {
    M: 'moveTo',
    L: 'lineTo',
    Q: 'quadraticCurveTo',
    C: 'bezierCurveTo',
    Z: 'closePath'
  }

  constructor(size: any, icon: string, tooltip: string, dp: any) {
    this.size = size
    this.icon = icon
    this.tooltip = tooltip
    this.dp = dp

    this.button = document.createElement('button')
    this.button.classList.add('timeline_uiButton')
    style(this.button, buttonStyle)
    this.button.style.background = 'none'
    style(this.button, noBorders)
    this.button.addEventListener('mouseover', () => {
      style(this.button, borders)

      this.ctx.fillStyle = Theme.d
      this.ctx.shadowColor = Theme.b
      this.ctx.shadowBlur = 0.5 * this.dpr
      this.ctx.shadowOffsetX = this.dpr
      this.ctx.shadowOffsetY = this.dpr

      this.draw()
      if (this.tooltip && this.dp) this.dp.fire('status', 'button:' + this.tooltip)
    })

    this.button.addEventListener('mousedown', () => {
      this.button.style.background = Theme.b
    })

    this.button.addEventListener('mouseup', () => {
      this.button.style.background = 'none'
      style(this.button, borders)
    })

    this.button.addEventListener('mouseout', () => {
      this.button.style.background = 'none'
      style(this.button, noBorders)
      this.ctx.fillStyle = Theme.c
      this.ctx.shadowColor = null
      this.ctx.shadowBlur = 0
      this.ctx.shadowOffsetX = 0
      this.ctx.shadowOffsetY = 0
      this.draw()
    })

    this.cavnas = document.createElement('canvas')
    console.log('canvas', this.cavnas)
    this.ctx = this.cavnas.getContext('2d')

    if (this.dp) this.dp.on('resize', this.resize, this)

    if (this.icon) this.setIcon(this.icon)
  }

  public resize() {
    this.dpr = window.devicePixelRatio
    let height = this.size
    const glyph = font.fonts[this.icon]

    this.cavnas.height = height * this.dpr
    this.cavnas.style.height = height + 'px'

    const scale = this.size / font.unitsPerEm
    let width = glyph.advanceWidth * scale + 0.5 | 0

    width += 2
    height += 2

    this.cavnas.width = width * this.dpr
    this.cavnas.style.width = width + 'px'

    this.ctx.fillStyle = Theme.c
    this.draw()
  }

  public setSize(s: any) {
    this.size = s
    this.resize()
  }

  public setIcon(icon: string) {
    this.icon = icon

    if (font.fonts[icon]) {
      this.resize()
    }
  }

  public onLongHold(f: Function) {
    const startHold = (e: any) => {
      e.preventDefault()
      e.stopPropagation()

      this.onLongHoldTimer = setTimeout(() => {
        if (this.onLongHoldTimer) {
          f()
        }
      }, this.LONG_HOLD_DURATION)
    }

    const clearTimer = () => {
      clearTimeout(this.onLongHoldTimer)
    }

    this.button.addEventListener('mousedown', startHold)
    this.button.addEventListener('touchstart', startHold)
    this.button.addEventListener('mouseup', clearTimer)
    this.button.addEventListener('mouseout', clearTimer)
    this.button.addEventListener('touchend', clearTimer)
  }

  public setTip(tip: string) {
    this.tooltip = tip
  }

  public onClick(e: any) {
    this.button.addEventListener('click', e)
  }

  public draw() {
    if (!this.icon) return

    const glyph = font.fonts[this.icon]
    let height = this.size
    const dpr = window.devicePixelRatio
    const scale = height / font.unitsPerEm * dpr
    const commands = glyph.commands.split(' ')

    this.ctx.save()
    this.ctx.clearRect(0, 0, this.cavnas.width * dpr, this.cavnas.height * dpr)

    this.ctx.scale(scale, -scale)
    this.ctx.translate(0, -font.ascender)
    this.ctx.beginPath()

    for (var i = 0, il = commands.length; i < il; i++) {
			var cmds = commands[i].split(',');
			var params = cmds.slice(1);

			this.ctx[this.CMD_MAP[cmds[0]]].apply(this.ctx, params);
		}
		this.ctx.fill();
		this.ctx.restore();
  }

  get dom() {
    return this.button
  }
}
