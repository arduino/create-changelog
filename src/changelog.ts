import * as fs from 'fs'
import * as path from 'path'
import * as io from '@actions/io'
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
      io.mkdirP(changelogDir)
    }

    fs.writeFileSync(this.settings.changelogFilePath, lines.join('\n'))
  }
}
