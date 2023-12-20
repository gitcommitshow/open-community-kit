import 'dotenv/config'
import { expect, assert } from "chai";


describe('lifecycle', function() {

    describe('configs exist', async function() {
        it('aperture configs', async function() {
          assert.isNotNull(process.env.APERTURE_SERVICE_ADDRESS);
          assert.isNotNull(process.env.APERTURE_API_KEY);
        })
    })

})