/**
 * Created by johnk_000 on 8/9/2015.
 */

describe('customer service features', function() {
    //var CustomerService;
    var $httpBackend;

    beforeEach(inject(function (/*_CustomerService_, */_$httpBackend_) {
        //CustomerService = _CustomerService_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function() {
    });

    it('should be true', function() {
        expect(true).toBe(true);
    })
});
