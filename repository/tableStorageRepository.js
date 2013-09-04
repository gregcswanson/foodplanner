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
*/

tableService.createTableIfNotExists('vents', function (error) {
    if (error) {
        // Table exists or created
        console.log(error);
    } else {
        console.log('Azure table storage ready');
    }
});

exports.VentsFindAll = function (callback) {
    var query = azure.TableQuery
        .select()
        .from('vents')
        .where('PartitionKey eq ?', 'all');
    tableService.queryEntities(query, function (error, entities) {
        if (error) {
            callback(error, null);
        } else {
            console.log(entities);
            callback(null, entities);
        }
    });
    //db.collection('vents', function (err, collection) {
    //    collection.find({}).sort([['created', 'desc']]).toArray(function (err, items) {
    //        if (err) return callback(err, null);
    //        callback(null, items);
    //    });
    //});
};

exports.VentsAdd = function (item, callback) {
    var vent = {
        PartitionKey: 'all'
        , RowKey: uuid()
        , comment: item.comment
        , created: new Date()
    };
    tableService.insertEntity('vents', vent, function (error) {
        if (!error) {
            console.log(error);
        } else {
            console.log('Table storage vent added: ' + item.comment);
            item.id = vent.RowKey;
        }
        if (error) return callback(error, null);
        callback(null, item);
    });
};

