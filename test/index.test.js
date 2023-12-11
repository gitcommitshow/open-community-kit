import { expect, assert } from "chai";

import OCK from "../index.js";

import * as contributorsFixture from "./fixtures/contributors.fixture.js";

describe('index.js', function() {

    /** GitHub contrbutors test --START-- */

    // OCK contributor test
    describe('#OCK.contributors.github.archive(REPO_OWNER, options);', async function() {
        it('should start the task of archiving contributors for REPO_OWNER', async function() {
          this.timeout(100000);
          let contributorsHandlesArray = await OCK.contributors.github.archive(contributorsFixture.VALID_REPO_OWNER);
          assert.isNotNull(contributorsHandlesArray, "No contributors github handles returned");
          expect(contributorsHandlesArray).to.be.an('array');
          expect(contributorsHandlesArray).to.have.lengthOf.at.least(contributorsFixture.ALL_REPO_CONTRIBUTOR_COUNT_MIN);
        })
    })

})