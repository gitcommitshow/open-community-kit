import { expect, assert } from "chai";
import * as githubApi from "../github.js";

import * as contributorsFixture from './fixtures/contributors.fixture.js';
import * as pullRequestsFixture from './fixtures/pullRequests.fixture.js';

describe('github.js', function() {

    /** GitHub contrbutors test --START-- */

    describe.skip('#getAllRepos('+contributorsFixture.VALID_REPO_OWNER+');', async function() {
      it('should return the repos owned by '+contributorsFixture.VALID_REPO_OWNER, async function() {
        this.timeout(100000);
        let repos = await githubApi.getAllRepos(contributorsFixture.VALID_REPO_OWNER);
        assert.isNotNull(repos);
        expect(repos).to.be.an('array', 'Not an array')
        expect(repos.length).to.be.greaterThanOrEqual(contributorsFixture.REPO_COUNT_MIN);
        expect(repos[0]).to.include.all.keys('id', 'name', 'full_name', 'owner', 'private', 'html_url');
      })
    })

    describe.skip('#getRepoContributors('+contributorsFixture.VALID_REPO+');', async function() {
        it('should return the repo contribuors', async function() {
          this.timeout(100000);
          let contributors = await githubApi.getRepoContributors(contributorsFixture.VALID_REPO)
          assert.isNotNull(contributors);
          expect(contributors).to.be.an('array', 'Not an array')
          expect(contributors.length).to.be.greaterThanOrEqual(contributorsFixture.REPO_CONTRIBUTOR_COUNT_MIN);
          expect(contributors[0]).to.include.all.keys('login','id','node_id','avatar_url','gravatar_id','url','html_url','followers_url','following_url','gists_url','starred_url','subscriptions_url','organizations_url','repos_url','events_url','received_events_url','type','site_admin','contributions');
        })
    })

    describe.skip('#getAllContributors('+contributorsFixture.VALID_REPO_OWNER+');', async function() {
        it('should return all contributors across different repositories of REPO_OWNER', async function() {
          this.timeout(100000);
          let contributors = await githubApi.getAllContributors(pullRequestsFixture.QUERY);
          assert.isNotNull(contributors);
          expect(contributors).to.be.an('array', 'Not an array')
          expect(contributors.length).to.be.greaterThanOrEqual(contributorsFixture.ALL_REPO_CONTRIBUTOR_COUNT_MIN);
          expect(contributors[0]).to.include.all.keys('login','id','node_id','avatar_url','gravatar_id','url','html_url','followers_url','following_url','gists_url','starred_url','subscriptions_url','organizations_url','repos_url','events_url','received_events_url','type','site_admin','contributions');
        })
    })

    // PR search test
    describe.skip('#searchPullRequests(query);', async function() {
      it('should return the PRs matching query; only the first page;', async function() {
        this.timeout(100000);
        let prSearchResults = await githubApi.searchPullRequests(pullRequestsFixture.PR_SEARCH_QUERY);
        assert.isNotNull(prSearchResults, "No PR search results returned");
        expect(prSearchResults).to.be.an('object');
        expect(prSearchResults).to.have.all.keys('items', 'total_count', 'incomplete_results');
        expect(prSearchResults.items).to.be.an('array');
        expect(prSearchResults.items).to.have.lengthOf.at.least(1);
        expect(prSearchResults.items[0]).to.include.all.keys('title', 'html_url', 'state', 'user', 'draft', 'repository_url', 'comments', 'comments_url', 'assignees', 'created_at', 'closed_at');
      })
    })

    // Recursive PR search test
    describe.skip('#recursivelySearchPullRequests(query, { maxResults: 198 });', async function() {
      it('should return PRs list; return <200 results;', async function() {
        this.timeout(100000);
        let prResults = await githubApi.recursivelySearchPullRequests("test", { maxResults: 198});
        assert.isNotNull(prResults, "No PR search results returned");
        expect(prResults).to.be.an('array');
        expect(prResults).to.have.lengthOf.at.least(100);
        expect(prResults).to.have.lengthOf.at.most(200);
        expect(prResults[0]).to.include.all.keys('title', 'html_url', 'state', 'user', 'draft', 'repository_url', 'comments', 'comments_url', 'assignees', 'created_at', 'closed_at');
      })
    })

    // PR aggregation test
    describe.skip('#aggregateAllPullRequests(pullRequests, "repository_url");', async function() {
      it('should group results by repository_url', async function() {
        this.timeout(100000);
        let groupedPRs = await githubApi.aggregateAllPullRequests(pullRequestsFixture.VALID_PR_SEARCH_RESULT_ITEMS);
        assert.isNotNull(groupedPRs, "No PR results to group");
        expect(groupedPRs).to.be.an('array');
        expect(groupedPRs).to.have.lengthOf.lessThan(pullRequestsFixture.VALID_PR_SEARCH_RESULT_ITEMS.length);
        expect(groupedPRs[0]).to.have.keys('repository_url', 'pull_requests');
      })
    })

    // Get repo detail
    describe.skip('#getRepoDetail("gitcommitshow/open-community-kit");', async function() {
      it('should return repo details', async function() {
        this.timeout(100000);
        let repoDetail = await githubApi.getRepoDetail("gitcommitshow/open-community-kit");
        assert.isNotNull(repoDetail, "Repo detail not returned");
        expect(repoDetail).to.be.an('object');
        expect(repoDetail).to.include.all.keys('name', 'full_name', 'html_url', 'owner','description','stargazers_count', 'watchers_count', 'forks_count', 'open_issues_count', 'is_template', 'topics', 'archived', 'private', 'license');
      })
    })

    describe.skip('#getRepoDetail("https://api.github.com/repos/gitcommitshow/open-community-kit");', async function() {
      it('should return repo details', async function() {
        this.timeout(100000);
        let repoDetail = await githubApi.getRepoDetail("https://api.github.com/repos/gitcommitshow/open-community-kit");
        assert.isNotNull(repoDetail, "Repo detail not returned");
        expect(repoDetail).to.be.an('object');
        expect(repoDetail).to.include.all.keys('name', 'full_name', 'html_url', 'owner','description','stargazers_count', 'watchers_count', 'forks_count', 'open_issues_count', 'is_template', 'topics', 'archived', 'private', 'license');
      })
    })

    describe('#archiveReposWithMatchingPullRequests('+pullRequestsFixture.PR_SEARCH_QUERY+', {maxResults: '+pullRequestsFixture.PR_SEARCH_MAX_RESULTS+'});', async function() {
      it('should fetch and save repos with matching PR to a csv file', async function() {
        this.timeout(100000);
        let repos = await githubApi.archiveReposWithMatchingPullRequests(pullRequestsFixture.PR_SEARCH_QUERY, { maxResults: pullRequestsFixture.PR_SEARCH_MAX_RESULTS });
        assert.isNotNull(repos, "Repos not returned");
        expect(repos).to.be.an('array');
        expect(repos).to.have.lengthOf.lessThanOrEqual(pullRequestsFixture.PR_SEARCH_MAX_RESULTS);
        expect(repos).to.include.all.keys('name', 'full_name', 'html_url', 'owner','description','stargazers_count', 'watchers_count', 'forks_count', 'open_issues_count', 'is_template', 'topics', 'archived', 'private', 'license');
      })
    })

})