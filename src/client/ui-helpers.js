
"use strict";

/**
 * Helper functions for use on client.
 *
 * NOTE: The access to sensitive data must always be controlled on
 * the server-side. Any client-side helpers cannot be trusted.
 * But, those helpers can be used for accessing to some templates.
 *
 */

// Use a semi-private variable rather than declaring UI
// helpers directly so that we can unit test the helpers.
SecurityAuthorization._uiHelpers = {
  isGranted: function (attribute, object, user) {

    if (typeof attribute === 'undefined' ||
        typeof attribute !== 'string') {
      return false;
    }

    // Blaze uses hash object for unspecified parameter in helper.
    if (object !== null &&
        typeof object !== 'undefined' &&
        typeof object.hash !== 'undefined' &&
        Object.keys(object.hash).length === 0) {

      object = null;
      if (! Meteor.user()) {
        return false;
      }
    } else {
      if (user !== null &&
          typeof user !== 'undefined' &&
          typeof user.hash !== 'undefined' &&
          Object.keys(user.hash).length === 0) {
        if (! Meteor.user()) {
          return false;
        }
      } else {
        SecurityAuthorization.setAuthenticatedUser(user);
      }
    }

    var comma = (attribute || '').indexOf(',');
    var attributes = null;

    if (comma !== -1) {
      attribute = attribute.replace(/\s+/g, '');
      attributes = attribute.split(',');
    } else {
      attributes = attribute;
    }

    return SecurityAuthorization.isGranted(attributes, object);
  }
};

// If our app has a Blaze, register the {{isGranted}} global helpers.
if ('undefined' !== typeof Package.blaze &&
    'undefined' !== typeof Package.blaze.Blaze &&
    'undefined' !== typeof Package.blaze.Blaze.Template &&
    'function'  === typeof Package.blaze.Blaze.registerHelper) {
  /**
   * @global
   * @name  isGranted
   * @isHelper true
   * @summary Use `{{#if isGranted}}` to check whether the user is granted.
   *
   * @param {String} attribute or comma-seperated list of attributes
   * @param {Object} object Optional
   * @param {Object} user Optional
   *
   * @return {Boolean}
   */
  Package.blaze.Blaze.Template.registerHelper(
    'isGranted',
    SecurityAuthorization._uiHelpers.isGranted
  );
}
