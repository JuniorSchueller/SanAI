require('dotenv').config();

const apiUrl = process.env.DATABASE_API_URL;
const emptyHistory = [];
function buildApiUrl(path) {
    return `${apiUrl}${path}.json`;
}

const requests = {
    'get': async function(url, headers = {}) {
        return this.request('GET', url, null, headers);
    },
    'post': async function(url, body = {}, headers = {}) {
        return this.request('POST', url, body, headers);
    },
    'put': async function(url, body = {}, headers = {}) {
        return this.request('PUT', url, body, headers);
    },
    'patch': async function(url, body = {}, headers = {}) {
        return this.request('PATCH', url, body, headers);
    },
    'delete': async function(url, headers = {}) {
        return this.request('DELETE', url, null, headers);
    },
    'head': async function(url, headers = {}) {
        return this.request('HEAD', url, null, headers);
    },
    'options': async function(url, headers = {}) {
        return this.request('OPTIONS', url, null, headers);
    },
    'trace': async function(url, headers = {}) {
        return this.request('TRACE', url, null, headers);
    },
    'request': async function(method, url, body = null, headers = {}) {
        try {
            const options = {
                method,
                headers
            };

            if (body !== null) {
                if (typeof body === 'object' && !(body instanceof FormData)) {
                    options.body = JSON.stringify(body);
                    options.headers['Content-Type'] = 'application/json';
                } else {
                    options.body = body;
                }
            }

            const req = await fetch(url, options);

            const responseHeaders = {};
            req.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let responseBody = null;
            try {
                responseBody = await req.json();
            } catch {
                responseBody = await req.text();
            }

            return {
                statusCode: req.status,
                statusText: req.statusText,
                headers: responseHeaders,
                body: responseBody
            };
        } catch (error) {
            return {
                error: true,
                message: error.message
            };
        }
    }
};

const chat = {
    'create': async function(chatId, author) {
        const body = {
            history: emptyHistory,
            author
        }
        
        const req = await requests.put(buildApiUrl(`/chats/${chatId}`), body);
        if (req.statusCode === 200) {
            return true;
        } else {
            return false;
        }
    },
    'get': async function(chatId, item = null) {
        const req = await requests.get(buildApiUrl(`/chats/${chatId}`));
        if (req.statusCode === 200) {
            if (item) return req.body[item];
            return req.body;
        } else {
            return null;
        }
    },
    'delete': async function(chatId) {   
        const req = await requests.post(buildApiUrl(`/chats/${chatId}`), body);
        if (req.statusCode === 200) {
            return true;
        } else {
            return false;
        }
    },
    'exists': async function(chatId) {
        const req = await requests.get(buildApiUrl(`/chats/${chatId}`));
        if (req.statusCode === 200) {
            return true;
        } else {
            return false;
        }
    },
}

const history = {
    'save': async function(chatId, history) {
        const body = {
            history
        }
        
        const req = await requests.patch(buildApiUrl(`/chats/${chatId}`), body);
        if (req.statusCode === 200) {
            return true;
        } else {
            return false;
        }
    },
    'get': async function(chatId) {
        const req = await requests.get(buildApiUrl(`/chats/${chatId}`));
        if (req.statusCode === 200) {
            return req.body['history'];
        } else {
            return [];
        }
    }
}

module.exports = { chat, history }