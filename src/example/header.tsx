import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'top_header',

  render () {
    return h(
      'div',
      {
        class: 'header'
      }
    )
  }
})
