
/**
 * AuthorizationChecker is the main authorization point of the
 * SecurityAuthorization.
 *
 * @param {Object}    user
 * @param {Object}    accessDecisionManager
 *
 * @throws no-user-found-exception, invalid-argument-exception
 *
 */
AuthorizationChecker = class AuthorizationChecker {
  constructor(accessDecisionManager, user = null) {

    if (accessDecisionManager.constructor.name !== 'AccessDecisionManager') {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'The accessDecisionManager must be an instance of '+
        'AccessDecisionManager.');
    }

    this._user = user;
    this._accessDecisionManager = accessDecisionManager;
  }

  /**
  * Checks if the attributes are granted against the current authenticated user
  * and optionally supplied object.
  *
  * @param {mixed}    attributes
  * @param {mixed}    object
  *
  *
  * @return {Boolean}
  */
  isGranted(attributes, object = null) {

    if (! (attributes instanceof Array)) {
      attributes = [attributes];
    }

    // Manage correctly the exception:
    // 'Meteor.userId can only be invoked in method calls.
    // Use this.userId in publish functions.'
    var userFromMeteor = null;
    try {
      userFromMeteor = Meteor.user();
    } catch (e) {
        if (null === this._user) {
          // if none authenticated user configured manually
          // and Meteor.userId invoked outside a method call,
          // an error is thrown.
          throw new Meteor.Error(
            'no-user-found-exception',
            'No user found. Maybe, "isGranted" function is used outside '+
            'a method call. Meteor.userId cannot be invoked.');
        }

    }

    // Check the authenticated user
    if (null === this._user && null !== userFromMeteor) {
      this._user = userFromMeteor;
    }

    if (null === this._user ||
        typeof this._user === 'undefined') {
      throw new Meteor.Error(
        'no-user-found-exception',
        'The user cannot be null.');
    }

    return this._accessDecisionManager.decide(this._user, attributes, object);
  }
};
