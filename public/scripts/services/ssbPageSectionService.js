(function () {
    mainApp.factory('SsbPageSectionService', SsbPageSectionService);
    
    function SsbPageSectionService(){
        var ssbSectionService = {};


        ssbSectionService.getSectionOffset = getSectionOffset;
        ssbSectionService.setSectionOffset = setSectionOffset;

        ssbSectionService.offset = 0;
        

        function getSectionOffset() {
            return ssbSectionService.offset;
        } 


        function setSectionOffset(offset) {
            ssbSectionService.offset = offset;
        }       

        
        (function init() {
            
        })();
    return ssbSectionService;       
    }
})();