jwt = require('express-jwt');

module.exports = function jwtHandler(app){

// Middleware that add a route access check
    app.use(jwt({ secret: app.get('secret')})
        .unless({
            path:[  //Aqui se colocan rutas que no necesitan autenticación
                { url: "/users/", methods: ['POST']  },  // sign up
                { url: "/users/google", methods: ['POST']  },  // google sign up
                { url: "/users/login", methods: ['GET']  }  // Login
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
