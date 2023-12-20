/**
 * @file Functions to analyze and archive meaningful github data such as contributors
 * @example To archive contributors leaderboard data in csv file, run `node contributors.js`
 */

import { makeRequest, makeRequestWithRateLimit } from './network.js';
import * as archive from './archive.js';

// Configurations (Optional)
// Repo owner that you want to analyze
const REPO_OWNER = process.env.REPO_OWNER;
// Authentication using github token. When used, it will increase the API limits from 60 to 5000/hr
const GITHUB_PERSONAL_TOKEN = process.env.GITHUB_PERSONAL_TOKEN;
// END OF INPUTS

const GITHUB_REQUEST_OPTIONS = {
    headers: {
        "User-Agent": "gh-contributors",
        "Content-Type": "application/json"
    }
}

if(GITHUB_PERSONAL_TOKEN){
    GITHUB_REQUEST_OPTIONS.headers["Authorization"] = "token "+GITHUB_PERSONAL_TOKEN;
}


/**
 * Get details of a Github repo
 * @param {string} fullRepoNameOrUrl e.g. myorghandle/myreponame
 * @param {number} pageNo
 * @returns Promise<Array<Object> | String>
 * @example getRepoDetail('myorghandle/myreponame').then((repoDetail) => console.log(repoDetail)).catch((err) => console.log(err))
 */
export async function getRepoDetail(fullRepoNameOrUrl, pageNo = 1) {
    if(!fullRepoNameOrUrl) throw new Error("Invalid input")
    let fullRepoName = fullRepoNameOrUrl.match(/github\.com(?:\/repos)?\/([^\/]+\/[^\/]+)/)?.[1] || fullRepoNameOrUrl;
    let url = `https://api.github.com/repos/${fullRepoName}`;
    console.log(url);
    const { res, data } = await makeRequestWithRateLimit('GET', url, Object.assign({},GITHUB_REQUEST_OPTIONS));
    console.log("Repo detail request finished for " + fullRepoName)
    // console.log(data)
    let dataJson = JSON.parse(data);
    return dataJson;
}

/**
 * Get all github repos of an owner(user/org)
 * @param {string} owner The organization or user name on GitHub
 * @param {Object} options Additional options e.g. { pageNo: 1 }
 * @returns Promise<Array<Object> | String> JSON array of data on success, error on failure
 * @example getAllRepos('myorghandle').then((repos) => console.log(repos)).catch((err) => console.log(err))
 */
export async function getAllRepos(owner=REPO_OWNER, options) {
    let pageNo = (options && options.pageNo) ? options.pageNo : 1;
    if(options && options.GITHUB_PERSONAL_TOKEN){
        GITHUB_REQUEST_OPTIONS.headers["Authorization"] = "token "+options.GITHUB_PERSONAL_TOKEN;
    }
    let url = `https://api.github.com/orgs/${owner}/repos?per_page=100&page=${pageNo}`;
    const { res, data } = await makeRequestWithRateLimit('GET', url, Object.assign({},GITHUB_REQUEST_OPTIONS));
    console.log("Repo list request finished");
    console.log('HTTP status: ', res.statusCode);
    // console.log(data)
    let dataJsonArray = JSON.parse(data);
    if (dataJsonArray.length == 100) {
        //It might have more data on the next page
        pageNo++;
        try {
            let dataFromNextPage = await getAllRepos(owner, { pageNo: pageNo } );
            dataJsonArray.push(...dataFromNextPage);
        } catch (err) {
            console.log("No more pagination needed")
        }
    }
    return dataJsonArray;
}

/**
 * Get contributors for a Github repo
 * @param {string} fullRepoName e.g. myorghandle/myreponame
 * @param {number} pageNo
 * @returns Promise<Array<Object> | String>
 * @example getRepoContributors('myorghandle/myreponame').then((contributors) => console.log(contributors)).catch((err) => console.log(err))
 */
export async function getRepoContributors(fullRepoName, pageNo = 1) {
    let url = `https://api.github.com/repos/${fullRepoName}/contributors?per_page=100&page=${pageNo}`;
    console.log(url);
    const { res, data } = await makeRequestWithRateLimit('GET', url, Object.assign({},GITHUB_REQUEST_OPTIONS));
    console.log("Contributors request finished for " + fullRepoName)
    // console.log(data)
    let dataJsonArray = JSON.parse(data);
    if (dataJsonArray.length == 100) {
        //It might have more data on the next page
        pageNo++;
        try {
            let dataFromNextPage = await getRepoContributors(fullRepoName, pageNo);
            dataJsonArray.push(...dataFromNextPage);
        } catch (err) {
            console.log("No more pagination needed")
        }
    }
    return dataJsonArray;
}

/**
 * Get all contributors across all the repos of an owner
 * @param {string} owner github user or org handle
 * @param {Object} options Additional options
 */
export async function getAllContributors(owner=REPO_OWNER, options) {
    let repos = await getAllRepos(owner, options);
    if (!repos || repos.length < 1) {
        console.log("Error in getting repos for " + owner)
        throw ("Error in getting repos for " + owner)
    }
    console.log(repos.length + " " + owner + " repos found")
    // console.log(repos)
    let allContributors = [];
    for (let i = 0; i < repos.length - 1; i++) {
        if(repos[i].fork || repos[i].private) {
            // Exclude forks repos and private repos from the analysis
            console.log("Excluding "+repos[i].full_name);
            continue;
        }
        let c = await getRepoContributors(repos[i].full_name);
        // Add repo info in the contributor object 
        // so later we can use this info to discover repos that a contributor has contributed to
        c.forEach((item) => item.repo = repos[i].full_name);
        console.log(c.length + " contributors found for " + repos[i].full_name);
        if (c) allContributors.push(...c);
    }
    console.log("allContributors count without aggregation " + allContributors.length);
    // Remove duplicates in contributors list and sum total contributions for each contributor
    let finalListOfContributors = aggregateAllContributors(allContributors).sort(function (contributor1, contributor2) {
        // Sort the array in descending order of contributions
        return contributor2.contributions - contributor1.contributions
    })
    // Sort the repos field in order of descending contributions count
    finalListOfContributors.forEach((contributor) => {        
        contributor.repos = sortReposByContributionsCount(contributor.repos);
        contributor.topContributedRepo = contributor.repos[0].repo_full_name;
        contributor.allContributedRepos = contributor.repos.map((repoContributionMap) => repoContributionMap.repo_full_name).join(" | ")
    })
    console.log("finalListOfContributors count with aggregation" + finalListOfContributors.length);
    return finalListOfContributors;
}

/**
 * Adds up all the contributions by a contributor to different repos
 * @param {Array} contributors 
 */
function aggregateAllContributors(contributors) {
    return contributors.reduce(function (grouped, currentItem) {
        // Skipping the bots and other non individual user
        if (currentItem.type !== "User") {
            return grouped;
        }
        let found = false;
        grouped.forEach(function (contributor) {
            if (contributor.login == currentItem.login) {
                found = true;
                contributor.repos.push({ repo_full_name: currentItem.repo, contributions: currentItem.contributions });
                contributor.contributions += currentItem.contributions;
                console.log("Aggregated contributions of " + contributor.login + " - " + contributor.contributions);
            }
        })
        if (!found) {
            currentItem.repos = [{ repo_full_name: currentItem.repo, contributions: currentItem.contributions }];
            grouped.push(currentItem);
        }
        return grouped;
    }, [])
}

/**
 * Lists all the repos a contributor has contributed to sorted by # of contributions
 * @param {Array<Object>} repoContributionMappingArray e.g. [{ repo_full_name, contributions }]
 * @returns {String} e.g. orghandle/repo1,orghandle/repo2
 */
function sortReposByContributionsCount(repoContributionMappingArray){
    return repoContributionMappingArray.sort((repoContributionMapping1, repoContributionMapping2) => {
        return repoContributionMapping2.contributions - repoContributionMapping1.contributions
    })
}

/**
 * Writes all contributors data to a file
 * @param {Array} contributors List of contributors details with their contributions metrics
 * @param {Object} options
 * @param {string} options.archiveFolder where to save the final content
 * @param {string} options.archiveFileName the name of the archive file, the content will be appended if it exists already
 */
function writeContributorLeaderboardToFile(contributors, options={}) {
    if(!contributors || contributors.length<1){
        return;
    }
    // Prepare data
    let ghContributorLeaderboard = contributors.map((contributor) => {
        return ["@" + contributor.login, contributor.contributions, contributor.html_url, contributor.avatar_url, contributor.topContributedRepo, contributor.allContributedRepos].join();
    }).join("\n");
    ghContributorLeaderboard = "Github Username,Total Contributions,Profile,Avatar,Most Contribution To,Contributed To\n" + ghContributorLeaderboard;
    archive.writeToFile(ghContributorLeaderboard, Object.assign({ archiveFileName: 'archive-gh-contributors-leaderboard.csv' }, options));
}

/**
 * Archives contributors leaderboard data sorted by contrbutions in a file
 * @param {string} owner The organization or user name on GitHub
 * @param {Object} options Additional options
 */
export async function archiveContributorsLeaderboard(owner=REPO_OWNER, options) {
    let contributors = await getAllContributors(owner, options);
    if (!contributors || contributors.length < 1) {
        console.log("Failed to get contributors for "+owner);
        return;
    }

    // Summary - handles of contributors sorted by their contributions
    let ghHandles = contributors.map((contributor) => "@" + contributor.login)
    console.log(ghHandles.join(", "))

    // Write the complete leaderboard data to a file
    writeContributorLeaderboardToFile(contributors);

    return ghHandles;
}

/**
 * Search pull requests
 * @param {string} query 
 * @param {Object} [options] Additional options
 * @param {Object} [options.pageNo=1] Result page number
 */
export async function searchPullRequests(query, options) {
    let pageNo = (options && options.pageNo) ? options.pageNo : 1;
    if(options && options.GITHUB_PERSONAL_TOKEN){
        GITHUB_REQUEST_OPTIONS.headers["Authorization"] = "token "+options.GITHUB_PERSONAL_TOKEN;
    }
    let queryString = encodeURIComponent((query || ''))+'+is:pull-request';
    let url = `https://api.github.com/search/issues?q=${queryString}&per_page=100&page=${pageNo}&sort=${options.sort || 'created'}`;
    const { res, data } = await makeRequestWithRateLimit('GET', url, Object.assign({},GITHUB_REQUEST_OPTIONS));
    console.log("PR search request finished");
    console.log('HTTP status: ', res.statusCode);
    // console.log(data)
    let searchResultObject = JSON.parse(data);
    return searchResultObject;
}

/**
 * Get all PRs matching query
 * @param {string} query 
 * @param {Object} [options]
 * @param {Object} [options.maxResults=1000] limit maximum results
 */
export async function recursivelySearchPullRequests(query, options){
    let searchRequestOptions = Object.assign({ pageNo: 1, maxResults: 1000 }, options)
    let prList = [];
    let searchResultObject = await searchPullRequests(query, searchRequestOptions);
    // Iterate over results if there are more results expected by the user
    if(!searchResultObject || !searchResultObject.items || searchResultObject.items.length<1){
        return prList;
    }
    prList.push(...searchResultObject.items);
    while(prList.length < searchRequestOptions.maxResults && prList.length < searchResultObject.total_count){
        searchRequestOptions.pageNo++;
        try {
            let nextPageSearchResultObject = await searchPullRequests(query, searchRequestOptions);
            prList.push(...nextPageSearchResultObject.items);
        } catch (err) {
            console.log("Some issue in recursive search for pull requests");
            break;
        }
    }
    console.log("Found "+prList.length +" PRs"+" for "+query);
    return prList;
}


/**
 * Aggregates all pull requests based on a specified field
 * @param {Object[]} pullRequests - An array of pull request objects.
 * @param {string} aggregatorField - The field name used to aggregate the pull requests. Defaults to "repository_url".
 * @returns {Object[]} An array of objects, each containing a unique value of the aggregator field and an array of all pull requests that share that value.
 */
export function aggregateAllPullRequests(pullRequests, aggregatorField = "repository_url") {
    return pullRequests.reduce((grouped, currentItem) => {
        // Skipping the items without aggregatorField
        if (!currentItem[aggregatorField]) {
            return grouped;
        }
        // Find or create the group for the current item
        let group = grouped.find(g => g[aggregatorField] === currentItem[aggregatorField]);
        if (!group) {
            group = { [aggregatorField]: currentItem[aggregatorField], pull_requests: [] };
            grouped.push(group);
        }
        // Add the current item to the group
        group.pull_requests.push(currentItem);
        return grouped;
    }, []);
}

/**
 * Archives repos that PRs
 * @param {string} owner The organization or user name on GitHub
 * @param {Object} options Additional options
 */
export async function archiveReposWithMatchingPullRequests(query, options) {
    let pullRequests = await recursivelySearchPullRequests(query, options);
    if (!pullRequests || pullRequests.length < 1) {
        console.log("Failed to get PRs for query: "+query);
        return;
    }
    let repos = aggregateAllPullRequests(pullRequests, 'repository_url');
    if(!repos) throw new Error("No repo found");
    for(let repo of repos){
        let repoDetail = await getRepoDetail(repo['repository_url']);
        Object.assign(repo, repoDetail);
    }
    archive.save(repos, { archiveFileName: `repos-pr-${query}-${options.maxResults || 1000}-${archive.getFormattedDate()}.csv` });
    return repos;
}