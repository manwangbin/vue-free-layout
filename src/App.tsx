import { defineComponent } from '@vue/runtime-core'
import { Ref, ref, watch } from 'vue'
import { Widget } from './types'
import Example from './example/example'

export default defineComponent({
  components: {
    Example
  },

  setup () {
    return () => (
      <Example/>
    )
  }
})
