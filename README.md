# github-contributors
Analyze and archive GitHub repo contributors

# Usage

## Create a leaderboard of github contributors for all the repos of a user/org
(Contributor with highest # of contributions at the top)

Run `node contributors.js` from your terminal

This will
* Fetch data from Github APIs and prepare a leaderboard of all the contributors to (default "Git-Commit-Show" org) the user or org you mention in `contributors.js`
* Save the leaderboard in a csv file in the same folder

You will hit the API limits soon. To increase API limits, add GITHUB_PERSONAL_TOKEN in `contributors.js`
