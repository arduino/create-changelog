import * as exec from '@actions/exec'
import * as uuid from 'uuid'
import * as io from '@actions/io'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import {Git} from '../src/git'
import {Settings} from '../src/settings'

const testDir = path.join(os.tmpdir(), 'test-create-changelog')

async function runGit(args: string[], cwd: string) {
  const gitPath = await io.which('git', true)
  await exec.exec(`"${gitPath}"`, args, {cwd})
}

async function initTestRepo(): Promise<string> {
  const cwd = path.join(testDir, uuid.v4())
  await io.mkdirP(cwd)
  await runGit(['init', '.'], cwd)
  return cwd
}

async function createTag(tagName: string, cwd: string) {
  await runGit(['tag', tagName], cwd)
}

async function createAndCommitFile(name: string, message: string, cwd: string) {
  const file = path.join(cwd, name)
  fs.writeFile(file, 'data', () => {})
  await runGit(['add', '.'], cwd)
  await runGit(['commit', '-m', `${message}`], cwd)
}

describe('Git commands', () => {
  afterAll(() => {
    io.rmRF(testDir)
  })

  it('Verifies tag is returned if checked out on same commit', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('myTag', cwd)

    const tag = await g.currentTag()
    expect(tag).toEqual('myTag')
  })

  it('Verifies empty string is returned if no tag exists', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)

    const tag = await g.currentTag()
    expect(tag).toEqual('')
  })

  it('Verifies empty string is returned if current tag does not match regex', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.tagRegex = /[0-9]+\.[0-9]+\.[0-9]+.*/
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('myTag', cwd)

    const tag = await g.currentTag()
    expect(tag).toEqual('')
  })

  it('Verifies tag is returned if regex is matched', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.tagRegex = /[0-9]+\.[0-9]+\.[0-9]+.*/
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('0.0.1', cwd)

    const tag = await g.currentTag()
    expect(tag).toEqual('')
  })

  it('Verifies previous tag is returned', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.tagRegex = ''
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('0.0.1', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createTag('someTag', cwd)

    const tag = await g.previousTag('someTag')
    expect(tag).toEqual('0.0.1')
  })

  it('Verifies empty string is returned if no previous tag matches regex', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.tagRegex = /[0-9]+\.[0-9]+\.[0-9]+.*/
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('someTag', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createTag('0.0.1', cwd)

    const tag = await g.previousTag('0.0.1')
    expect(tag).toEqual('')
  })

  it('Verifies previous matching tag is found with invalid tag inbetween', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.tagRegex = /[0-9]+\.[0-9]+\.[0-9]+.*/
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('0.0.1', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createTag('someTag', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)
    await createTag('0.0.2', cwd)

    const tag = await g.previousTag('0.0.2')
    expect(tag).toEqual('0.0.1')
  })

  it('Verifies all commits are returned when no refs are specified', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)

    const log = await g.log('', '')
    expect(log).toHaveLength(3)
    expect(log[0].hash).toHaveLength(7)
    expect(log[0].message).toBe('Third commit')
    expect(log[1].hash).toHaveLength(7)
    expect(log[1].message).toBe('Second commit')
    expect(log[2].hash).toHaveLength(7)
    expect(log[2].message).toBe('First commit')
  })

  it('Verifies log if from ref is specified', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createTag('myTag', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)

    const log = await g.log('myTag', '')
    expect(log).toHaveLength(2)
    expect(log[0].hash).toHaveLength(7)
    expect(log[0].message).toBe('Third commit')
    expect(log[1].hash).toHaveLength(7)
    expect(log[1].message).toBe('Second commit')
  })

  it('Verifies log if to ref is specified', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createTag('myTag', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)

    const log = await g.log('', 'myTag')
    expect(log).toHaveLength(2)
    expect(log[0].hash).toHaveLength(7)
    expect(log[0].message).toBe('Second commit')
    expect(log[1].hash).toHaveLength(7)
    expect(log[1].message).toBe('First commit')
  })

  it('Verifies log with from and to refs specified', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createAndCommitFile('second', 'Second commit', cwd)
    await createTag('fromTag', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)
    await createAndCommitFile('fourth', 'Fourth commit', cwd)
    await createAndCommitFile('fifth', 'Fifth commit', cwd)
    await createTag('toTag', cwd)
    await createAndCommitFile('sixth', 'Sixth commit', cwd)

    const log = await g.log('fromTag', 'toTag')
    expect(log).toHaveLength(3)
    expect(log[0].hash).toHaveLength(7)
    expect(log[0].message).toBe('Fifth commit')
    expect(log[1].hash).toHaveLength(7)
    expect(log[1].message).toBe('Fourth commit')
    expect(log[2].hash).toHaveLength(7)
    expect(log[2].message).toBe('Third commit')
  })

  it('Verifies log does not contain commits matching regex', async () => {
    const cwd = await initTestRepo()

    const settings = {} as Settings
    settings.gitPath = await io.which('git', true)
    settings.repoPath = cwd
    settings.filterRegex = /^\[skip\].*/
    const g = new Git(settings)

    await createAndCommitFile('first', 'First commit', cwd)
    await createAndCommitFile('second', '[skip] Second commit', cwd)
    await createAndCommitFile('third', 'Third commit', cwd)
    await createAndCommitFile('fourth', 'Fourth commit', cwd)
    await createAndCommitFile('fifth', '[skip] Fifth commit', cwd)
    await createAndCommitFile('sixth', '[skip] Sixth commit', cwd)

    const log = await g.log('', '')
    expect(log).toHaveLength(3)
    expect(log[0].hash).toHaveLength(7)
    expect(log[0].message).toBe('Fourth commit')
    expect(log[1].hash).toHaveLength(7)
    expect(log[1].message).toBe('Third commit')
    expect(log[2].hash).toHaveLength(7)
    expect(log[2].message).toBe('First commit')
  })
})
