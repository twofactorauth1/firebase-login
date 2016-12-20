
var statesThatDontTaxShipping = [];
//per http://blog.taxjar.com/sales-tax-and-shipping/
//and https://github.com/IndigenousIO/indigeweb/issues/7782
statesThatDontTaxShipping[0] = 'AL';
statesThatDontTaxShipping[1] = 'AZ';
statesThatDontTaxShipping[2] = 'CA';
statesThatDontTaxShipping[3] = 'ID';
statesThatDontTaxShipping[4] = 'IA';
statesThatDontTaxShipping[5] = 'LA';
statesThatDontTaxShipping[6] = 'ME';
statesThatDontTaxShipping[7] = 'MD';
statesThatDontTaxShipping[8] = 'MA';
statesThatDontTaxShipping[9] = 'NV';
statesThatDontTaxShipping[10] = 'OK';
statesThatDontTaxShipping[11] = 'UT';
statesThatDontTaxShipping[12] = 'VA';
statesThatDontTaxShipping[13] = 'WY';

module.exports = {
    statesThatDontTaxShipping: statesThatDontTaxShipping
};