import { expect, assert } from "chai";
import * as archive from "../archive.js";

import * as pullRequestsFixture from './fixtures/pullRequests.fixture.js';

describe('archive.js', function() {

    /** Archive test --START-- */

    describe.skip('#archive(jsonArray);', async function() {
      it('should save jsonArray to a csv file', async function() {
        this.timeout(100000);
        let content = await archive.save(pullRequestsFixture.VALID_PR_SEARCH_RESULT_ITEMS);
        assert.isNotNull(content, "Repos not returned");
        expect(content).to.be.an('string');
        expect(content).to.have.lengthOf.greaterThan(2000);
      })
    })

})