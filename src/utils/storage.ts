import { resolve } from 'node:path'
import process from 'node:process'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'

export const storage = createStorage({
  driver: fsDriver({ base: resolve(process.cwd(), '.cache') }),
})
