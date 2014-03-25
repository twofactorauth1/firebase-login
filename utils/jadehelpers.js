/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

requirejs("utils/commonutils");

app.locals = app.locals || {};

app.locals.formatUserName = function(user) {
    if (user == null) {
        return "";
    }

    if ($$.u.stringutils.isNullOrEmpty(user.First)) {
        return user.Email;
    } else {
        return user.FirstName + " " + user.LastName;
    }
};


//-------------------------------
//  FORMAT DATES & TIMES
//-------------------------------
app.locals.formatDate = function(date, mask) {
    if (!date) {
        return "";
    }
    if (_.isString(date)) {
        date = new Date(date);
    }

    return date.format(mask);
};

app.locals.formatSeconds = $$.u.formatutils.formatSecondsToHHMMSS;

app.locals.formatDateDiff = $$.u.formatutils.formatDateDiffInHHMMSS;


//-------------------------------
//  SET SERVER PROPERTIES
//-------------------------------
app.locals.setServerProp = function(key, value) {
    var str =
        "if (typeof indigenous === 'undefined') indigenous = {};" +
        "window.indigenous = window.indigeous || {};" +
            "window.indigenous.server = window.indigenous.server || {};";

    if (_.isNaN(parseFloat(value)) == false || value == null || _.isBoolean(value)) {
        str +=  "window.indigeous.server." + key + "=" + value;
    } else {
        str += "window.indigenous.server." + key + "='" + value + "'";
    }
    return str;
};


app.locals.setServerProps = function(serverProps) {
    var str =
        "if (typeof indigenous === 'undefined') indigenous = {};" +
        "window.indigenous = window.indigenous || {};" +
            "window.indigenous.server = window.indigenous.server || {};";

    for (var key in serverProps) {
        var value = serverProps[key];

        if (_.isNaN(parseFloat(value)) == false || value == null || _.isBoolean(value)) {
            str +=  "window.indigenous.server." + key + "=" + value + ";";
        } else {
            str += "window.indigenous.server." + key + "='" + value + "';";
        }
    }

    return str;
};
