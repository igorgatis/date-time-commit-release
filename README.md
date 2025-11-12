# Date-Time Commit Release

A GitHub Action that creates releases with tags based on commit date and SHA.
The default tag format is: `YYYYMMDD-HHMMSS-shortsha` (e.g.,
`20240426-143045-e4f36cb`), but can be customized using format tokens.

## Why Use This Action?

This action solves the problem of creating unique, chronological release tags
without manual versioning. It's particularly useful for:

- Continuous deployment workflows
- Automatic releases on commit
- Time-based release tracking
- Avoiding version number conflicts

## Features

- Generates unique tags based on commit timestamp and SHA
- Customizable tag format with date/time/SHA tokens
- Automatically creates GitHub releases
- Generates release notes from commits
- Prevents duplicate releases for the same commit
- No manual version management needed
- Supports semver-compatible tag formats

## Usage

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      commit:
        description: "Commit to release"
        required: false
        default: "main"

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - name: Create release
        uses: igorgatis/date-time-commit-release@v2
        with:
          commit: ${{ inputs.commit }}
```

## Permissions

The workflow needs `contents: write` permission to create releases:

```yaml
permissions:
  contents: write
```

## Inputs

| Input          | Description                                     | Required | Default                                   |
| -------------- | ----------------------------------------------- | -------- | ----------------------------------------- |
| `commit`       | Commit reference (branch, tag, or hash)         | Yes      | -                                         |
| `github-token` | GitHub token for API access                     | No       | `${{ github.token }}`                     |
| `tag-format`   | Tag format template (see tokens below)          | No       | `{YYYY}{MM}{DD}-{HH}{mm}{ss}-{sha:8}`    |
| `release-name` | Release name template (use `{tag}` placeholder) | No       | `Release {tag}`                           |

## Outputs

| Output      | Description                              |
| ----------- | ---------------------------------------- |
| `tag`       | The generated release tag                |
| `iso-date`  | The commit date in ISO 8601 format (UTC) |
| `short-sha` | The short commit SHA (7 characters)      |

### Tag Format

The default tag format is: `{YYYY}{MM}{DD}-{HH}{mm}{ss}-{sha:8}`

You can customize the format using the `tag-format` input with the following tokens:

**Year:**
- `{YYYY}` - 4-digit year (e.g., `2025`)
- `{YY}` - 2-digit year (e.g., `25`)

**Month:**
- `{MM}` - 2-digit month with leading zero (e.g., `01`, `11`)
- `{M}` - month without leading zero (e.g., `1`, `11`)

**Day:**
- `{DD}` - 2-digit day with leading zero (e.g., `05`, `12`)
- `{D}` - day without leading zero (e.g., `5`, `12`)

**Hour:**
- `{HH}` - 2-digit hour with leading zero (e.g., `08`, `15`)
- `{H}` - hour without leading zero (e.g., `8`, `15`)

**Minute:**
- `{mm}` - 2-digit minute with leading zero (e.g., `04`, `30`)
- `{m}` - minute without leading zero (e.g., `4`, `30`)

**Second:**
- `{ss}` - 2-digit second with leading zero (e.g., `01`, `45`)
- `{s}` - second without leading zero (e.g., `1`, `45`)

**Commit SHA:**
- `{sha}` - full commit SHA
- `{sha:N}` - first N characters of SHA (e.g., `{sha:8}`)

All timestamps are in **UTC timezone**, regardless of the commit's original timezone.

#### Example

Given this git log output:

```
$ git log -1 --format=fuller main
commit e4f36cb1e382e2779d3609c1336bdbe7cfb0902c
Author:     John Doe <john@example.com>
AuthorDate: Fri Apr 26 09:30:45 2024 -0400
Commit:     Jane Smith <jane@example.com>
CommitDate: Fri Apr 26 14:30:45 2024 +0000

    Add new feature
```

The action uses the **CommitDate** (`2024-04-26T14:30:45Z`) and **commit SHA** to generate tags:

| Format | Result |
|--------|--------|
| `{YYYY}{MM}{DD}-{HH}{mm}{ss}-{sha:8}` (default) | `20240426-143045-e4f36cb` |
| `v{YYYY}.{M}.{D}` | `v2024.4.26` |
| `{YY}.{MM}.{DD}-{sha:7}` | `24.04.26-e4f36cb` |
| `release-{YYYY}{MM}{DD}{HH}{mm}` | `release-202404261430` |

## Examples

### Basic Usage with Custom Tag Format

```yaml
- name: Create release with custom tag format
  uses: igorgatis/date-time-commit-release@v2
  with:
    commit: main
    tag-format: "v{YYYY}.{MM}.{DD}-{sha:7}"
```

### Semver-Compatible Format

This example creates tags compatible with [Semantic Versioning](https://semver.org/).
You can verify the format using the [semver checker](https://jubianchi.github.io/semver-check/).

```yaml
- name: Create semver-compatible release
  uses: igorgatis/date-time-commit-release@v2
  with:
    commit: main
    tag-format: "{YYYY}.{M}.{D}"
```

This generates tags like `2024.4.26`, which are valid semver versions where:
- Major version = year (e.g., `2024`)
- Minor version = month (e.g., `4`)
- Patch version = day (e.g., `26`)

### Compact Format

```yaml
- name: Create release with compact format
  uses: igorgatis/date-time-commit-release@v2
  with:
    commit: main
    tag-format: "{YY}{MM}{DD}-{HH}{mm}-{sha:6}"
    release-name: "Build {tag}"
```

This generates tags like `240426-1430-e4f36c` for more compact identifiers.

## Example: Custom Release Name and Using Outputs in Another Job

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    outputs:
      tag: ${{ steps.create-release.outputs.tag }}
      iso-date: ${{ steps.create-release.outputs.iso-date }}
      short-sha: ${{ steps.create-release.outputs.short-sha }}
    steps:
      - name: Create release
        id: create-release
        uses: igorgatis/date-time-commit-release@v2
        with:
          commit: main
          release-name: "Production Release {tag}"

  deploy:
    needs: release
    runs-on: ubuntu-latest
    steps:
      - name: Deploy release
        run: |
          echo "Deploying ${{ needs.release.outputs.tag }}"
          echo "Commit date: ${{ needs.release.outputs.iso-date }}"
          echo "Commit SHA: ${{ needs.release.outputs.short-sha }}"
```

## How It Works

1. Fetches the commit information for the specified reference
2. Extracts the commit date and formats it as `YYYYMMDD-HHMMSS` (uses commit
   date, not author date, in UTC)
3. Appends the first 7 characters of the commit SHA
4. Checks if a release with this tag already exists (fails if it does)
5. Generates release notes from commits (since last tag or all commits if no
   previous tags)
6. Creates a new GitHub release with the generated tag

Note: Release notes are automatically truncated to 125KB if they exceed this
size.

## Error Handling

The action will fail if:

- The commit reference doesn't exist
- A release with the generated tag already exists
- The GitHub token doesn't have sufficient permissions

## License

MIT License - see [LICENSE](LICENSE) for details
