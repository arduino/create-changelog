import * as core from '@actions/core'
import * as io from '@actions/io'
import {Settings} from './settings'

async function run(): Promise<void> {
  try {
    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = core.getInput('path') || '.'
    settings.tagRegex = core.getInput('tag-regex') || ''
    settings.filterRegex = core.getInput('filter-regex') || ''
    settings.changelogFilePath = core.getInput('changelog_file_path') || ''
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
