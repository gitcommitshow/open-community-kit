const { expect, assert } = require("chai");

const { OCK } = require("../index.js");

const contributorsFixture = require("./fixtures/contributors.fixture.js");

describe('index.js', function() {

    /** GitHub contrbutors test --START-- */

    // OCK contributor test
    describe('#OCK.contributors.github.archive(REPO_OWNER, options);', async function() {
        it('should start the task of archiving contributors for REPO_OWNER', async function() {
          this.timeout(100000);
          let contributorsHandlesString = await OCK.contributors.github.archive(contributorsFixture.VALID_REPO_OWNER);
          assert.isNotNull(contributorsHandlesString);
          expect(contributorsHandlesString).to.be.not.empty;
          expect(str).to.include('@');
          // expect(str).to.include(',');
        })
    })

})