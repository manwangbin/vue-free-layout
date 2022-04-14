
/**
 * 获取制定控件的大小和屏幕坐标信息, 页面在渲染过程中数据不断改变，所以不停获取信息直到数据稳定。
 *
 * @param element
 * @returns
 */
export function getClientRect (element: HTMLElement): Promise<{ x: number, y: number, width: number, height: number }> {
  return new Promise((resolve, reject) => {
    if (element) {
      let number = 0
      let value = element.getBoundingClientRect()
      const interval = setInterval(() => {
        const cvalue = element.getBoundingClientRect()
        if (cvalue.x === value.x && cvalue.y === value.y && cvalue.width === value.width && cvalue.height === value.height) {
          number += 1
          if (number > 8) {
            clearInterval(interval)
            resolve(cvalue)
          }
        } else {
          number = 0
        }
        value = cvalue
      }, 40)
    } else {
      reject(new Error('element must not be null'))
    }
  })
}
