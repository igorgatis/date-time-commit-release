const core = require('@actions/core');
const github = require('@actions/github');
const { generateTag } = require('./tag-generator');

async function run() {
  try {
    const commitRef = core.getInput('commit', { required: true });
    const githubToken = core.getInput('github-token', { required: true });
    const tagFormat = core.getInput('tag-format', { required: false }) ||
      '{YYYY}{MM}{DD}-{HH}{mm}{ss}-{sha:7}';
    const releaseNameTemplate = core.getInput('release-name', { required: false }) ||
      'Release {tag}';

    const octokit = github.getOctokit(githubToken);
    const { repo, owner } = github.context.repo;

    const { data: { commit, sha } } = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: commitRef
    });

    const commitDate = new Date(commit.committer.date);
    const isoDate = commitDate.toISOString();
    const tag = generateTag(commitDate, sha, tagFormat);

    try {
      await octokit.rest.repos.getReleaseByTag({
        owner,
        repo,
        tag: tag
      });
      core.setFailed(
        `Release with tag '${tag}' already exists.\n` +
        `This means the commit has already been released.`
      );
      return;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    const releaseName = releaseNameTemplate.replaceAll('{tag}', tag);

    let releaseNotes = (await octokit.rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name: tag,
      target_commitish: commitRef
    })).data.body || '';

    const maxLength = 124900;
    if (releaseNotes.length > maxLength) {
      releaseNotes = releaseNotes.substring(0, maxLength) +
        '\n\n... (truncated)';
    }

    await octokit.rest.repos.createRelease({
      owner,
      repo,
      tag_name: tag,
      name: releaseName,
      body: releaseNotes
    });

    const shortSha = sha.substring(0, 7);
    core.setOutput('tag', tag);
    core.setOutput('iso-date', isoDate);
    core.setOutput('short-sha', shortSha);
    core.setOutput('long-sha', sha);

    core.info(`Created release '${releaseName}' with tag '${tag}'`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
