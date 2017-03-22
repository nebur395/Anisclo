'use strict';

// conf.js
exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['login-spec.js'],
    jasmineNodeOpts: {
        showColors: true
    }
};
