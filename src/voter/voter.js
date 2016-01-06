

"use strict";

/**
 * AbstractVoter is an abstract default implementation of a voter.
 *
 */
AbstractVoter = class AbstractVoter {
  constructor() {
    this.ACCESS_GRANTED = 1;
    this.ACCESS_ABSTAIN = 0;
    this.ACCESS_DENIED = -1;
  }

  /**
   * Returns the vote for the given parameters.
   *
   * This function must return one of the following constants:
   * ACCESS_GRANTED, ACCESS_DENIED, or ACCESS_ABSTAIN.
   *
   * @param {Object} user       A TokenInterface instance
   * @param {mixed}  subject    The subject to secure
   * @param {Array}  attributes An array of attributes
   *
   * @return int either ACCESS_GRANTED, ACCESS_ABSTAIN, or ACCESS_DENIED
   */
  vote(user, subject, attributes) {

    if (false === attributes instanceof Array) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'Attributes must be an array.');
    }

    // abstain vote by default in case none of the attributes are supported
    var vote = this.ACCESS_ABSTAIN;

    for (var key in attributes) {
      if(! attributes.hasOwnProperty(key)) {
        continue;
      }

      var attribute = attributes[key];

      if (! this._supports(attribute, subject)) {
        continue;
      }

      // as soon as at least one attribute is supported,
      // default is to deny access
      vote = this.ACCESS_DENIED;

      if (this._voteOnAttribute(attribute, subject, user)) {
        // grant access as soon as at least one attribute returns
        // a positive response
        return this.ACCESS_GRANTED;
      }
    }

    return vote;
  }

  /**
   * Determines if the attribute and subject are supported by this voter.
   *
   * @param {String}  attribute An attribute
   * @param {Object}  subject   The subject to secure,
   *                            e.g. an object the user wants to access
   *
   * @return {Boolean}
   */
  /* jshint ignore:start */
  _supports(attribute, subject) {
    throw new Meteor.Error('_supports method not implemented');
  }
  /* jshint ignore:end */

  /**
   * Perform a single access check operation on
   * a given attribute, subject and user.
   *
   * @param {String}         attribute
   * @param {mixed}          subject
   * @param {Object}         user
   *
   * @return {Boolean}
   */
  /* jshint ignore:start */
  _voteOnAttribute(attribute, subject, user) {
    throw new Meteor.Error('_voteOnAttribute method not implemented');
  }
  /* jshint ignore:end */
};
