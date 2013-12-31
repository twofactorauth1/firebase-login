var APIeasy = require('api-easy'),
assert = require('assert');

var suite = APIeasy.describe('User API test');

suite.discuss('User API')
    .discuss('GET request without parameters')
    .use('localhost', 1337)
    .setHeader('Content-Type', 'application/json')
    .get('/user/')
    .expect(200, {code: 29045, message: 'access token missing'})
    .export(module);
