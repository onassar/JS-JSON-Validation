
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

