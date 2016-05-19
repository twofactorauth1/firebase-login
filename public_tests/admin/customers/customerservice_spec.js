/**
 * Created by johnk_000 on 8/9/2015.
 */

describe('customer service features', function() {
    //var ContactService;
    var $httpBackend;

    beforeEach(inject(function (/*_ContactService_, */_$httpBackend_) {
        //ContactService = _ContactService_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
    });

    it('should be true', function() {
        expect(true).toBe(true);
    })
});
