import * as fs from 'fs'
import * as path from 'path'
import {Settings} from './settings'
import {GitCommit} from './git'

export class Changelog {
  private settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  write(log: GitCommit[]) {
    let lines: string[] = ['# Changelog']

    log.forEach(c => {
      lines.push(`${c.hash} ${c.message}`)
    })

    const changelogDir: string = path.parse(this.settings.changelogFilePath).dir
    if (!fs.existsSync(changelogDir)) {
      fs.mkdirSync(changelogDir)
    }

    fs.writeFileSync(this.settings.changelogFilePath, lines.join('\n'))
  }
}
