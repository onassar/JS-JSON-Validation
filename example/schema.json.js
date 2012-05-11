[
    {
        "validator": ["StringValidator", "notEmpty"],
        "failsafe": false,
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
            "message": "Please enter your website's url."
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
                    "input": "comment",
                    "message": "Email must be provided if you wish to receive email updates."
                }
            }

        ]
    }
]