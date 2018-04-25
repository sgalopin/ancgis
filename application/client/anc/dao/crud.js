/**
 * Abstract data access object.
 * See http://api.jquery.com/category/deferred-object/
 */
module.exports = (function() {

  var me = {};

  // Create function
  me.createFeature = function (feature) {
    return me.createFeatureRemotly_(feature)
    .done(function(response) {
      if (response.status === 'success') {
        if (!feature.getId()) {
          feature.setId(response.data.id);
        }
        // TODO: Save locally into indexDB (sync = true)
      } else {
        // TODO: Display an error message
        // TODO: Save locally into indexDB (sync = false)
        // TODO: Make the synchronization with a web worker.
      }
    })
    .fail(function(err) {
      // TODO: Delete the db ?
      console.log(err);
    })
    .catch(function(err) {
      // TODO: Delete the db ?
      console.log(err);
    });
  };

  // Creates the feature remotly
  me.createFeatureRemotly_ = function (feature) {
    var dao = feature.getProperties().dao;
    return jQuery.ajax({
      url: dao.getUrl(),
      type: 'POST',
      data: JSON.stringify(dao.getData(feature)),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    });
  };

  // TODO: read function

  // Update function
  me.updateFeature = function (feature) {
    return me.updateFeatureRemotly_(feature)
    .done(function(response) {
      if (response.status === 'success') {
        if (!feature.getId()) {
          feature.setId(response.data.id);
        }
        // TODO: Save locally into indexDB (sync = true)
      } else {
        // TODO: Display an error message
        // TODO: Save locally into indexDB (sync = false)
        // TODO: Make the synchronization with a web worker.
      }
    })
    .fail(function(err) {
      // TODO: Delete the db ?
      console.log(err);
    })
    .catch(function(err) {
      // TODO: Delete the db ?
      console.log(err);
    });
  };

  // Updates the feature remotly
  me.updateFeatureRemotly_ = function (feature) {
    var dao = feature.getProperties().dao;
    return jQuery.ajax({
      url: dao.getUrl() + feature.getId(),
      type: 'PUT',
      data: JSON.stringify(dao.getData(feature)),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json'
    });
  };

  // Remove function
  me.removeFeature = function (feature) {
    return me.removeFeatureRemotly_(feature)
    .done(function(response) {
      if (response.status === 'success') {
        // TODO: Save locally into indexDB (sync = true)
        // TODO: Add a confirmation message popup
      } else {
        // TODO: Display an error message
        // TODO: Save locally into indexDB (sync = false)
        // TODO: Make the synchronization with a web worker.
      }
    })
    .fail(function(err) {
      console.log(err);
    })
    .catch(function(err) {
      console.log(err);
    });
  };

  // Removes the feature remotly
  me.removeFeatureRemotly_ = function (feature) {
    return jQuery.ajax({
      url: feature.getProperties().dao.getUrl() + feature.getId(),
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8'
    });
  };

  return me;
})();
