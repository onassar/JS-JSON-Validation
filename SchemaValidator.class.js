
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
 * Note that the default case for <funnel> (eg. whether the rule should act as a
 * funnel for subrules) and <blocking> (eg. whether the rule should block
 * additional rules in the rule-stack from being checked upon the current rule
 * failing validation) properties are that they are set to <false>.
 * 
 * @author  Oliver Nassar <onassar@gmail.com>
 * @notes   Supports ajax-validation through usage of the <Ajax.class.js>
 *          library
 * @example https://github.com/onassar/JS-JSON-Validation/tree/master/example
 */
var SchemaValidator = new Class({

    /**
     * _failed
     * 
     * Array storing the rules that have failed after the validation process has
     * been finished.
     * 
     * @protected
     * @var       Array
     */
    _failed: [],

    /**
     * _blocked
     * 
     * Boolean used to track whether a <blocking> rule has failed, in order to
     * prevent subsequent rules from being run (within that
     * rule-stack/recursive-iteration).
     * 
     * @protected
     * @var       Boolean
     */
    _blocked: false,

    /**
     * _inputs
     * 
     * An array of the form's inputs, for usage with passing values to the
     * executing validation methods.
     * 
     * @protected
     * @var       Object
     */
    _inputs: {},

    /**
     * _rules
     * 
     * @protected
     * @var       Array
     */
    _rules: [],

    /**
     * _schema
     * 
     * @protected
     * @var       Array
     */
    _schema: [],

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
        this._schema = schema;
        this._inputs = inputs;
    },

    /**
     * _asynchronous
     * 
     * Returns whether or not a rule should be processed asynchronously by
     * checking whether the function-argument signature contains success/failure
     * functions.
     * 
     * @protected
     * @param     Object rule
     * @return    Boolean
     */
    _asynchronous: function(rule) {
        var fn = window[rule.validator[0]][rule.validator[1]],
            callbacks = fn.toString().contains('success, failure');
        return callbacks;
    },

    /**
     * _check
     * 
     * Recursively checks one rule at a time. Acts as a wrapper or proxy for the
     * <_checkRule> method below, in order to execute the passed in callback.
     * 
     * @protected
     * @param     Array rules
     * @param     Function callback
     * @return    void
     */
    _check: function(rules, callback) {

        // if there are rules
        if (rules.length > 0) {

            // grab first rule in array of rules
            var rule = rules.shift();

            // if a rule was found
            if (rule) {

                /**
                 * recursive
                 * 
                 * Nests the callback for recursive rule checking (aka. check
                 * the next rule), taking into consideration whether a rule
                 * marked as <blocking> has failed.
                 * 
                 * In this case, further recursive rule checking should not be
                 * performed, but only for this rules iteration/rule-stack.
                 * 
                 * @private
                 * @return  void
                 */
                var recursive = function() {

                    // if a <blocking> rule has failed
                    if (this._blocked) {

                        // reset the <_blocked> boolean
                        this._blocked = false;

                        // perform callback without subsequent iterative calls
                        callback();
                    } else {

                        // performs subsequent rule checking
                        this._check.pass([rules, callback], this)();
                    }
                }.bind(this);


                // check rule, passing in callback to act recursively
                this._checkRule(rule, recursive);
            }
        }
        // no rules left
        else {
            callback();
        }
    },

    /**
     * _checkRule
     * 
     * Performs a rule-check by either wrapping a non-ajax based rule with a
     * success/failure function, or by passing in two extra functions to an ajax
     * check to allow it to recursively call the next check. This method also
     * retrieves the parameters (since they may be templated off of form-data),
     * and sets the callback function to recusrively check the rule's sub-rules
     * array for fine-grained validation (aka. nested validation/conditional
     * checking).
     * 
     * @protected
     * @param     Object rule
     * @param     Function callback
     * @return    void
     */
    _checkRule: function(rule, callback) {

        // grab the parsed/templated parameters; set self; measure success
        var params = this._getParams(rule),
            self = this,
            success;

        /**
         * alternate
         * 
         * Alternate callback to take sub-rules into consideration, if they
         * exists.
         * 
         * @private
         * @return  void
         */
        var alternate = function() {
            self._check(rule.rules || [], callback);
        };

        // if it's an async check, push the success and failure callbacks
        if (this._asynchronous(rule)) {
            params.push(alternate, this._filter.pass([rule, alternate], this));
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
                alternate();
            } else {
                this._filter(rule, callback);
            }
        }
    },

    /**
     * _filter
     * 
     * Method that handles a rule failing, and filters it depending on it's
     * <funnel> and/or <blocking> properties.
     * 
     * If it was marked as a <funnel>, it prevents the rule from being added to
     * the failed rules array. If it is marked as <blocking>, it ends the
     * current rule-stack (no further rules within that recursive-iteration will
     * be checked).
     * 
     * @protected
     * @param     Object rule
     * @param     Function callback
     * @return    void
     */
    _filter: function(rule, callback) {

        // if the rule wasn't meant to act as a funnel for further rules
        if (
            typeof rule.funnel === 'undefined'
            || rule.funnel === false
        ) {

            // add to error array
            this._addFailedRule(rule)
        }

        // if the rule has the <blocking> boolean set
        if (rule.blocking) {

            // set the <_blocked> property for this recursion
            this._blocked = true;
        }

        // filter callback (regardless of the instances <blocked> property)
        callback();
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
         * the Array.clone method allowing undefined properties to be cloned
         * (which results in an empty array, anyway)
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
             * Match found (eg. the parameter should be replaced with an inputs
             * value)
             */
            if (match) {
                if (typeof self._inputs[match[1]] !== 'undefined') {
                    params[x] = self._inputs[match[1]];
                } else {
/*
                    throw new Error(
                        'Input with name *' + param + '* could not be found.'
                    );
*/
                    params[x] = null;
                }
            }
        });

        // return the templated params for use in the actual validation flow
        return params;
    },

    /**
     * _addFailedRule
     * 
     * @protected
     * @param     Object rule
     * @return    void
     */
    _addFailedRule: function(rule) {
        this._failed.push(rule);
    },

    /**
     * getFailedRules
     * 
     * Returns the array of rules that failed.
     * 
     * @public
     * @return Array
     */
    getFailedRules: function() {
        return this._failed;
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
        this._rules = Array.clone(this._schema);

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
            if (this._failed.length === 0) {
                success.bind(this)()
            } else {
                failure.bind(this)();
            }
        }.bind(this);

        // begin recursive rule checking
        this._check(this._rules, callback);
    }
});
