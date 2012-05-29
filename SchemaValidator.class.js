
// dependency checks
if (typeof MooTools === 'undefined') {
    throw new Error('MooTools required.');
}

/**
 * SchemaValidator
 * 
 * Manages the validation of a schema against its defined rules. The flow is
 * unique, in that it wraps all checks in proxies to allow for ajax validation
 * calls to be managed within the same flow as iterative/stack-based checks (in
 * addition to recursively on sub-rule arrays).
 * 
 * This means you can have rule #1 check a strings length, rule #2 check if the
 * string (let's assume it's a username) is already taken (by checking on the
 * backend against a db), and rule #3 check to ensure it doesn't contain any
 * invalid characters. All this would be done one-after-another.
 * 
 * Note that the default case for <funnel> and <failsafe> properties is that
 * they are set to <false> (eg. the rule shouldn't act as a funnel unless
 * explicitely set; the rule shouldn't act as a failsafe [whereby subsequent
 * rules fail] unless explcitely set).
 * 
 * @author  Oliver Nassar <onassar@gmail.com>
 * @notes   Supports ajax-validation through usage of the <Ajax.class.js>
 *          library
 * @example https://github.com/onassar/JS-JSON-Validation/tree/master/example
 */
var SchemaValidator = new Class({

    /**
     * _rules. 
     * 
     * @protected
     * @var       Array
     */
    _rules: [],

    /**
     * errors. 
     * 
     * @public
     * @var    Array
     */
    errors: [],

    /**
     * inputs. 
     * 
     * @public
     * @var    Object
     */
    inputs: {},

    /**
     * schema. 
     * 
     * @public
     * @var    Array
     */
    schema: [],

    /**
     * initialize
     * 
     * @public
     * @param  Array schema array containing rules on how a form ought to be
     *         validated
     * @param  Object inputs
     * @return void
     */
    initialize: function(schema, inputs) {
        this.schema = schema;
        this.inputs = inputs;
    },

    /**
     * _failed
     * 
     * Method that handles an error failing. It takes into account whether a
     * rule ought to act as a funnel for a sub-rule, as well as whether a rule
     * should act as a failsafe (meaning no further rules should be run).
     * 
     * @protected
     * @param     Object rule
     * @param     Function callback
     * @return    void
     */
    _failed: function(rule, callback) {

        // if the rule wasn't meant to act as a funnel for further rules
        if (
            typeof rule.funnel === 'undefined'
            || rule.funnel === false
        ) {

            // add to error array
            this.addError(rule)
        }

        /**
         * If it's not a failsafe (in which case further checks shouldn't be
         * performed)
         */
        if (
            typeof rule.failsafe === 'undefined'
            || rule.failsafe === false
        ) {
            callback();
        }
    },

    /**
     * _getParams
     * 
     * Creates a clone of the paramters for the rule passed in, and loops
     * through each of them in order to parse it to see if it's a template for
     * an actual value. For example, if a parameter specified in the json schema
     * file looks like {email}, it ought to pull in that value from the inputs
     * object passed along into the schema validator instance.
     * 
     * @protected
     * @param     Object rule
     * @return    Array
     */
    _getParams: function(rule) {

        /**
         * Clone the params (since being modified); note that it may not be
         * provided, so a condition is made here to be an empty array despite
         * the Array.clone method allowing undefined properties to be cloned (
         * which results in an empty array, anyway)
         */
        var params = Array.clone(rule.params || []),
            self = this,
            match;

        // loop over all to run a regex replace on them
        params.each(function(param, x) {

            /**
             * Try to match; a check is done here first to see if the match
             * method is available, since it may be a boolean, array or
             * number-literal being passed in as paramter)
             */
            match = param.match && param.match(/^{([a-zA-Z0-9-\._]+)}$/);

            /**
             * Match found (eg. the parameter should be replaced with an input's
             * value.
             */
            if (match) {
                if (typeof self.inputs[match[1]] !== 'undefined') {
                    params[x] = self.inputs[match[1]];
                } else {
                    params[x] = null;
                }
            }
        });

        // return the templated params for use in the actual validation flow
        return params;
    },

    /**
     * addError. 
     * 
     * @public
     * @param Object rule
     * @return void
     */
    addError: function(rule) {
        this.errors.push(rule);
    },

    /**
     * asynchronous
     * 
     * Returns whether or not a rule should be processed asynchronously by
     * checking whether the function-argument signature contains success/failure
     * functions.
     * 
     * @public
     * @param  Object rule
     * @return Boolean
     */
    asynchronous: function(rule) {
        var fn = window[rule.validator[0]][rule.validator[1]],
            callbacks = fn.toString().contains('success, failure');
        return callbacks;
    },

    /**
     * check
     * 
     * Recursively checks one rule at a time. Acts as a wrapper or proxy for the
     * <checkRule> method below, in order to execute the passed in callback.
     * 
     * @public
     * @param  Array rules
     * @param  Function callback
     * @return void
     */
    check: function(rules, callback) {

        // if there are rules
        if (rules.length > 0) {

            // check rule
            var self = this,
                rule = rules.shift();

            // if a rule was found
            if (rule) {

                /**
                 * Nest callback for recursive rule checking (aka. check the next
                 * rule)
                 */
                callback = this.check.pass([rules, callback], this);

                // check rule, passing in callback to act recursively
                this.checkRule(rule, callback);
            }
        }
        // no rules left
        else {
            callback();
        }
    },

    /**
     * checkRule
     * 
     * Performs a rule-check by either wrapping a non-ajax based rule with a
     * success/failure function, or by passing in two extra functions to an ajax
     * check to allow it to recursively call the next check. This method also
     * retrieves the parameters (since they may be templated off of form-data),
     * and sets the callback function to recusrively check the rule's sub-rules
     * array for fine-grained validation (aka. nested validation/conditional
     * checking).
     * 
     * @public
     * @param  Object rule
     * @param  Function callback
     * @return void
     */
    checkRule: function(rule, callback) {

        // grab the parsed/templated parameters; set self; measure success
        var params = this._getParams(rule),
            self = this,
            success;

        /**
         * fn
         * 
         * Callback to take sub-rules into consideration, if they exists.
         * 
         * @private
         * @return  void
         */
        var fn = function() {
            self.check(rule.rules || [], callback);
        };

        // if it's an async check, push the success and failure callbacks
        if (this.asynchronous(rule)) {
            params.push(fn, this._failed.pass([rule, fn], this));
            window[rule.validator[0]][rule.validator[1]].apply(this, params);
        }
        /**
         * Otherwise run the test within the stack, and fire off appropriate
         * callback.
         */
        else {
            success = window[rule.validator[0]][rule.validator[1]].apply(
                this,
                params
            );
            if (success) {
                fn();
            } else {
                this._failed(rule, callback);
            }
        }
    },

    /**
     * getErrors. Returns the array of errors.
     * 
     * @public
     * @return Array
     */
    getErrors: function() {
        return this.errors;
    },

    /**
     * validate
     * 
     * Initializes the schema checking by passing in a copy of the form schema
     * (named <_rules>, since it's simply an array of them).
     * 
     * @public
     * @param  Function success
     * @param  Function failure
     * @return void
     */
    validate: function(success, failure) {

        /**
         * Clone schema (as rules) since they are shifted off during 
         * process.
         */
        this._rules = Array.clone(this.schema);

        /**
         * callback
         * 
         * Core callback function that handles logic after all applicable
         * validation has occurred.
         * 
         * @private
         * @return  void
         */
        var callback = function() {
            if (this.errors.length === 0) {
                success.bind(this)()
            } else {
                failure.bind(this)();
            }
        }.bind(this);

        // begin recursive rule checking
        this.check(this._rules, callback);
    }
});
