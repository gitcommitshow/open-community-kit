import * as https from 'https';
import { ApertureClient } from "@fluxninja/aperture-js";


var apertureClient;

function getApertureClient(){
    if(!apertureClient) {
        apertureClient = new ApertureClient({
            address: process.env.APERTURE_SERVICE_ADDRESS,
            apiKey: process.env.APERTURE_API_KEY,
        });
    }
    return apertureClient;
}

/**
 * Sends an HTTPS request based on the specified method and options
 * This function returns a Promise that resolves with the response and data received from the server
 * @param {string} method - The HTTP method to use (e.g., 'GET', 'POST').
 * @param {string} url - The URL to which the request is sent.
 * @param {Object} [requestOptions] - The options for the request. This includes headers, request body (for POST/PUT), etc.
 * @param {Object} [requestOptions.body] - The data that needs to be sent with the request, used for POST/PUT requests
 * @param {Object} [requestOptions.headers] - The headers that needs to be sent with the request
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
export async function makeRequest(method, url, requestOptions) {
    return new Promise((resolve, reject) => {
        // Ensure options is an object and set the method
        requestOptions = typeof requestOptions === 'object' ? requestOptions : {};
        requestOptions.method = method;

        const req = https.request(url, requestOptions, res => {
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
        if (requestOptions.data) {
            req.write(requestOptions.data);
        }

        req.end();
    });
}


/**
 * Sends an HTTPS request with rate limiting. The function checks if the request is allowed by the rate limiter,
 * and if so, sends an HTTPS request based on the specified method and options. This function returns a Promise
 * that resolves with the response and data received from the server or rejects if an error occurs or the rate limit is exceeded.
 *
 * @param {string} method - The HTTP method to use (e.g., 'GET', 'POST').
 * @param {string} url - The URL to which the request is sent.
 * @param {Object} [options] - The options for the request. This includes headers, request body (for POST/PUT), etc.
 * @param {Object} [options.rateLimitOptions] - Options related to rate limits
 * @param {Object} [options.body] - The data that needs to be sent with the request, used for POST/PUT requests
 * @param {Object} [options.headers] - The headers that needs to be sent with the request
 * @returns {Promise<{res: https.IncomingMessage, data: string}>} A Promise that resolves with the response object and the body data as a string.
 * @throws {Error} Throws an error if the rate limit is exceeded or if an invalid argument is passed.
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
export async function makeRequestWithRateLimit(method, url, options){
  let flow;
  try {
    flow = await getApertureClient().startFlow("external-api", {
      labels: {
        url: url,
      },
      grpcCallOptions: {
        deadline: Date.now() + 300, // ms
      },
    });
  } catch(err){
    console.error("Aperture client for rate limiting is not setup correctly");
    console.log("Make sure to setup set correct APERTURE_SERVICE_ADDRESS and APERTURE_API_KEY in environment variables");
    console.log("Going to make request without rate limit");
  } finally {
    // Make request if allowed as per rate limit
    // In case rate limiting is not setup properly, make request anyway
    if (!flow || flow.shouldRun()) {
      // Add business logic to process incoming request
      console.log("Request accepted. Processing...");
      const {res, data} = await makeRequest(...arguments)
      return { res, data}
    } else {
      console.log("Request rate-limited. Try again later.");
      if(flow) {
        // Handle flow rejection
        flow.setStatus(FlowStatus.Error);
      }
    }
    if (flow) {
      flow.end();
    }
  }
}