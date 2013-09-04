/* 
Use MONGODB as the repository for all data
This module is only concerned with CRUD operations and not with any validations
*/

var Db = require('mongodb').Db
 , Server = require('mongodb').Server
 , ObjectID = require('mongodb').ObjectID
 , nconf = require('nconf');

var db;
console.log(nconf.get('MONGO_DB_SERVER'));

var mongoServer = nconf.get('MONGO_DB_SERVER') || '';
var mongoPort = nconf.get('MONGO_DB_PORT') || '';
var mongoDatabase = nconf.get('MONGO_DB_DATABASE') || '';
var mongoUsername = nconf.get('MONGO_DB_USERNAME') || '';
var mongoPassword = nconf.get('MONGO_DB_PASSWORD') || '';

if (mongoServer === '') {
    console.log('connection settings to mongoDB have not been defined');
} else {

    var server = new Server(mongoServer, mongoPort, { auto_reconnect: true });
    db = new Db(mongoDatabase, server, { safe: false });

    db.open(function (err) {
        if (mongoUsername !== "") {
            db.authenticate(
            mongoUsername,
            mongoPassword,
            function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('connected to mongoDB (' + mongoServer + ', ' + mongoDatabase + ')');
                }
            }
        );
        }
    });
}

exports.UserFindOrCreate = function (loginDetails, callback) {
	db.collection('users', function(err, collection){
		console.log('finding user: ' + loginDetails.username);
		collection.find({ 'username': loginDetails.username }, { limit: 1 }).toArray(function (err, docs) {
            if (err) return callback(err, null);
            if (docs.length > 0) {
            	console.log('found user: ' + docs[0]);
                callback(null, docs[0]);
            } else {
            	console.log('creating new user');
                collection.insert(loginDetails, { safe: true }, function (err, result) {
            		if (err) return callback(err, null);
            		console.log('user created: ' + result[0]);
            		callback(null, result[0]);
        		});
            }
        });
	});
};

exports.UserFindByUserName = function (username, callback) {
	console.log('UserFindByUserName:' + username);
    db.collection('users', function(err, collection){
		collection.find({ 'username': username }, { limit: 1 }).toArray(function (err, docs) {
            if (err) return callback(err, null);
            if (docs.length > 0) {
                callback(null, docs[0]);
            } else {
            	console.log('not found');
                callback({'message' : 'Not Found' }, null);
            }
        });
	});
};

exports.UserUpdateByUserName = function(user, callback){
	// To Do : verify this is the current user
	console.log('update user');
	console.log(user);
    db.collection('users', function (err, collection) {
        collection.findAndModify({ 'username': user.username }, {}, { $set: { firstname: user.firstname, lastname: user.lastname, name: user.name} }, {new:true}, function (err, item) {
            if (err) return callback(err, null);
            callback(null, item);
        });
    });
};

exports.VentsFindAll = function (callback) {
    db.collection('vents', function (err, collection) {
        collection.find({}).sort([['created', 'desc']]).toArray(function (err, items) {
            if (err) return callback(err, null);
            callback(null, items);
        });
    });
};

exports.VentsAdd = function (item, callback) {
    db.collection('vents', function (err, collection) {
        collection.insert(item, { safe: true }, function (err, result) {
            if (err) return callback(err, null);
            callback(null, result);
        });
    });
};

exports.ProfileFindByID = function (id, callback) {
    db.collection('profiles', function (err, collection) {
        collection.find({ _id: new ObjectID(id) }, { limit: 1 }).toArray(function (err, docs) {
            if (err) return callback(err, null);
            if (docs.length > 0) {
                callback(null, docs[0]);
            } else {
                callback(null, {});
            }
        });
    });
};

exports.ProfileFindAll = function (callback) {
    db.collection('profiles', function (err, collection) {
        //collection.find({}).sort([['created', 'desc']]).toArray(function(err, docs) {
        collection.find({}).toArray(function (err, items) {
            if (err) return callback(err, null);
            callback(null, items);
        });
    });
};

exports.ProfileAdd = function (item, callback) {
    db.collection('profiles', function (err, collection) {
        collection.insert(item, { safe: true }, function (err, result) {
            if (err) return callback(err, null);
            callback(null, result);
        });
    });
};

exports.ProfileUpdate = function (blog, callback) {
    db.collection('profiles', function (err, collection) {
        collection.findAndModify({ _id: new ObjectID(blog._id) }, {}, { $set: { comment: blog.comment} }, {}, function (err, item) {
            if (err) return callback(err, null);
            callback(null, item);
        });
    });
};

exports.ProfileDelete = function (id, callback) {
    db.collection('profiles', function (err, collection) {
        collection.findAndModify({ _id: new ObjectID(id) }, {}, {}, { remove: true }, function (err, item) {
            if (err) return callback(err, null);
            console.log(item);
            callback(null, item);
        });
    });
};