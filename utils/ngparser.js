/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014-2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var htmlparser = require("htmlparser2");
var _ = require('underscore');
var moment = require('moment');

var ngparser = {

    log: $$.g.getLogger('ngparser'),

    init: function(output, context, substitutions) {
        var self = this;
        var skipStack = new Array();
        skipStack.peek = function() {
            var temp = this.pop();
            this.push(temp);
            return temp;
        }
        var parser = new htmlparser.Parser({
            onopentag: function(name, attribs){


                if(!skipStack.peek()) {
                    //stack is empty
                    if(attribs['ng-if']) {
                        console.log('ng-if?', attribs['ng-if']);
                        var attribPath = attribs['ng-if'];
                        var contextValue = self._evaluateNGIF(context, attribPath);
                        if(!contextValue) {
                            skipStack.push({state: 'SKIP', tag:name});
                            return;
                        } else {
                            delete attribs['ng-if'];
                        }
                    }
                    if(attribs['ng-repeat']) {
                        console.log('ng-repeat?', attribs['ng-repeat']);
                        //skipStack.push(name);
                        //delete(attribs['ng-repeat']);
                        /*
                         * Build a repeat context from the attribute value:
                         *  - handle | filter [post in vm.blog.posts | filter:{ featured: true }]
                         *  - handle track by [post in vm.blog.posts track by $index]
                         *
                         * Build a repeat Stack.  Once we come to the end, apply the stack tags to the repeat context
                         */
                        var ngRepeat = attribs['ng-repeat'];
                        var data = {};
                        var fxn = function(obj, i){return obj[i];};
                        var alias = null;
                        if(ngRepeat.indexOf(' | ') > 0) {
                            var loopPart = ngRepeat.substring(0, ngRepeat.indexOf(' | '));
                            alias = loopPart.split(' ')[0];
                            var path = loopPart.split(' ')[2].trim();


                            data = path.split('.').reduce(fxn, context);
                            if(ngRepeat.substring(ngRepeat.indexOf(' | ')).indexOf('filter:') > 0) {
                                var filterString = ngRepeat.substring(ngRepeat.indexOf('filter:')).replace('filter:', '').replace('{', '').replace('}', '');
                                var filterObj = {};
                                //TODO: handle filters that aren't booleans
                                filterObj[filterString.split(':')[0].trim()] = Boolean(filterString.split(':')[1].trim());
                                data = _.filter(data, filterObj);
                            }

                        } else {
                            alias = ngRepeat.split(' ')[0];
                            var path = ngRepeat.split(' ')[2].trim();
                            data = path.split('.').reduce(fxn, context);
                        }
                        if(ngRepeat.substring(ngRepeat.indexOf(' | ')).indexOf('track by $index') >= 0) {
                            _.each(data, function(element, index){
                                element['$index'] = index;
                            });

                        }
                        console.log('data:', data);
                        delete(attribs['ng-repeat']);
                        //check if we need to replace any html substitutions (ie sub-directives)

                        var replace = false;
                        var sub = null;
                        _.each(_.keys(attribs), function(key){
                            _.find(substitutions, function(subs){
                                if(subs.name === key) {
                                    replace = true;
                                    sub = subs;
                                }
                            });

                        });
                        if(replace === true) {
                            var tmpOutput = sub.value.replace(new RegExp(sub.prefix + '.' + alias, 'g'), alias);
                            skipStack.push({state:'REPEAT', tag:name, tmpContext:data, tmpOutput:tmpOutput, alias:alias, repeatStackSize:1});
                        } else {
                            console.log('replace is false');
                            var tmpOutput = '<' + name + ' ';
                            _.each(_.keys(attribs), function(key){
                                tmpOutput += key + '=\"' + attribs[key] + '\" ';
                            });
                            tmpOutput += '>';
                            skipStack.push({state:'REPEAT', tag:name, tmpContext:data, tmpOutput:tmpOutput, alias:alias, repeatStackSize:1});
                        }

                        return;
                    }

                    if(attribs['ng-src']) {
                        console.log('ng-src', attribs['ng-src']);
                        attribs.src = attribs['ng-src'];
                        delete attribs['ng-src'];
                    }
                    if(attribs['ng-class']) {
                        //TODO: this could be smarter
                        var attribValue = attribs['ng-class'].split('+\'-v\'+');
                        var fxn = function(obj, i){return obj[i];};
                        var value = attribValue[0].split('.').reduce(fxn, context) +
                            attribValue[1].split('.').reduce(fxn, context);
                        attribs['class'] = value;
                        delete attribs['ng-class'];

                    }
                    output += '<' + name + ' ';

                    _.each(_.keys(attribs), function(key){
                        output += key + '=\"' + self._doSubstitutions(context, attribs[key]) + '\" ';
                    });
                    output +='>';
                } else if(skipStack.peek().state === 'SKIP') {
                    skipStack.push({state:'SKIP', tag:name});
                } else if(skipStack.peek().state === 'REPEAT') {
                    var state = skipStack.pop();
                    state.tmpOutput += '<' + name + ' ';
                    _.each(_.keys(attribs), function(key){
                        state.tmpOutput += key + '=\"' + attribs[key] + '\" ';
                    });
                    state.tmpOutput += '>';
                    state.repeatStackSize += 1;
                    skipStack.push(state);
                }
                //otherwise, loop through attribs and text substitute on {{foo}}
            },

            ontext: function(text){
                //console.log("-->", text);
                if(!skipStack.peek()) {
                    //nothing on the stack
                    output += self._doSubstitutions(context, text);
                } else if(skipStack.peek().state === 'SKIP') {
                    //we are skipping
                    return;
                } else if(skipStack.peek().state === 'REPEAT') {
                    var repeatState = skipStack.pop();
                    repeatState.tmpOutput += text;
                    skipStack.push(repeatState);
                }


            },
            onclosetag: function(tagname){
                if(!skipStack.peek()) {
                    output += "</" + tagname + '>';
                } else if(skipStack.peek().state === 'SKIP') {
                    skipStack.pop();
                } else if(skipStack.peek().state === 'REPEAT') {
                    var repeatState = skipStack.pop();
                    repeatState.repeatStackSize--;
                    if(repeatState.repeatStackSize === 0) {
                        console.log('done repeating...');
                        repeatState.tmpOutput += '</' + tagname + '>';
                        //right here we want to recursively parse tmpOutput with tmpContext

                        //re-alias the context
                        _.each(repeatState.tmpContext, function(ctx){
                            var ctxObj = {};
                            ctxObj[repeatState.alias] = ctx;
                            var recursiveParser = self.init('', ctxObj, substitutions);
                            recursiveParser.write(repeatState.tmpOutput);
                            recursiveParser.end();
                            output += recursiveParser.getOutput();
                        });

                    } else {
                        console.log('still repeating...');
                        repeatState.tmpOutput += '</' + tagname + '>';
                        skipStack.push(repeatState);
                    }
                }

            }
        }, {decodeEntities: true});

        parser.output = output;
        parser.context = context;
        parser.skipStack = skipStack;
        parser.substituions = substitutions;
        parser.getOutput = function(){return output;};
        return parser;
    },

    parseHtml: function(html, context, substitutions, fn) {
        var self = this;

        var output = '';
        var parser = self.init(output, context, substitutions);
        parser.write(html);
        parser.end();
        fn(null, parser.getOutput());

    },


    _evaluateNGIF: function(context, path) {
        try {
            var NOT = false;//set a not flag to handle any exceptions
            if(path.startsWith('!')) {
                NOT = true;
                var contextValue = path.replace('!', '').split('.').reduce(function(obj, i){return obj[i];}, context);
                //console.log('contextValue: !', contextValue);
                return (!contextValue);
            } else {
                var contextValue = path.replace('!', '').split('.').reduce(function(obj, i){return obj[i];}, context);
                //console.log('contextValue: ', contextValue);
                return contextValue;
            }
        } catch(Exception) {
            if(NOT===true) {
                return true;
            }
            return false;
        }

    },

    _doSubstitutions: function(context, text) {
        var self = this;
        if(text.indexOf('{{') === -1) {
            return text;
        }
        /*
         * Pattern:
         *   X || Y
         *   X || Y | Z (X or Y piped to Z)
         *   (X) ? Y : Z (if X then Y else Z)
         *   X
         *   abcdX
         */


        var fxn = function(obj, i){return obj[i];};

        //We can do this the smart way... or the dumb way..
        //The smarter way would use a tokenizer, the smart way would use regexp capture groups
        if(text.indexOf('||') >0) {
            if(text.indexOf(' | ') > 0) {
                var textSides = text.replace('{{', '').replace('}}', '').split('||');
                var leftSide = textSides[0].trim();
                var rightSide = textSides[1].split(' | ')[0].trim();
                var dateFunc = textSides[1].split(' | ')[1].trim();
                console.log('left: [' + leftSide + '] and dateFunc [' + dateFunc + ']');
                var data = null;
                if(leftSide.split('.').reduce(fxn, context)) {
                    data = leftSide.split('.').reduce(fxn, context);
                } else {
                    data = rightSide.split('.').reduce(fxn, context);
                }
                var startIndex = dateFunc.indexOf(':') + 1;
                var dateFormat = dateFunc.substring(startIndex).replace('\'', '').replace('\'', '').replace('yyyy', 'YYYY').replace('dd', 'DD').trim();
                return moment(data).format(dateFormat);
            } else {
                var textSides = text.replace('{{', '').replace('}}', '').split('||');
                if(textSides[0].trim().split('.').reduce(fxn, context)) {
                    return textSides[0].trim().split('.').reduce(fxn, context);
                } else {
                    return textSides[1].trim().split('.').reduce(fxn, context)
                }
            }
        } else if(text.indexOf(' ? ') > 0 && text.indexOf(':') > 0) {
            var testValue = text.split('?')[0].replace('{{', '').replace('(', '').replace(')', '').trim();
            var trueValue = text.split('?')[1].split(':')[0].trim();
            var falseValue = text.split('?')[1].split(':')[1].replace('}}', '').trim();

            if(testValue.split('.').reduce(fxn, context)) {
                return trueValue.split('.').reduce(fxn, context);
            } else {
                return falseValue;
            }

        } else {
            var startIndex = text.indexOf('{{');
            var endIndex = text.indexOf('}}');
            var replacementValue = text.substring(startIndex+2, endIndex).split('.').reduce(fxn, context);
            return toReturn = text.substring(0, startIndex) + replacementValue + text.substring(endIndex+2);
        }
        return text;
    }


};

module.exports = ngparser;
