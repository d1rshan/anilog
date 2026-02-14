import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server/src/index'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, '') || 'http://localhost:3000'

export const { api } = treaty<App>(serverUrl, {
  fetch: {
    credentials: 'include' // This is crucial for sending cookies
  }
})

