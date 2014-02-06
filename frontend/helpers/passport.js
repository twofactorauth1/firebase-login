var mongoose = require('mongoose');
var User = mongoose.model('User');
var SocialUser = mongoose.model('SocialUser');

module.exports.localStrategyCallback = function (email, password, callback) {
    //TODO: add encryption logic for password.
    User.findOne({email: email, password: password}, function (err, user) {
        if (err) {
            return callback(err);
        }
        if (user) {
            return callback(null, user);
        }
        else {
            return callback(null, false, {message: 'Invalid Username / Password.'});
        }
    });
};

module.exports.deserializeUser = function (id, callback) {
    User.findOne({_id: id}, function (err, user) {
        callback(err, user);
    });
};

module.exports.createFacebookUser = function (accessToken, refreshToken, profile, callback) {
    User.findOne({email: profile.emails[0].value}, function (err, user) {
        console.log(err, user);
        if (err) {
            callback(err);
        }
        else {
            if (user) {
                SocialUser.findOne({user: user._id, authType: 1}, function (err, socialUser) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (socialUser) {
                            SocialUser.update({_id: socialUser},
                                              {$set: {token: accessToken, rawData: profile}},
                                              {upsert: false, multi: true},
                                              function (err, numberAffected, raw) {
                                                  if (err) {
                                                      callback(err);
                                                  }
                                                  else {
                                                      if (numberAffected) {
                                                          callback(null, user);
                                                      }
                                                      else {
                                                          callback(null, null);
                                                      }
                                                  }
                                              }
                                             );
                        }
                        else {
                            SocialUser.create({user: user._id,
                                              authType: 1,
                                              id: profile.username,
                                              token: accessToken,
                                              rawData: profile},
                                              function (err, socialUser) {
                                                  if (err) {
                                                      callback(err);
                                                  }
                                                  else {
                                                      if (socialUser) {
                                                          callback(null, user);
                                                      }
                                                      else {
                                                          callback(null, null);
                                                      }
                                                  }
                                              });
                        }
                    }
                });
            }
            else {
                User.create({email: profile.emails[0].value, password: accessToken}, function (err, user) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        if (user) {
                            SocialUser.create({user: user._id,
                                              authType: 1,
                                              id: profile.username,
                                              token: accessToken,
                                              rawData: profile},
                                              function (err, socialUser) {
                                                  if (err) {
                                                      callback(err);
                                                  }
                                                  else {
                                                      if (socialUser) {
                                                          callback(null, user);
                                                      }
                                                      else {
                                                          callback(null, null);
                                                      }
                                                  }
                                              });
                        }
                        else {
                            callback(null, null);
                        }
                    }
                });
            }
        }
    });
};
