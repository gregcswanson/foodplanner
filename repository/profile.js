/* 
Use Azure Table Storage as the repository for all data
This module is only concerned with CRUD operations and not with any validations
*/

var azure = require('azure')
    , uuid = require('node-uuid')
    , nconf = require('nconf');

var axureStorageAccount = nconf.get('AZURE_STORAGE_ACCOUNT') || '';
var azureStorageKey = nconf.get('AZURE_STORAGE_ACCESS_KEY') || '';
var tableService = azure.createTableService(axureStorageAccount, azureStorageKey);

/*
https://www.windowsazure.com/en-us/develop/nodejs/how-to-guides/table-services
https://github.com/WindowsAzure/azure-sdk-for-node
*/

tableService.createTableIfNotExists('profiles', function (error) {
    if (error) {
        // Table exists or created
        console.log(error);
    } else {
        console.log('Azure table profiles ready');
    }
});

exports.FindOrCreate = function (item, callback) {
    var self = this;
    this.FindByID(item.username, function (error, profile) {
        if (error) {
            self.Add(item, function (error, profile) {
                callback(error, profile);
            });
        } else {
            callback(null, profile)
        }
    });
};

exports.FindByID = function (id, callback) {
    tableService.queryEntity('profiles', 'all', id, function (error, profile) {
        if (error) {
            callback(error, null);
        } else {
            var item = {
                username: id
                , email: profile.email
                , name: profile.name
                , firstname: profile.firstname
                , lastname: profile.lastname
                , created: profile.created
            };
            callback(null, item);
        }
    });
};

exports.Add = function (item, callback) {
    var profile = {
        PartitionKey: 'all'
        , RowKey: item.username
        , email: item.email
        , name: item.name
        , firstname: item.firstname
        , lastname: item.lastname
        , created: new Date()
    };
    tableService.insertEntity('profiles', profile, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Table storage profile added: ' + profile.RowKey);
            item.created = profile.created;
        }
        if (error) return callback(error, null);
        callback(null, item);
    });
};

exports.Update = function (item, callback) {
    var profile = {
        PartitionKey: 'all'
        , RowKey: item.username
        , email: item.email
        , name: item.name
        , firstname: item.firstname
        , lastname: item.lastname
    };
    tableService.mergeEntity('profiles', profile, function (error) {
        if (error) {
            console.log(error);
        } else {
            console.log('Table storage profile updated: ' + profile.RowKey);
        }
        if (error) return callback(error, null);
        callback(null, item);
    });
};

