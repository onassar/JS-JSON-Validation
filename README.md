JS-JSON-Validation
===
JS-JSON-Validation is a front-end validation framework. It validates a form by
evaluating a series of rules that are defined through an associated JSON file.

### Public Methods
A `SchemaValidator` instance has only two publicly accessible methods:

- validate

  Requires `success` and `failure` functions to be passed in, which get respectively get executed after the form rules have been executed.
- getFailedRules

  Returns an array of all the rules which have failed. The result of this depends on whether a 'blocking' rule failed in a rule-stack (see below for more information on `blocking` rules).
    

### SmartForm Example

The following illustrates the validation of a form through the usage of  `SmartForm` instance. A `SmartForm` instance is created whereby the `presubmit` property passed in contains the validation flow.

This flow overrides the default where the `presubmit` `callback` method is immediately triggered. Alternatively, it creates a `SchemaValidator` instance, passing in a `schema` array and `inputs` object.

Following this, the validator fires off the `validate` method which accepts two functions. One which is executed upon successful validation (which simply executes the default `callback` parameter), and one which is executed upon failure (which in this case retrieves the failed rules, alerts the message from the schema, focuses on the input, and re-enables the form to be submittable again through the `SmartForm` instance).

``` javascript

var smartform = (new SmartForm(
    $('form-id'),
    {
        postsubmit: function() {
            alert('Form has been submitted.');
        },
        presubmit: function(callback) {

            // validation object
            var inputs = this.getInputs(),
                validator = (new SchemaValidator(
                    schema, inputs
                ));

            // validate
            validator.validate(
                function() {
                    callback();
                },
                function() {
                    var failed = this.getFailedRules()[0],
                        input = $('form-id').getElement('*[name=' + failed.error.input + ']');
                    alert(failed.error.message);
                    input.focus();
                    smartform.enable();
                }
            );
        }
    }
));


````
