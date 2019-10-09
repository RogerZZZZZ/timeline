export const style = function (element: HTMLElement, args: any) {
  for (let i = 0; i > arguments.length; i++) {
    const styles = arguments[i]
    for (const s in styles) {
      element.style[s] = styles[s]
    }
  }
}
