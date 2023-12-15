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

    // OCK PR search test
    describe.skip('#OCK.github.searchPullRequests(query, options);', async function() {
      it('should start the task of archiving contributors for REPO_OWNER', async function() {
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

    // OCK PR search test
    describe('#OCK.github.searchPullRequests(query, options);', async function() {
      it('should start the task of archiving contributors for REPO_OWNER', async function() {
        this.timeout(100000);
        let prResults = await githubApi.recursiveSearchPullRequests("test", { maxResults: 198});
        assert.isNotNull(prResults, "No PR search results returned");
        expect(prResults).to.be.an('array');
        expect(prResults).to.have.lengthOf.at.least(198);
        expect(prResults).to.have.lengthOf.at.most(200);
        expect(prResults[0]).to.include.all.keys('title', 'html_url', 'state', 'user', 'draft', 'repository_url', 'comments', 'comments_url', 'assignees', 'created_at', 'closed_at');
      })
    })

    

})