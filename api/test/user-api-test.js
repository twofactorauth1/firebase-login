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
    .expect(200)
    .undiscuss().unpath()
    .discuss('PUT request without organization parameters')
    .put('/user/', {})
    .expect(200, {code: 29042, message: 'Organization param missing'})
    .undiscuss().unpath()
    .discuss('PUT request without user ID parameters')
    .put('/user/', {"organization": "52bbc9eb84993e7f0911b201"})
    .expect(200, {code: 29043, message: 'user ID param missing'})
    .undiscuss().unpath()
    .discuss('PUT request without access token parameters')
    .put('/user/', {"organization": "52bbc9eb84993e7f0911b201", "uid": "bi1"})
    .expect(200, {code: 29045, message: 'access token missing'})
    // .undiscuss().unpath()
    // .discuss('PUT with correct parameters')
    // .put('/user/', {"organization": "52bbc9eb84993e7f0911b201", "uid": "bi1", "access_token": "52c2b79dc91759c810d9a5ca"})
    // .expect(200, {code: 201, isActive: false})
    .export(module);
