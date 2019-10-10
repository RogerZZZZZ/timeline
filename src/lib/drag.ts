export default (
  element: HTMLElement,
  onDown: Function,
  onMove: Function,
  onUp: Function,
  criteria?: any) => {
    let pointer: any = null
    let bounds = element.getBoundingClientRect()

    const onMouseDown = (e: any) => {
      handleStart(e)

      if (criteria && !criteria(pointer)) {
        pointer = null
        return
      }

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      onDown(pointer)
      e.preventDefault()
    }

    const onMouseMove = (e: any) => {
      handleMove(e)
      onMove(pointer)
    }

    const onMouseUp = (e: any) => {
      handleMove(e)
      onUp(pointer)
      pointer = null

      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    const handleStart = (e: any) => {
      bounds = element.getBoundingClientRect()
      const currentX = e.clientX
      const currentY = e.clientY
      pointer = {
        startx: currentX,
        starty: currentY,
        x: currentX,
        y: currentY,
        dx: 0,
        dy: 0,
        offsetx: currentX - bounds.left,
        offsety: currentY - bounds.top,
        moved: false,
      }
    }

    const handleMove = (e: any) => {
      bounds = element.getBoundingClientRect()
      const currentX = e.clientX
      const currentY = e.clientY
      pointer = {
        x: currentX,
        y: currentY,
        startx: pointer.startx,
        starty: pointer.starty,
        dx: currentX - pointer.startx,
        dy: currentY - pointer.starty,
        offsetx: currentX - bounds.left,
        offsety: currentY - bounds.top,
        moved: pointer.move || pointer.dx !== 0 || pointer.dy !== 0,
      }
    }

    const onTouchStart = (te: any) => {
      if (te.touches.length === 1) {
        const e = te.touches[0]
        if (criteria && !criteria(e)) return
        te.preventDefault()
        handleStart(e)
        onDown(pointer)
      }

      element.addEventListener('touchmove', onTouchMove)
      element.addEventListener('touchend', onTouchEnd)
    }

    const onTouchMove = (te: any) => {
      const e = te.touches[0]
      onMouseMove(e)
    }

    const onTouchEnd = (e: any) => {
      onMouseUp(e)
      element.removeEventListener('touchmove', onTouchMove)
      element.removeEventListener('touchend', onTouchEnd)
    }

    element.addEventListener('mousedown', onMouseDown)
    element.addEventListener('touchstart', onTouchStart)
  }
