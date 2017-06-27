/*global app*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('SecurematicsCommonService', [function () {

      this.textToRemoveArray = ["hardware", "service", "services", "support", "education", "software", "networks", "license"];

      this.truncateVendorList = function(list){          
          var regex = this.getRegexbyArray();
          var _list = _.uniq(_.map(list, function(item){
              return item.replace(regex, "")
          }))
          return _list;
      }

      this.truncateVendorName = function(name){          
          var regex = this.getRegexbyArray();          
          return name.replace(regex, "")
      }

      this.getRegexbyArray = function(){
          var _textToRemoveArray = _.map(this.textToRemoveArray, function(item){
              return " " + item.trim(); 
          })
          var regexString = _textToRemoveArray.join("|");
          return new RegExp(regexString + "\s*$", "gi");
      }
  }]);
}(angular));
