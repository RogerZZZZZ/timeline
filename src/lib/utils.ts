import { ILayer } from '../IInterface'

export const style = function (element: HTMLElement, ...args: any[]) {
  for (let i = 0; i < args.length; i++) {
    const styles = args[i]
    for (const s in styles) {
      element.style[s] = styles[s]
    }
  }
}

export const proxyCtx = function(ctx?: CanvasRenderingContext2D) {
  // create a proxy 2d context wrapper to allow the fluent / chaining API
  if (ctx) {
    const wrapper: any = {}

    const proxyFunction = (c: any) => {
      return function() {
        ctx[c].apply(ctx, arguments)
        return wrapper
      }
    }

    const proxyProperty = (c: any) => {
      return function(v: any) {
        ctx[c] = v
        return wrapper
      }
    }

    wrapper.run = function(args: any) {
      args(wrapper)
      return wrapper
    }

    for (let c in ctx) {
      const type = typeof(ctx[c])
      switch(type) {
        case 'object':
          break
        case 'function':
          wrapper[c] = proxyFunction(c)
          break
        default:
          wrapper[c] = proxyProperty(c)
          break
      }
    }
    return wrapper
  } else {
    return {}
  }
}

export const formatTimeRuler = (s: number, type?: string) => {
  const raw_secs = s | 0
	const secs = raw_secs % 60
	const raw_mins = raw_secs / 60 | 0
	const mins = raw_mins % 60
	const secs_str = (secs / 100).toFixed(2).substring(2)

	let str = mins + ':' + secs_str

	if (s % 1 > 0) {
		const t2 = (s % 1) * 60
		if (type === 'frames') {
      str = secs + '+' + t2.toFixed(0) + 'f'
    } else {
      str += ((s % 1).toFixed(2)).substring(1)
    }
	}
	return str
}

export const findTimeInLayer = (layer: ILayer, time: number) => {
  const values = layer.timeStamps
  let i = 0
  for (; i < values.length; i++) {
    const value = values[i]
    if (value.startTime === time) {
      return {
        index: i,
        object: value,
      }
    } else if (value.startTime > time) {
      return i
    }
  }

  return i
}

export const timeAtLayer = (layer: ILayer, t: number) => {
	let values = layer.timeStamps;
	let i, il, entry, prev_entry;

	il = values.length;

	if (il === 0) return;
	if (layer._mute) return

	entry = values[0];
	if (t < entry.startTime) {
		return {
			value: entry.startTime,
			can_tween: false, // cannot tween
			keyframe: false // not on keyframe
		};
	}

	for (i=0; i<il; i++) {
		prev_entry = entry;
		entry = values[i];

		if (t === entry.startTime) {
			if (i === il - 1) {
				return {
					entry: prev_entry,
					tween: prev_entry.startTime,
					can_tween: il > 1,
					value: entry.startTime,
					keyframe: true
				};
			}
			return {
				entry: entry,
				can_tween: il > 1,
				keyframe: true // il > 1
			};
		}
		if (t < entry.startTime) {
			return {
				entry: prev_entry,
				can_tween: true,
				keyframe: false
			};
		}
	}
	return {
		can_tween: false,
		keyframe: false
	};
}

export const firstDefined = function(...args: any[]) {
  for (let i = 0; i < args.length; i++) {
    if (typeof arguments[i] !== 'undefined') {
      return arguments[i]
    }
  }
  return undefined
}

export const calculateDuration = (layers: ILayer[]) => {
  let max: number = 0
  for (let i = 0; i < layers.length; i++) {
    const times = layers[i].timeStamps
    for (let j = 0; j < times.length; j++) {
      const time = times[j]
      const end = time.startTime + time.duration
      max = max > end ? max : end
    }
  }
  return max
}
