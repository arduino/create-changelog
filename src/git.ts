import * as exec from '@actions/exec'
import {Settings} from './settings'

export class Git {
  private settings: Settings

  constructor(settings: Settings) {
    this.settings = settings
  }

  async currentTag(): Promise<string> {
    const res = await this.execGit(['tag', '--points-at=HEAD'])

    if (!res.stdout.length) {
      // No current tag exists
      return ''
    }

    // In case there are multiple tags get the first valid version tag
    if (this.settings.tagRegex) {
      let foundTag = ''
      res.stdout.forEach(tag => {
        if (this.settings.tagRegex.test(tag)) {
          foundTag = tag
          return
        }
      })

      // Return either matched tag or none
      return foundTag
    }
    // Get the first tag we found if there's no tag regex
    return res.stdout[0]
  }

  async previousTag(tag: string): Promise<string> {
    const res = await this.execGit(['describe', '--tags', '--abbrev=0', `${tag}^`])

    if (res.exitCode != 0) {
      // No previous tag exists
      return ''
    }

    if (this.settings.tagRegex) {
      const foundTag = res.stdout[0]
      if (!this.settings.tagRegex.test(foundTag)) {
        // If previous tag doesn't match the regex keep searching back
        return this.previousTag(foundTag)
      }
    }

    // We either matched the regex or we didn't have one
    return res.stdout[0]
  }

  async log(from: string, to: string): Promise<GitCommit[]> {
    let args = ['log', '--pretty=oneline', '--abbrev-commit', '--no-decorate', '--no-color']
    let refs = ''
    if (from) {
      refs = `${from}..`
    }
    if (to) {
      refs = `${refs}${to}`
    }
    if (refs) {
      args.push(refs)
    }
    const res = await this.execGit(args)

    let commits: GitCommit[] = []
    res.stdout.forEach(commit => {
      const split = commit.split(' ')
      const hash = split[0]
      const message = split.slice(1).join(' ').trim()

      if (this.settings.filterRegex && this.settings.filterRegex.test(message)) {
        return
      }
      commits.push(new GitCommit(hash, message))
    })

    return commits
  }

  private async execGit(args: string[]): Promise<GitOutput> {
    const env = {}
    for (const key of Object.keys(process.env)) {
      env[key] = process.env[key]
    }

    const result = new GitOutput()
    const options = {
      cwd: process.cwd(),
      env,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          const lines = data.toString().trim().split(/\r?\n/)
          lines.forEach(line => {
            result.stdout.push(line.trim())
          })
        }
      }
    }
    result.exitCode = await exec.exec(`"${this.settings.gitPath}"`, args, options)
    return result
  }
}

class GitOutput {
  stdout: string[] = []
  exitCode = 0
}

export class GitCommit {
  hash: string = ''
  message: string = ''

  constructor(hash: string, message: string) {
    this.hash = hash
    this.message = message
  }
}
