'use strict';

// conf.js
exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['login-spec.js','profile-spec.js', 'starter-spec.js',  'admin-spec.js'],
    jasmineNodeOpts: {
        showColors: true
    }
};
