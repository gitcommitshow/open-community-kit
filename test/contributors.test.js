import { expect, assert } from "chai";
import * as contributorsLib from "../contributors.js";

import * as contributorsFixture from './fixtures/contributors.fixture.js';

describe('contibutors.js', function() {

    /** GitHub contrbutors test --START-- */

    describe.skip('#getAllRepos('+contributorsFixture.VALID_REPO_OWNER+');', async function() {
      it('should return the repos owned by '+contributorsFixture.VALID_REPO_OWNER, async function() {
        this.timeout(100000);
        let repos = await contributorsLib.getAllRepos(contributorsFixture.VALID_REPO_OWNER);
        assert.isNotNull(repos);
        expect(repos).to.be.an('array', 'Not an array')
        expect(repos.length).to.be.greaterThanOrEqual(contributorsFixture.REPO_COUNT_MIN);
        expect(repos[0]).to.include.all.keys('id', 'name', 'full_name', 'owner', 'private', 'html_url');
      })
    })

    describe.skip('#getRepoContributors('+contributorsFixture.VALID_REPO+');', async function() {
        it('should return the repo contribuors', async function() {
          this.timeout(100000);
          let contributors = await contributorsLib.getRepoContributors(contributorsFixture.VALID_REPO)
          assert.isNotNull(contributors);
          expect(contributors).to.be.an('array', 'Not an array')
          expect(contributors.length).to.be.greaterThanOrEqual(contributorsFixture.REPO_CONTRIBUTOR_COUNT_MIN);
          expect(contributors[0]).to.include.all.keys('login','id','node_id','avatar_url','gravatar_id','url','html_url','followers_url','following_url','gists_url','starred_url','subscriptions_url','organizations_url','repos_url','events_url','received_events_url','type','site_admin','contributions');
        })
    })

    describe.skip('#getAllContributors('+contributorsFixture.VALID_REPO_OWNER+');', async function() {
        it('should return all contributors across different repositories of REPO_OWNER', async function() {
          this.timeout(100000);
          let contributors = await contributorsLib.getAllContributors(contributorsFixture.VALID_REPO_OWNER);
          assert.isNotNull(contributors);
          expect(contributors).to.be.an('array', 'Not an array')
          expect(contributors.length).to.be.greaterThanOrEqual(contributorsFixture.ALL_REPO_CONTRIBUTOR_COUNT_MIN);
          expect(contributors[0]).to.include.all.keys('login','id','node_id','avatar_url','gravatar_id','url','html_url','followers_url','following_url','gists_url','starred_url','subscriptions_url','organizations_url','repos_url','events_url','received_events_url','type','site_admin','contributions');
        })
    })

})