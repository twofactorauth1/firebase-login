/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var paging = {

    getPageItemIsIn: function(sortedItems, value, numPerPage) {
        var index = sortedItems.indexOf(value);

        if (index == -1) {
            return -1;
        }

        return Math.floor(index/numPerPage) + 1;
    },


    getItemsForCurrentPage: function(sortedItems, currentPage, numPerPage) {
        if (currentPage <= 0) {
            currentPage = 1;
        }

        var startIndex = (currentPage * numPerPage) - numPerPage;
        var numToPull = numPerPage;

        if (startIndex > sortedItems.length) {
            return [];
        }

        if (startIndex + numToPull > sortedItems.length) {
            numToPull = sortedItems.length - startIndex;
        }

        return sortedItems.slice(startIndex, startIndex + numToPull);
    },


    getPagingInfo: function(totalCount, numPerPage, page) {
        if (page <= 0) {
            page = 1;
        }

        var lastPage = Math.ceil(totalCount/numPerPage);
        if (totalCount % numPerPage != 0) {
            lastPage += 1;
        }

        var previousPage = page <= 1 ? 1 : (page - 1);
        var nextPage = page < lastPage ? (page + 1) : lastPage;

        return {
            lastPage: lastPage,
            prevPage: previousPage,
            nextPage: nextPage,
            page: page,
            pageSize: numPerPage,
            totalCount: totalCount
        };
    }
};

module.exports = paging;