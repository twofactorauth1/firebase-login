var request = require('request');

describe("User API", function () {
    it("without authentication should respond with 200", function (done) {
        request('http://localhost:1337/user', function (error, response, body) {
            expect(response.statusCode).toEqual(200);
            expect(response.request.path).toEqual('/auth/login/');
            done();
        });
    });
});
