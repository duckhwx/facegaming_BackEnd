module.exports = {
    "extends": "airbnb-base",
    rules: {
        // allow async-await
        'generator-star-spacing': 'off',
        'no-tabs': 'off',
        'indent': [2, 'tab'],
        "linebreak-style": 0,
        "global-require": 0,
        "eslint linebreak-style": [0, "error", "windows"],
        'max-len': [1, 150, 2, {
            'ignoreComments': true
        }],
    }
};