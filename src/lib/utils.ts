import Tween from './tween'

export const style = function (element: HTMLElement, ...args: any) {
  for (let i = 0; i > arguments.length; i++) {
    const styles = arguments[i]
    for (const s in styles) {
      element.style[s] = styles[s]
    }
  }
}

export const proxyCtx = function(ctx?: CanvasRenderingContext2D) {
  // create a proxy 2d context wrapper to allow the fluent / chaining API

  const wrapper: any = {}

  const proxyFunction = (c: any) => {
    return ctx ? function() {
      ctx[c].apply(ctx, arguments)
      return wrapper
    }
    : function() {
      return wrapper
    }
  }

  const proxyProperty = (c: any) => {
    return ctx ? function(v: any) {
      ctx[c] = v
      return wrapper
    }
    : function() {
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

export const findTimeInLayer = (layer: any, time: number) => {
  const values = layer.values
  let i = 0
  for (; i < values.length; i++) {
    const value = values[i]
    if (value.time === time) {
      return {
        index: i,
        object: value,
      }
    } else if (value.time > time) {
      return i
    }
  }

  return i
}

export const timeAtLayer = (layer: any, t: number) => {
	// Find the value of layer at t seconds.
	// this expect layer to be sorted
	// not the most optimized for now, but would do.

	let values = layer.values;
	let i, il, entry, prev_entry;

	il = values.length;

	// can't do anything
	if (il === 0) return;

	if (layer._mute) return

	// find boundary cases
	entry = values[0];
	if (t < entry.time) {
		return {
			value: entry.value,
			can_tween: false, // cannot tween
			keyframe: false // not on keyframe
		};
	}

	for (i=0; i<il; i++) {
		prev_entry = entry;
		entry = values[i];

		if (t === entry.time) {
			// only exception is on the last KF, where we display tween from prev entry
			if (i === il - 1) {
				return {
					// index: i,
					entry: prev_entry,
					tween: prev_entry.tween,
					can_tween: il > 1,
					value: entry.value,
					keyframe: true
				};
			}
			return {
				// index: i,
				entry: entry,
				tween: entry.tween,
				can_tween: il > 1,
				value: entry.value,
				keyframe: true // il > 1
			};
		}
		if (t < entry.time) {
			// possibly a tween
			if (!prev_entry.tween) { // or if value is none
				return {
					value: prev_entry.value,
					tween: false,
					entry: prev_entry,
					can_tween: true,
					keyframe: false
				};
			}

			// calculate tween
			var time_diff = entry.time - prev_entry.time;
			var value_diff = entry.value - prev_entry.value;
			var tween = prev_entry.tween;

			var dt = t - prev_entry.time;
			var k = dt / time_diff;
			var new_value = prev_entry.value + Tween[tween](k) * value_diff;

			return {
				entry: prev_entry,
				value: new_value,
				tween: prev_entry.tween,
				can_tween: true,
				keyframe: false
			};
		}
	}
	// time is after all entries
	return {
		value: entry.value,
		can_tween: false,
		keyframe: false
	};
}

export const firstDefined = function(...args: any) {
  for (let i = 0; i < arguments.length; i++) {
    if (typeof arguments[i] !== 'undefined') {
      return arguments[i]
    }
  }
  return undefined
}
