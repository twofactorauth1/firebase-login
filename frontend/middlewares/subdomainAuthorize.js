module.exports = function () {
    return function (req, res, next) {
        console.log(req.subdomains);
        if (req.isAuthenticated()) {
            //code
            next();
        }
        else {
            //code    
        }
    }
};