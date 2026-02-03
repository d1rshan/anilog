import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server/src/index'

export const { api } = treaty<App>('http://localhost:3000', {
  fetch: {
    credentials: 'include' // This is crucial for sending cookies
  }
})


