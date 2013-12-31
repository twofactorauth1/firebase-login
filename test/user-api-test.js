var APIeasy = require('api-easy'),
assert = require('assert');

var suite = APIeasy.describe('User API test');

suite.discuss('User API')
    .discuss('GET request without parameters')
    .use('localhost', 1337)
    .setHeader('Content-Type', 'application/json')
    .get('/user/')
    .expect(200, {code: 29045, message: 'access token missing'})
    .undiscuss().unpath()
    .discuss('GET request with correct parameters')
    .get('/user/', {access_token: '52c2b79dc91759c810d9a5ca'})
    .expect(200, {id: '52c2b8be350f040212646809'})
    .export(module);
