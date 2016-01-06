
/**
 * RoleVoter votes if any attribute starts with a given prefix.
 *
 */
RoleVoter = class RoleVoter extends AbstractVoter {
  constructor(prefix = 'ROLE_') {
    super();

    this._prefix = prefix;
  }

  /**
   * Returns the vote for the given parameters.
   *
   * This function must return one of the following constants:
   * ACCESS_GRANTED, ACCESS_DENIED, or ACCESS_ABSTAIN.
   *
   * @param {Object} user       The user
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

    var result = this.ACCESS_ABSTAIN;
    var roles = this._extractRoles(user);

    for (var key in attributes) {
      if(! attributes.hasOwnProperty(key)) {
        continue;
      }

      var attribute = attributes[key];

      if (0 !== attribute.indexOf(this._prefix)) {
        continue;
      }

      result = this.ACCESS_DENIED;
      for (var i in roles) {
        if(! roles.hasOwnProperty(i)) {
          continue;
        }

        var role = roles[i];
        if (attribute === role) {
          return this.ACCESS_GRANTED;
        }
      }
    }

    return result;
  }


  _extractRoles(user) {
    if ('undefined' === user.roles ||
        false === (user.roles instanceof Array)) {
      return [];
    }

    return user.roles;
  }


};
