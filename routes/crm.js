
/*
 * GET CRM page.
 */

exports.index = function(req, res){
  res.render('crm', { title: 'CRM' });
};