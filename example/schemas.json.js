
// object to store validation schemas
var schemas = {};

/**
 * Simple
 *
 * A simple schema that requires an email to be specified in the <email> input.
 */
schemas.simple = [
    {
        "validator": ["StringValidator", "email"],
        "params": ["{email}"],
        "error": {
            "input": "email",
            "message": "Please enter your email."
        }
    }
];

/**
 * Funnel
 * 
 * A schema whereby if the <email> input is not empty, it then performs a check
 * against it to ensure that it's a valid email. It funnels the second request
 * through the first.
 * 
 * If the first fails, the form has still been successfully validated.
 */
schemas.funnel = [
    {
        "validator": ["StringValidator", "notEmpty"],
        "params": ["{email}"],
        "funnel": true,
        "rules": [{
            "validator": ["StringValidator", "email"],
            "params": ["{email}"],
            "error": {
                "input": "email",
                "message": "Please enter your email."
            }
        }]
    }
];

/**
 * Failsafe
 * 
 * Schema whereby the first rule is marked as <failsafe>. This implies that if
 * the rule does not pass, subsequent rules in that iteration should not be
 * checked.
 * 
 * The method <getFailedRules> will only return an array of failed rules up
 * until one which failed and is marked as a <failsafe>.
 */
schemas.failsafe = [
    {
        "validator": ["StringValidator", "notEmpty"],
        "failsafe": true,
        "params": ["{email}"],
        "error": {
            "input": "email",
            "message": "Please enter your email."
        }
    },
    {
        "validator": ["StringValidator", "email"],
        "params": ["{email}"],
        "error": {
            "input": "email",
            "message": "Please enter a valid email address."
        }
    }
];

/**
 * Nested
 * 
 * A nested schema example which highlights the failsafing option, but
 * demonstrates that rules within a seperate rule-chain/iteration are not
 * affected by a failsafe rule which failed.
 */
schemas.nested = [
    {
        "validator": ["StringValidator", "notEmpty"],
        "params": ["{email}"],
        "rules": [
            {
                "validator": ["StringValidator", "email"],
                "failsafe": true,
                "params": ["{email}"],
                "error": {
                    "input": "email",
                    "message": "Please enter a valid email address."
                }
            },
            {
                "validator": ["StringValidator", "equals"],
                "params": ["{email}", "oliver.nassar@facebook.com"],
                "error": {
                    "input": "email",
                    "message": "Please enter the email address: oliver.nassar@facebook.com"
                }
            }
        ],
        "error": {
            "input": "email",
            "message": "Please enter your email."
        }
    },
    {
        "validator": ["StringValidator", "equals"],
        "params": ["{email}", "onassar@gmail.com"],
        "error": {
            "input": "email",
            "message": "Please enter the email address: onassar@gmail.com"
        }
    }
];

/**
 * Full
 * 
 * A real-world example of a full schema (based on a comment form) which
 * includes the failsafe, sub-rule and funnel rule checks.
 */
schemas.full = [
    {
        "validator": ["StringValidator", "notEmpty"],
        "failsafe": true,
        "params": ["{name}"],
        "error": {
            "input": "name",
            "message": "Please enter your name."
        }
    },
    {
        "validator": ["StringValidator", "emptyOrEmail"],
        "params": ["{email}"],
        "error": {
            "input": "email",
            "message": "Please enter a valid email address."
        }
    },
    {
        "validator": ["StringValidator", "emptyOrUrl"],
        "params": ["{website}"],
        "error": {
            "input": "website",
            "message": "Please enter a valid website url."
        }
    },
    {
        "validator": ["StringValidator", "notEmpty"],
        "params": ["{comment}"],
        "rules": [
            {
                "validator": ["StringValidator", "maxLength"],
                "params": ["{comment}", 250],
                "error": {
                    "input": "comment",
                    "message": "Comments need to be limited to 250 characters."
                }
            }

        ],
        "error": {
            "input": "comment",
            "message": "Please enter a comment."
        }
    },
    {
        "validator": ["StringValidator", "equals"],
        "funnel": true,
        "params": ["{updates}", "true"],
        "rules": [
            {
                "validator": ["StringValidator", "email"],
                "params": ["{email}"],
                "error": {
                    "input": "email",
                    "message": "Email must be provided if you wish to receive email updates."
                }
            }

        ]
    }
];
