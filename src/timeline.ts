import DataStore from './lib/data-store'
import Dispatcher from './lib/dispatcher'
import TimelinePanel from './paint/panel'
import ScrollBar from './paint/scrollbar'
import Settings from './default'
import { findTimeInLayer } from './lib/utils'

class LayerProp {
  private name: string
  private values: any = []
  private _value = 0
  private _color: string

  constructor(name: string) {
    this.name = name
    this._color = `#${(Math.random() * 0xffffff | 0 ).toString(16)}`
  }
}

export default class TimeLine {
  private data: DataStore
  private dispatcher: Dispatcher
  private timelinePanel: TimelinePanel
  private layers: any
  private scrollBar: ScrollBar
  private startPlay: number | null
  private playedFrom: number

  constructor() {
    this.data = new DataStore()
    this.timelinePanel = new TimelinePanel(this.data, this.dispatcher)

    this.layers = this.data.get('layers').value

    this.dispatcher = this.initDispatcher()

    this.scrollBar = new ScrollBar(200, 100, this.dispatcher)
  }

  private initDispatcher() {
    const dispatcher = new Dispatcher()

    dispatcher.on('keyframe', (layer: any, value: any) => {
      const t = this.data.get('ui:currentTime').value
      const v = findTimeInLayer(layer, t)

      if (typeof(v) === 'number') {
        layer.values.splice(v, 0, {
          time: t,
          value: value,
          _color: '#' + (Math.random() * 0xffffff | 0).toString(16),
        })
      } else {
        layer.values.splice(v.index, 1)
      }
      this.repaintAll()
    })

    dispatcher.on('value.change', (layer: any, value: any, dontSize: boolean) => {
      if (layer._mute) return

      const t = this.data.get('ui:currentTime').value
      const v = findTimeInLayer(layer, t)

      if (typeof(v) === 'number') {
        layer.values.splice(v, 0, {
          time: t,
          value: value,
          _color: '#' + (Math.random() * 0xffffff | 0).toString(16)
        });
      } else {
        v.object.value = value
      }

      this.repaintAll()
    })

    dispatcher.on('action:solo', (layer: any, solo: any) => {
      layer._solo = solo;

      console.log(layer, solo);

      // When a track is solo-ed, playback only changes values
      // of that layer.
    });

    dispatcher.on('action:mute', (layer: any, mute: boolean) => {
      layer._mute = mute;

      // When a track is mute, playback does not play
      // frames of those muted layers.

      // also feels like hidden feature in photoshop

      // when values are updated, eg. from slider,
      // no tweens will be created.
      // we can decide also to "lock in" layers
      // no changes to tween will be made etc.
    });

    //TODO
    dispatcher.on('ease', (layer: any, ease_type: string) => {
      // var t = this.data.get('ui:currentTime').value;
      // var v = utils.timeAtLayer(layer, t);
      // if (v && v.entry) {
      //   v.entry.tween  = ease_type;
      // }

      // // undo_manager.save(new UndoState(data, 'Add Ease'));
      // this.repaintAll();
    });

    dispatcher.on('controls.toggle_play', () => {
      if (this.startPlay) {
        this.pausePlaying()
      } else {
        this.startPlaying()
      }
    })

    dispatcher.on('controls.restart_play', () => {
      if (!this.startPlay) {
        this.startPlaying()
      }

      this.setCurrentTime(this.playedFrom)
    })

    dispatcher.on('controls.play', this.startPlaying)
    dispatcher.on('controls.pause', this.pausePlaying)

    dispatcher.on('controls.stop', () => {
      if (this.startPlay !== null) this.pausePlaying()

      // layer_panel.setCon
    })

    dispatcher.on('time.update', this.setCurrentTime)

    dispatcher.on('update.scrollTime', (v: number) => {
      this.data.get('ui:scrollTime').value = Math.max(0, v)
      this.repaintAll()
    })

    dispatcher.on('target.notify', (name: string, value: any) => {
      // TODO target
    })

    dispatcher.on('update.scale', (v: any) => {
      this.data.get('ui:timeScale').value = v;

      this.timelinePanel.repaint();
    });

    return dispatcher
  }

  public setCurrentTime(value: number) {
    this.data.get('ui:currentTime').value = Math.max(0, value)

    if (this.startPlay) {
      this.startPlay = performance.now() - value * 1000
    }
    this.repaintAll()
  }

  public startPlaying() {
    this.startPlay = performance.now() - this.data.get('ui:currentTime').value * 1000

  }

  public pausePlaying() {
    this.startPlay = null
  }

  public repaintAll() {
    const contentHeight = this.layers.length * Settings.LINE_HEIGHT

  }

  public paint() {
    requestAnimationFrame(this.paint)

    if (this.startPlay) {
      const t = (performance.now() - this.startPlay) / 1000
      this.setCurrentTime(t)

      if (t > this.data.get('ui:totalTime').value) {
        this.startPlay = performance.now()
      }
    }

  }

  public addLayer(name: string) {
    const layer = new LayerProp(name)
    this.layers.push(layer)
    
  }
}

