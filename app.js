
/**
 * Module dependencies.
 */

var nconf = require('nconf');
  
// First consider commandline arguments and environment variables, respectively.
nconf.argv().env();

// Then load configuration from a designated file.
nconf.file({ file: './config.json' });

// Provide default values for settings not provided above.
nconf.defaults({
    'password' : 'password'
    , 'callbackurl' : 'http://localhost:18788/'
    , 'http': {
        'port': 3000
        , 'secret' : 'your secret here'
    }
});

var express = require('express')
  , engine = require('ejs-locals')
  , routes = require('./routes')
  , user = require('./routes/user')
  , shoppingRoutes = require('./routes/shopping')
  , api = require('./routes/api')
  , http = require('http')
  , path = require('path')
  , fs    = require('fs')
  //, repository    = require('./repository')
  , repositoryProfile    = require('./repository/profile')
  , passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

passport.use(new GoogleStrategy({
    returnURL: nconf.get('callbackurl') + 'auth/google/return',
    realm: nconf.get('callbackurl')
},
  function (identifier, profile, done) {
      console.log(profile);
      repositoryProfile.FindOrCreate(
        {
      	    'username': profile.emails[0].value
      		, 'email': profile.emails[0].value
      		, 'name': profile.displayName
      		, 'firstname': profile.name.givenName
      		, 'lastname': profile.name.familyName
      	}
      	, function (err, user) {
      	    console.log(user);
      	    done(err, user);
      	}
      );
      /*repository.UserFindOrCreate(
      	{
      	    'username': profile.emails[0].value
      		, 'email': profile.emails[0].value
      		, 'name': profile.displayName
      		, 'firstname': profile.name.givenName
      		, 'lastname': profile.name.familyName
      	}
      	, function (err, user) {
      	    console.log(user);
      	    done(err, user);
      	});*/
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.username);
});

passport.deserializeUser(function (id, done) {
    repositoryProfile.FindByID(id, function (err, user) {
        //console.log(user);
        done(err, user);
    });
    /* repository.UserFindByUserName(id, function (err, user) {
        console.log(user);
        done(err, user);
    }); */
});

var app = express();

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
    app.use(passport.initialize());
    app.use(passport.session());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', ensureAuthenticated, routes.index);
app.get('/app', ensureAuthenticated, routes.app);
app.get('/user', ensureAuthenticated, routes.user);
app.get('/about', ensureAuthenticated, routes.about);

app.get('/shopping', ensureAuthenticated, shoppingRoutes.need);
app.get('/shopping/add', ensureAuthenticated, shoppingRoutes.add);

app.get('/login', routes.login);
app.get('/logout', routes.logout);
app.get('/styleguide', routes.styleguide);

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return', passport.authenticate('google', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/users', user.list);
app.get('/api/vents', api.vents);
app.post('/api/vents', api.ventAdd);
app.get('/api/organisations', api.organisations);
app.get('/api/organisation/:id', api.organisation);
app.get('/api/profile', api.profile);
app.put('/api/profile', api.profileEdit);
app.get('/configuration', routes.configuration);
app.post('/configuration/login', routes.configurationLogin);
app.post('/configuration', routes.configurationPost);
app.get('/configuration/logout', routes.congifurationLogout)

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
