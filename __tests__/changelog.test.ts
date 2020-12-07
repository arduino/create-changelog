import * as io from '@actions/io'
import * as path from 'path'
import * as fs from 'fs'
import {Settings} from '../src/settings'
import {Changelog} from '../src/changelog'
import {GitCommit} from '../src/git'
import {TEST_DIR} from './common'

describe('Changelog', () => {
  afterAll(() => {
    io.rmRF(TEST_DIR)
  })

  it('Verifies changelog is saved to file', async () => {
    const settings = {} as Settings
    settings.changelogFilePath = path.join(TEST_DIR, 'CHANGELOG.md')

    // Verifies path doesn't exists
    expect(fs.existsSync(TEST_DIR)).toBe(false)

    const gitLog: GitCommit[] = [
      new GitCommit('295b513', 'Third commit'),
      new GitCommit('0dad212', 'Second commit'),
      new GitCommit('80913ba', 'First commit')
    ]
    const changelog = new Changelog(settings)
    changelog.write(gitLog)

    // Read created CHANGELOG.md
    const fileContent: string = fs.readFileSync(settings.changelogFilePath).toString()

    const expectedFileContent: string = [
      '# Changelog',
      '295b513 Third commit',
      '0dad212 Second commit',
      '80913ba First commit'
    ].join('\n')

    // Verifies file is created and contains expected data
    expect(fs.existsSync(settings.changelogFilePath)).toBe(true)
    expect(fileContent).toEqual(expectedFileContent)
  })
})
