jwt = require('express-jwt');

module.exports = function jwtHandler(app){

// Middleware that add a route access check
    app.use(jwt({ secret: app.get('secret')})
        .unless({
            path:[  // Non-authorization routes
                { url: "/users/", methods: ['POST']  },  // sign up
                { url: "/users/google", methods: ['POST']  },  // google sign up
                { url: "/users/login", methods: ['GET']  },  // Login
                { url: "/users/retrievePass", methods: ['PUT']  },  // Retrieve password
                { url: /^\/users\/confirm\/[^\/]+$/, methods: ['GET']  },  // /users/confirm/{:email}
                { url: "/swagger.json", methods: ['GET']  },  // Swagger's JSON
                { url: "/api-docs/", methods: ['GET']  }  // Swagger's API Web
            ]}
        ));


// Middleware that manage JWT errors
    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send({
                "success": false,
                "message": "Token inválido o no existente. Por favor, envíe un token" +
                " correcto."
            });
        }
        else{
            next();
        }
    });
};
