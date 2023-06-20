import Browser from "./browser";

interface Option{
  domId: string,
  width: number,
  height: number
}

export function printHTML({domId,width,height}: Option){
  let canvas = document.getElementById(domId)!
  if(!canvas) {
    console.error('canvas is '+ canvas);
    return
  }
  canvas = cloneElement(canvas)
  canvas.style.left = '0'
  canvas.style.top = '0'
  canvas.style.overflow = 'hidden'

  const iframe = document.createElement('iframe')
  iframe.setAttribute('id', 'free-layout-iframe')
  iframe.style.display = 'none'
  iframe.style.width = width + 'px'
  iframe.style.height = height + 'px'
  iframe.style.border='none'

  document.body.appendChild(iframe)
  iframe.onload = ()=>{
    iframe.contentWindow!.document.body.appendChild(canvas)
    const style = document.createElement('style')
    style.innerText = `
    html,body {
      padding: 0;
      margin:0;
    }
    #drawer{
      position: relative;
      overflow: hidden;
    }
    .drag_container{
      position: absolute;
    }
    `
    iframe.contentWindow!.document.body.appendChild(style)
    performPrint(iframe)
  }

}

function performPrint (iframeElement: any) {
  try {
    iframeElement.focus()

    // If Edge or IE, try catch with execCommand
    if (Browser.isEdge() || Browser.isIE()) {
      try {
        iframeElement.contentWindow.document.execCommand('print', false, null)
      } catch (e) {
        iframeElement.contentWindow.print()
      }
    } else {
      // Other browsers
      iframeElement.contentWindow.print()
    }
  } catch (error) {
    console.error(error);
  } finally {
    if (Browser.isFirefox()) {
      // Move the iframe element off-screen and make it invisible
      iframeElement.style.visibility = 'hidden'
      iframeElement.style.left = '-1px'
    }

    cleanUp()
  }
}

function cleanUp () {

  // Run onPrintDialogClose callback
  let event = 'mouseover'

  if (Browser.isChrome() || Browser.isFirefox()) {
    // Ps.: Firefox will require an extra click in the document to fire the focus event.
    event = 'focus'
  }

  const handler = () => {
    // Make sure the event only happens once.
    window.removeEventListener(event, handler)

    // Remove iframe from the DOM
    const iframe = document.getElementById('free-layout-iframe')

    if (iframe) {
      iframe.remove()
    }
  }

  window.addEventListener(event, handler)
}

function cloneElement (element: any) {
  // Clone the main node (if not already inside the recursion process)
  const clone = element.cloneNode()

  // Loop over and process the children elements / nodes (including text nodes)
  const childNodesArray = Array.prototype.slice.call(element.childNodes)
  for (let i = 0; i < childNodesArray.length; i++) {
    const clonedChild = cloneElement(childNodesArray[i])

    // Attach the cloned child to the cloned parent node
    clone.appendChild(clonedChild)
  }
  // Check if the element needs any state processing (copy user input data)
  switch (element.tagName) {
    case 'SELECT':
      // Copy the current selection value to its clone
      clone.value = element.value
      break
    case 'CANVAS':
      // Copy the canvas content to its clone
      clone.getContext('2d').drawImage(element, 0, 0)
      break
  }

  return clone
}
