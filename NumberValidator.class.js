
// dependency checks
if (typeof MooTools === 'undefined') {
    throw new Error('MooTools required.');
}

/**
 * NumberValidator
 * 
 * Provides abstract validation methods for validating data that is presumed to
 * be a number (integer/float).
 * 
 * Requires MooTools.
 * 
 * @author   Oliver Nassar <onassar@gmail.com>
 * @abstract
 */
var NumberValidator = (function() {

    // return singelton
    return {

        /**
         * between
         * 
         * @public
         * @param  Number number
         * @param  Number min
         * @param  Number max
         * @return Boolean
         */
        between: function(number, min, max) {
            return number.toInt() <= max
                && number >= min;
        },

        /**
         * inList
         * 
         * @public
         * @param  Number number
         * @param  Array list
         * @return Boolean
         */
        inList: function(number, list) {
            return list.contains(number.toInt());
        }
    };
})();
