module.exports = function(app) {


  app.use("/users",require('./user/user')(app));


};