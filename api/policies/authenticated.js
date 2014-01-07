/**
 * Allow any authenticated user.
 */
module.exports = function (req, res, next) {
    if (req.session.passport.user) {
        return next();
    }
    else {
        if (req.isSocket) {
            return res.json(ErrorMessageService.errorMessage(290411));
        }
        else {
            return res.redirect('/auth/login/');
        }
    }
};
