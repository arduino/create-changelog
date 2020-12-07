import * as core from '@actions/core'
import * as io from '@actions/io'

export interface Settings {
  // TODO: DOCS
  gitPath: string
  repoPath: string
  tagRegex: string | RegExp
  filterRegex: string | RegExp
  changelogFilePath: string
}

export async function initSettings(): Promise<Settings> {
  const settings = {} as Settings
  settings.gitPath = await io.which('git', true)
  settings.repoPath = core.getInput('path') || '.'
  settings.tagRegex = core.getInput('tag-regex') || ''
  settings.filterRegex = core.getInput('filter-regex') || ''
  settings.changelogFilePath = core.getInput('changelog-file-path') || 'CHANGELOG.md'
  return settings
}
