import { resolve } from 'path'
import { createStorage } from 'unstorage'

export const storage = createStorage({
  driver: require('unstorage/drivers/fs')({ base: resolve(process.cwd(), '.cache') }),
})
