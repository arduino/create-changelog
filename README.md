# Create Changelog

[![Actions Status](https://github.com/arduino/create-changelog/workflows/Test%20Action/badge.svg)](https://github.com/arduino/create-changelog/actions)
[![Check Packaging status](https://github.com/arduino/create-changelog/actions/workflows/check-packaging-ncc-typescript-npm.yml/badge.svg)](https://github.com/arduino/create-changelog/actions/workflows/check-packaging-ncc-typescript-npm.yml)
[![Integration Tests status](https://github.com/arduino/create-changelog/actions/workflows/test-integration.yml/badge.svg)](https://github.com/arduino/create-changelog/actions/workflows/test-integration.yml)

This actions is an highly opinionated tool that creates changelogs from the git repository commit history.

If no property is set the changelog will be created from the current commit to the previous existing tag or the first commit.

## Usage

### Environment

#### Working directory

This action is meant to be launched inside a Git repository, thus the current `working-directory` must be set accordingly or it will fail.

#### Checkout depth

Because the changelog is generated from commit history, the action will not work as expected with a shallow fetch of the repository.
So the [`actions/checkout`](https://github.com/actions/checkout) action's default fetch depth of 1 is not suitable.
Set that action's [`fetch-depth` input](https://github.com/actions/checkout#fetch-all-history-for-all-tags-and-branches) to `0` to fetch the full commit history:

```yaml
      - name: Checkout repository
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Create Changelog
        uses: arduino/create-changelog@v1
```

### Inputs

The action accepts some properties:

- `tag-regex` to pick which tags are taken into consideration to create the changelog, the example below would ignore all tags except those matching it, `0.0.1` would be accepted but `v0.0.1` or `0.0.1-rc` would be ignored.
  By default any tag is used.

```
      - name: Create Changelog
        uses: arduino/create-changelog@v1
        with:
          tag-regex: '^[0-9]+\.[0-9]+\.[0-9]+$'
```

- `filter-regex` to skip certain commmits based on their message, the example below would skip all commits that start with the `[skip]` string.
  By default no commit is skipped.

```
      - name: Create Changelog
        uses: arduino/create-changelog@v1
        with:
          filter-regex: '^\[skip\].*'
```

- `changelog-file-path` to select the path and the name of the changelog file to be saved, the example below would save a `MyChangelog.md` file to the current `working-directory`.
  By default `CHANGELOG.md` is used.

```
      - name: Create Changelog
        uses: arduino/create-changelog@v1
        with:
          changelog-file-path: 'MyChangelog.md'
```

- `case-insensitive-regex` to make both `tag-regex` and `filter-regex` case insensitive, defaults to `false`.

```
      - name: Create Changelog
        uses: arduino/create-changelog@v1
        with:
          case-insensitive-regex: true
```

## Development workflow

### 1. Install tools

#### Node.js

[**npm**](https://www.npmjs.com/) is used for dependency management.

Follow the installation instructions here:<br />
https://nodejs.dev/download

### 2. Install dependencies

To work on the codebase you have to install all the dependencies:

```
npm install
```

### 3. Coding

Now you're ready to work some [TypeScript](https://www.typescriptlang.org/) magic!

Make sure to write or update tests for your work when appropriate.

### 4. Format code

Format the code to follow the standard style for the project:

```
npm run format
```

### 5. Run tests

To run tests:

```
npm run test
```

See the [official Github documentation][pat-docs] to know more about Personal Access Tokens.

### 6. Build

It is necessary to compile the code before it can be used by GitHub Actions. Remember to run these commands before committing any code changes:

```
npm run build
npm run pack
```

### 7. Commit

Everything is now ready to make your contribution to the project, so commit it to the repository and submit a pull request.

Thanks!

## Release workflow

Instructions for releasing a new version of the action:

1. If the release will increment the major version, update the action refs in the examples in `README.md` (e.g., `uses: arduino/arduino-lint-action@v1` -> `uses: arduino/arduino-lint-action@v2`).
1. Create a [GitHub release](https://docs.github.com/en/github/administering-a-repository/managing-releases-in-a-repository#creating-a-release), following the `vX.Y.Z` tag name convention. Make sure to follow [the SemVer specification](https://semver.org/).
1. Rebase the release branch for that major version (e.g., `v1` branch for the `v1.x.x` tags) on the tag. If no branch exists for the release's major version, create one.

[pat-docs]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/arduino/create-changelog/security/policy) and report the bug to our Security Team 🛡️
Thank you!

e-mail contact: security@arduino.cc
