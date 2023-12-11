import * as https from 'https';

/**
 * Sends an HTTPS request based on the specified method and options
 * This function returns a Promise that resolves with the response and data received from the server
 * @param {string} method - The HTTP method to use (e.g., 'GET', 'POST').
 * @param {string} url - The URL to which the request is sent.
 * @param {Object} [options] - The options for the request. This includes headers, request body (for POST/PUT), etc.
 * @returns {Promise<{res: https.IncomingMessage, data: string}>} A Promise that resolves with the response object and the body data as a string.
 * @throws {Error} Throws an error if the request cannot be completed
 *
 * @example
 * // Example usage for a GET request within an async function
 * async function getExample() {
 *   try {
 *     const { res, data } = await makeRequest('GET', 'https://example.com');
 *     console.log('Status Code:', res.statusCode);
 *     console.log('Body:', data);
 *   } catch (error) {
 *     console.error('Error:', error.message);
 *   }
 * }
 * */
export async function makeRequest(method, url, options) {
    return new Promise((resolve, reject) => {
        // Ensure options is an object and set the method
        options = typeof options === 'object' ? options : {};
        options.method = method;

        const req = https.request(url, options, res => {
            // Handle HTTP response stream
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ res, data }));
        });

        req.on('error', error => {
            console.error('Request error:', error);
            reject(error);
        });

        // Handle POST/PUT data if provided
        if (options.data) {
            req.write(options.data);
        }

        req.end();
    });
}