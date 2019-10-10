export const style = function (element: HTMLElement, args: any) {
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
