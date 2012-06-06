JS-JSON-Validation
===
JS-JSON-Validation is a front-end validation framework. It validates a form by
evaluating a series of rules that are defined through an associated JSON file
(known as a `schema`).

Designed to work seamlessly (but requiring implementation attention) with the
[PHP-JSON-Validation](https://github.com/onassar/PHP-JSON-Validation) project.

### In-depth Examples
Which this page does contain an example, including the implementation of a
[SmartForm](https://github.com/onassar/JS-Form) instance, I've prepared in-depth
examples which can be seen here:  
https://github.com/onassar/JS-JSON-Validation/tree/master/example

The final example available through this page presents a realistic example; a
comment form which prompts a user for their name, email, website, comments and
whether they want to subscribe to email updates for this page.

It highlights sub-rules, funnels and blocking rules, along with a variety of
validation rule types and error messaging.

### Public Methods
A `SchemaValidator` instance has only two publicly accessible methods:

- `validate`

  Requires `success` and `failure` functions to be passed in, which respectively
  get executed after the form rules have been executed.
- `getFailedRules`

  Returns an array of all the rules which have failed. The result of this
  depends on whether a `blocking` rule failed in a rule-stack (see below for
  more information on `blocking` rules).

### Validation Pieces
In order for a form to be successfully validated, it's schema must have all it's
rules successfully validated (with the exception of rules which are marked as a
`funnel`). This is a recursive requirement for all rules which themselves have
sub-rules as well.

There are 5 properties that are useful when creating rules for a schema. They
are:

* `validator` (required)
* `params` (optional)
* `blocking` (optional)
* `rules` (optional)
* `funnel` (optional)

To save on redundancy, and keep documentation on them normalized, please check
out the
[Validation Pieces](https://github.com/onassar/PHP-JSON-Validation#validation-pieces)
section on the
[PHP-JSON-Validation](https://github.com/onassar/PHP-JSON-Validation) project.

There is one other property, the `error` property, which while not used by the
validation engine, is suggested in order to develop a more useful error
validation flow.

### SmartForm Example

The following illustrates the validation of a form through the usage of
`SmartForm` instance. A `SmartForm` instance is created whereby the `presubmit`
property passed in contains the validation flow.

This flow overrides the default where the `presubmit` `callback` method is
immediately triggered. Alternatively, it creates a `SchemaValidator` instance,
passing in a `schema` array and `inputs` object.

Following this, the validator fires off the `validate` method which accepts two
functions. One which is executed upon successful validation (which simply
executes the default `callback` parameter), and one which is executed upon
failure (which in this case retrieves the failed rules, alerts the message from
the schema, focuses on the input, and re-enables the form to be submittable
again through the `SmartForm` instance).

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
