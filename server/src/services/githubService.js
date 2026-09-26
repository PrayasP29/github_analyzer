import axios from 'axios';

const github = axios.create({
  baseURL: 'https://api.github.com',
  timeout: 10000,
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

if (process.env.GITHUB_TOKEN) {
  github.defaults.headers.common.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

export async function getGithubUser(username) {
  const { data } = await github.get(`/users/${username}`);
  return data;
}

// ponytail: no pagination, one page of 100 most-recently-updated repos.
// Add a Link-header cursor walk when a user needs their full repo list.
export async function getGithubRepositories(username) {
  const { data } = await github.get(`/users/${username}/repos`, {
    params: { per_page: 100, sort: 'updated' },
  });
  return data;
}
