/*
 * API.
 */
var gravatar = require('gravatar')
    , repository = require('../repository');
    //, tableRepository = require('../repository/tableStorageRepository');

exports.vents = function(req, res){
    repository.VentsFindAll(function(err, items){
        res.send(items);
    });
};

exports.ventAdd = function(req, res){
    repository.VentsAdd({'comment': req.body.comment, 'created': new Date()}, function(err, item){
        res.send(item);
    });
};

exports.organisations = function(req, res){
  res.send([
      {"name": "ACME", "slug":"acme" }, 
      {"name": "Fabrikam", "slug": "fabrikam" } 
  ]);
};

exports.organisation = function(req, res){
  res.send({"name": "ACME"});
};

exports.profile = function(req, res){
	var userName = req.user.username;
	repository.UserFindByUserName(userName, function(err, user){
    	user.gravatar = gravatar.url(user.email, {s: '45', r: 'pg', d: 'retro'});
    	user.gravaterlarge = gravatar.url(user.email, {s: '100', r: 'pg', d: 'retro'});
    	console.log(user);
    	res.send(user);
	});
};

exports.profileEdit = function(req, res){
	var userName = req.user.username;
	repository.UserUpdateByUserName(
		{
			'username': userName
			, 'firstname': req.body.firstname
			, 'lastname': req.body.lastname
			, 'name': req.body.name
		}
		, function(err, user){
			if (user)
			{	
    			user.gravatar = gravatar.url(user.email, {s: '45', r: 'pg', d: 'retro'});
    			user.gravaterlarge = gravatar.url(user.email, {s: '100', r: 'pg', d: 'retro'});
			}
    		res.send(user);
		}
	);
};