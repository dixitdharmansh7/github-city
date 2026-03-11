// GitHub API integration for fetching user stats

const GITHUB_API_BASE = 'https://api.github.com';

// Fetch user profile data
export const fetchGitHubUser = async (username) => {
  try {
    const response = await fetch(`${GITHUB_API_BASE}/users/${username}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Try again later.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    throw error;
  }
};

// Fetch user repositories
export const fetchUserRepos = async (username, maxRepos = 100) => {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?per_page=${maxRepos}&sort=updated`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repos: ${response.status}`);
    }
    
    const repos = await response.json();
    return repos;
  } catch (error) {
    console.error('Error fetching repos:', error);
    return [];
  }
};

// Calculate stats from repos
export const calculateStatsFromRepos = (repos) => {
  if (!repos || repos.length === 0) {
    return {
      totalCommits: 0,
      totalStars: 0,
      primaryLanguage: 'Unknown'
    };
  }

  // Count stars
  const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
  
  // Estimate commits (GitHub doesn't provide total commits easily via API)
  // We'll use a heuristic based on repo size and activity
  let totalCommits = 0;
  const languageCounts = {};
  
  repos.forEach(repo => {
    // Estimate commits: size is in KB, roughly estimate 1 commit per 10KB
    const estimatedCommits = Math.max(1, Math.floor((repo.size || 0) / 10));
    totalCommits += estimatedCommits;
    
    // Track primary language
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  
  // Find primary language
  let primaryLanguage = 'Unknown';
  let maxCount = 0;
  
  Object.entries(languageCounts).forEach(([lang, count]) => {
    if (count > maxCount) {
      maxCount = count;
      primaryLanguage = lang;
    }
  });
  
  return {
    totalCommits,
    totalStars,
    primaryLanguage
  };
};

// Main function to get complete user data
export const getGitHubUserData = async (username) => {
  console.log('[GitHub API] Fetching data for:', username);
  
  const userProfile = await fetchGitHubUser(username);
  const repos = await fetchUserRepos(username);
  const repoStats = calculateStatsFromRepos(repos);
  
  // Build user data object matching our CSV format
  const today = new Date().toISOString().split('T')[0];
  const userData = {
    id: Date.now(), // Unique ID
    username: userProfile.login || username,
    repositories: userProfile.public_repos || repos.length || 0,
    commits: repoStats.totalCommits,
    stars: repoStats.totalStars || userProfile.public_gists || 0, // Fallback to gists
    followers: userProfile.followers || 0,
    primary_language: repoStats.primaryLanguage,
    last_updated: today,
    // Extra data for display
    avatar_url: userProfile.avatar_url,
    html_url: userProfile.html_url,
    bio: userProfile.bio,
    location: userProfile.location,
    company: userProfile.company
  };
  
  console.log('[GitHub API] Processed user data:', userData);
  return userData;
};

// Validate username format
export const isValidGitHubUsername = (username) => {
  // GitHub usernames: alphanumeric with hyphens, 1-39 chars
  const regex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  return regex.test(username);
};
