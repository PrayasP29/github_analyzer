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

// Same host and token as the REST calls above, so this reuses `github` as-is
// rather than duplicating the Authorization header. Only the shape is new.
const CONTRIBUTION_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      login
      contributionsCollection(from: $from, to: $to) {
        startedAt
        endedAt
        contributionCalendar {
          totalContributions
          colors
          months {
            name
            year
            firstDay
            totalWeeks
          }
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
              color
              contributionLevel
              weekday
            }
          }
        }
      }
    }
  }
`;

// Carries the status and client-safe message across the service boundary so the
// controller stays free of GraphQL knowledge. Upstream bodies are never
// forwarded: they can echo request headers back.
const httpError = (status, publicMessage, cause) =>
  Object.assign(new Error(publicMessage, { cause }), { status, publicMessage });

// GraphQL reports failures with HTTP 200 and an `errors` array, and a missing
// user arrives as `user: null` *plus* a NOT_FOUND entry - so `user` is checked
// before `errors`, otherwise a missing user would surface as 502, not 404.
export async function getUserContributions(username) {
  if (!process.env.GITHUB_TOKEN) {
    throw httpError(500, 'GitHub integration is not configured');
  }

  const to = new Date();
  const from = new Date(to);
  from.setFullYear(from.getFullYear() - 1);

  let body;
  try {
    ({ data: body } = await github.post('/graphql', {
      query: CONTRIBUTION_QUERY,
      variables: { login: username, from: from.toISOString(), to: to.toISOString() },
    }));
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      throw httpError(502, 'GitHub rejected the server token', error);
    }
    if (status === 429 || (status === 403 && error.response?.headers['x-ratelimit-remaining'] === '0')) {
      throw httpError(429, 'GitHub API rate limit exceeded', error);
    }
    throw httpError(502, 'Unable to fetch data from GitHub', error);
  }

  if (!body?.data?.user) {
    throw httpError(404, 'GitHub user not found');
  }
  if (body.errors?.[0]?.type === 'RATE_LIMITED') {
    throw httpError(429, 'GitHub API rate limit exceeded');
  }
  if (body.errors?.length) {
    throw httpError(502, 'GitHub API request failed');
  }

  const { login, contributionsCollection } = body.data.user;
  const { startedAt, endedAt, contributionCalendar } = contributionsCollection;
  return {
    username: login,
    startedAt,
    endedAt,
    calendar: {
      totalContributions: contributionCalendar.totalContributions,
      colors: contributionCalendar.colors,
      months: contributionCalendar.months,
      weeks: contributionCalendar.weeks.map((week) => ({
        firstDay: week.firstDay,
        contributionDays: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          color: day.color,
          level: day.contributionLevel,
          weekday: day.weekday,
        })),
      })),
    },
  };
}
