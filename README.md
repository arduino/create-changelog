# Create Changelog

[![Actions Status](https://github.com/arduino/create-changelog/workflows/Test%20Action/badge.svg)](https://github.com/arduino/create-changelog/actions)

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
        uses: actions/checkout@v2
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

## Development

To work on the codebase you have to install all the dependencies:

```sh
# npm install
```

To run tests:

```sh
# npm run test
```

See the [official Github documentation][pat-docs] to know more about Personal Access Tokens.

## Release

1. `npm install` to add all the dependencies, included development.
2. `npm run build` to build the Action under the `./lib` folder.
3. `npm run test` to see everything works as expected.
4. `npm run pack` to package for distribution
5. `git add src dist` to check in the code that matters.
6. open a PR and request a review.

[pat-docs]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token

## Security

If you think you found a vulnerability or other security-related bug in this project, please read our
[security policy](https://github.com/arduino/create-changelog/security/policy) and report the bug to our Security Team 🛡️
Thank you!

e-mail contact: security@arduino.cc
