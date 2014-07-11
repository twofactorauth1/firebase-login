require('./dao/cms.dao.js');

var blogPostDao = require('./dao/blogpost.dao.js');

module.exports = {



    getAllThemes: function(fn) {
        $$.dao.CmsDao.getAllThemes(fn);
    },

    createBlogPost: function(accountId, blogPost, fn) {
        blogPostDao.saveOrUpdate(blogPost, fn);
    },

    getBlogPost: function(accountId, postId, fn) {
        blogPostDao.getById(postId, fn);
    },

    updateBlogPost: function(accountId, blogPost, fn) {
        blogPostDao.saveOrUpdate(blogPost, fn);
    },

    deleteBlogPost: function(accountId, postId, fn) {
        blogPostDao.removeById(postId, $$.m.BlogPost, fn);
    },

    modifyPostOrder: function(accountId, postId, newOrderNumber, fn) {

    },

    getPostsByAuthor: function(accountId, author, fn) {
        blogPostDao.getPostsByAuthor(author, fn);
    },

    getPostsByTitle: function(accountId, title, fn) {
        blogPostDao.getPostsByTitle(title, fn);
    },

    getPostsByData: function(accountId, data, fn) {
        blogPostDao.getPostsByData(data, fn);
    },

    getPostsByCategory: function(accountId, category, fn) {
        blogPostDao.getPostsByCategory(category, fn);
    },

    getPostsByTag: function(accountId, tag, fn) {
        blogPostDao.getPostsByTags(tag, fn);
    },

    listBlogPosts: function(accountId, limit, fn) {
        blogPostDao.findManyWithLimit({'accountId':accountId}, limit, $$.m.BlogPost, fn);
    }
};