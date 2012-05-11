
// dependency checks
if (typeof MooTools === 'undefined') {
    throw new Error('MooTools required.');
}

/**
 * StringValidator
 * 
 * Provides abstract validation methods for validating data that is presumed to
 * be a string.
 * 
 * Requires MooTools.
 * 
 * @author   Oliver Nassar <onassar@gmail.com>
 * @abstract
 */
var StringValidator = (function() {

    // return singelton
    return {

        /**
         * email
         * 
         * @public
         * @param  String str
         * @return Boolean
         */
        email: function(str) {
            return str.match(/^[_a-z0-9-]+([\.|\+][_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/i) !== null;
        },

        /**
         * emptyOrEmail
         * 
         * @public
         * @param  String str
         * @return Boolean
         */
        emptyOrEmail: function(str) {
            return str.length === 0 || StringValidator.email(str);
        },

        /**
         * emptyOrUrl
         * 
         * @public
         * @param  String str
         * @return Boolean
         */
        emptyOrUrl: function(str) {
            return str.length === 0 || StringValidator.url(str);
        },

        /**
         * quals.
         * 
         * @public
         * @param  String str
         * @param  String value
         * @return Boolean
         */
        equals: function(str, value) {
            return str === value;
        },

        /**
         * inList
         * 
         * @public
         * @param  String str
         * @param  Array list
         * @return Boolean
         */
        inList: function(str, list) {
            return list.contains(str);
        },

        /**
         * notEmpty
         * 
         * @public
         * @param  String str
         * @return Boolean
         */
        notEmpty: function(str) {
            return str !== '';
        },

        /**
         * url
         * 
         * @public
         * @param  String str
         * @return Boolean
         */
        url: function(str) {
            return true;
        }
    };
})();
