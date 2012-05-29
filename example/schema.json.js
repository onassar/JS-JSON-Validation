
// email required
var sample = [
    {
        "validator": ["StringValidator", "email"],
        "params": ["{email}"],
        "error": {
            "input": "email",
            "message": "Please enter your email."
        }
    }
];

// no string required, but if provided, must be an email (funnel example)
var sample = [
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

// failsafe
var sample = [
    {
        "validator": ["StringValidator", "notEmpty"],
        "params": ["{email}"],
        "failsafe": true,
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
            "message": "Please enter a valid email."
        }
    }
];

// full schema with failsafe, sub-rule and funneling validation
var sample = [
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
        "validator": ["StringValidator", "empty"],
        "params": ["{email}"],
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
                    "input": "comment",
                    "message": "Email must be provided if you wish to receive email updates."
                }
            }

        ]
    }
];
