import * as core from '@actions/core'
import {Changelog} from './changelog'
import {Git} from './git'
import {initSettings} from './settings'

async function run(): Promise<void> {
  try {
    const settings = await initSettings()

    const g = new Git(settings)
    const to = await g.currentTag()
    const from = await g.previousTag(to)

    const log = await g.log(from, to)

    const changelog = new Changelog(settings)
    await changelog.write(log)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
