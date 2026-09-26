import { getGithubUser, getGithubRepositories } from '../services/githubService.js';

// Charset sanity only. Whether a name exists is GitHub's call, so a too-long or
// unused name falls through to their 404 instead of being pre-rejected as 400.
const USERNAME_PATTERN = /^[a-zA-Z0-9-]{1,100}$/;

// GitHub reports rate limiting as 403 with x-ratelimit-remaining: 0 (and 429 on
// secondary limits), not 429 alone. Both collapse to our 429.
export async function getGithubProfile(req, res) {
  const { username } = req.params;

  if (!USERNAME_PATTERN.test(username)) {
    return res.status(400).json({ success: false, message: 'Invalid GitHub username' });
  }

  try {
    const profile = await getGithubUser(username);
    const repositories = await getGithubRepositories(username);

    res.status(200).json({
      success: true,
      profile: {
        username: profile.login,
        name: profile.name,
        avatar: profile.avatar_url,
        bio: profile.bio,
        followers: profile.followers,
        following: profile.following,
        publicRepos: profile.public_repos,
        profileUrl: profile.html_url,
      },
      repositories: repositories.map((repo) => ({
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        url: repo.html_url,
      })),
    });
  } catch (error) {
    const status = error.response?.status;
    const rateLimited =
      status === 429 || (status === 403 && error.response.headers['x-ratelimit-remaining'] === '0');

    if (status === 404) {
      return res.status(404).json({ success: false, message: 'GitHub user not found' });
    }
    if (rateLimited) {
      return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded' });
    }
    console.error(error.message);
    res.status(502).json({ success: false, message: 'Unable to fetch data from GitHub' });
  }
}
