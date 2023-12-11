# open-community-kit
Tools and stats for open-source communities

![test](https://github.com/Invide-Labs/invide-gpt/actions/workflows/test.yml/badge.svg)

# Installation

```
npm install -g open-community-kit
```

You can use npx as well if you just want to test a CLI command

# Usage

## Create a leaderboard of github contributors for all the repos of a user/org
(Contributor with highest # of contributions at the top)

### Using CLI

Run `open-community-kit yourGithubOrgName` from your terminal

Note: You can also use the shorthand `ock` in place of `open-commmunity-kit` i.e.

```
ock yourGitHubOrgName
```

This will
* Fetch data from Github APIs and prepare a leaderboard of all the contributors to public repositories of your GitHub organization/user accout
* Save the leaderboard in a csv file in the same folder

You will hit the API limits soon. **To increase API limits**, add [`GITHUB_PERSONAL_TOKEN`](https://github.com/settings/tokens) as well in the arguments i.e.

```
ock yourGitHubOrgName yourGitHubPersonalToken
```

### Using code

```javascript
const OCK = require('open-community-kit').OCK;
OCK.contributors.github.archive('your_github_org_or_username', 
    { GITHUB_PERSONAL_TOKEN: 'your_gh_personal_token_optional'
});
```

## Settings for repeated usage

If you are going to use this command frequently, you might not want to set organization name and personal token again and again. Instead, you can set following environment variables and then you don't need to pass those variables as CLI arguments or function parameters

```
# Set these variables in the environment to avoid repeatedly specifying these variables
1. REPO_OWNER
2. GITHUB_PERSONAL_TOKEN
```