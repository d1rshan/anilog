import { edenTreaty } from '@elysiajs/eden'
import type { App } from '../../../server/src/index' // Import type from server

export const { api } = edenTreaty<App>('http://localhost:3000')


