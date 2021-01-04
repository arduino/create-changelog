import * as core from '@actions/core'
import * as io from '@actions/io'

export interface Settings {
  // Path to git executable
  gitPath: string
  // Regex to select git tags used as boundaries for the changelog
  tagRegex: RegExp
  // Regex to filter out commit messages from the changelog
  filterRegex: RegExp
  // Destination file of the generated changelog
  changelogFilePath: string
}

export async function initSettings(): Promise<Settings> {
  const settings = {} as Settings
  settings.gitPath = await io.which('git', true)
  const caseInsensitive = core.getInput('case-insensitive-regex')
  settings.tagRegex = RegExp(core.getInput('tag-regex'), caseInsensitive)
  settings.filterRegex = RegExp(core.getInput('filter-regex'), caseInsensitive)
  settings.changelogFilePath = core.getInput('changelog-file-path') || 'CHANGELOG.md'
  return settings
}
