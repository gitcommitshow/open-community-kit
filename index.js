import * as contributorsLib from './contributors.js';

/**
 * Bundling all APIs together
 * @param {*} options 
 */

const OCK = {
    contributors: {
        github: {
            archive: async function(owner, options){
                return contributorsLib.archiveContributorsLeaderboard(owner, options)
            },
        },
    }
}

export default OCK