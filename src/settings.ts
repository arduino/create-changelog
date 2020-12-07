import * as core from '@actions/core'
import * as io from '@actions/io'

export interface Settings {
  // Path to git executable
  gitPath: string
  // Regex to select git tags used as boundaries for the changelog
  tagRegex: string | RegExp
  // Regex to filter out commit messages from the changelog
  filterRegex: string | RegExp
  // Destination file of the generated changelog
  changelogFilePath: string
}

export async function initSettings(): Promise<Settings> {
  const settings = {} as Settings
  settings.gitPath = await io.which('git', true)
  settings.tagRegex = core.getInput('tag-regex') || ''
  settings.filterRegex = core.getInput('filter-regex') || ''
  settings.changelogFilePath = core.getInput('changelog-file-path') || 'CHANGELOG.md'
  return settings
}
