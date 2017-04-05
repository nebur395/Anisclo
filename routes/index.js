module.exports = function(app) {


  app.use("/users", require('./user/user')(app));
  app.use("/pois", require('./poi/poi')(app));


};
