const contributorsLib = require('./contributors');

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

exports.OCK = OCK;