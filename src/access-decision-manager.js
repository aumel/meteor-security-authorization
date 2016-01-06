

/**
 * @summary Constructor for the `AccessDecisionManager` namespace.
 * @locus Server
 * @class AccessDecisionManager
 *
 * @param {Array}     voters                             An array of Voters
 * @param {String}    strategy                           The vote strategy
 * @param {Boolean}   allowIfAllAbstainDecisions         Whether to grant access
                                                         if all voters abstained
                                                         or not
 * @param {Boolean}   allowIfEqualGrantedDeniedDecisions Whether to grant access
                                                         if result are equals
 *
 * @throws invalid-argument-exception
 */
AccessDecisionManager = class AccessDecisionManager {
  constructor(voters = [], strategy = 'affirmative',
              allowIfAllAbstainDecisions = false,
              allowIfEqualGrantedDeniedDecisions = true) {

    const STRATEGY_AFFIRMATIVE = 'affirmative';
    const STRATEGY_CONSENSUS = 'consensus';
    const STRATEGY_UNANIMOUS = 'unanimous';

    if (false === voters instanceof Array) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'Voters must be an array.');
    }

    if (strategy !== STRATEGY_AFFIRMATIVE &&
        strategy !== STRATEGY_CONSENSUS &&
        strategy !== STRATEGY_UNANIMOUS) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'The "'+strategy+'" is not supported.');
    }

    if (false === (typeof allowIfAllAbstainDecisions === 'boolean')) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'allowIfAllAbstainDecisions  must be a boolean.');
    }

    if (false === (typeof allowIfEqualGrantedDeniedDecisions === 'boolean')) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'allowIfEqualGrantedDeniedDecisions must be a boolean.');
    }


    var strategyMethod = 'decide'+strategy.substring(0, 1).toUpperCase()+
                          strategy.substring(1).toLowerCase();
    this._strategy = strategyMethod;
    this._allowIfAllAbstainDecisions = allowIfAllAbstainDecisions;
    this._allowIfEqualGrantedDeniedDecisions =
      allowIfEqualGrantedDeniedDecisions;
    this._voters = voters;
  }

  /**
   * Configures the voters.
   *
   * @param {Array} voters   An array of Voters
   */
  setVoters(voters) {

    if (false === voters instanceof Array) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'Voters must be an array.');
    }

    voters.forEach(function (voter) {

      if (! (voter instanceof AbstractVoter)) {
        throw new Meteor.Error(
          'invalid-argument-exception',
          'The voter must inherit from AbstractVoter.');
      }
    });

    this._voters = voters;
  }

  /**
   * Decides whether the access is possible or not.
   *
   * @param {Object}  user
   * @param {Array}   attributes An array of attributes
   * @param {Object}  object     The object to secure
   *
   * @return {Boolean} true if the access is granted, false otherwise
   */
  decide(user, attributes, object = null) {

    if (typeof user === 'undefined') {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'The user cannot be undefined.');
    }

    if (false === attributes instanceof Array) {
      throw new Meteor.Error(
        'invalid-argument-exception',
        'Attributes must be an array.');
    }

    return this['_'+this._strategy](user, attributes, object);
  }

  /**
   * Grants access if any voter returns an affirmative response.
   *
   * If all voters abstained from voting, the decision will be based on the
   * allowIfAllAbstainDecisions property value (defaults to false).
   */
  _decideAffirmative(user, attributes, object = null) {
    var deny = 0;

    for (var key in this._voters) {
      if(! this._voters.hasOwnProperty(key)) {
        continue;
      }
      var voter = this._voters[key];
      var result = voter.vote(user, object, attributes);

      switch (result) {
        case voter.ACCESS_GRANTED:
          return true;
        case voter.ACCESS_DENIED:
          ++deny;
          break;
        default:
          break;
      }
    }

    if (deny > 0) {
      return false;
    }

    return this._allowIfAllAbstainDecisions;
  }

  /**
   * Grants access if there is consensus of granted against denied responses.
   *
   * Consensus means majority-rule (ignoring abstains) rather than unanimous
   * agreement (ignoring abstains). If you require unanimity, see
   * UnanimousBased.
   *
   * If there were an equal number of grant and deny votes, the decision will
   * be based on the allowIfEqualGrantedDeniedDecisions property value
   * (defaults to true).
   *
   * If all voters abstained from voting, the decision will be based on the
   * allowIfAllAbstainDecisions property value (defaults to false).
   */
  _decideConsensus(user, attributes, object = null) {
    var grant = 0;
    var deny = 0;

    for (var key in this._voters) {
      if(! this._voters.hasOwnProperty(key)) {
        continue;
      }
      var voter = this._voters[key];
      var result = voter.vote(user, object, attributes);

      switch (result) {
        case voter.ACCESS_GRANTED:
          ++grant;
          break;
        case voter.ACCESS_DENIED:
          ++deny;
          break;
        default:
          break;
      }
    }

    if (grant > deny) {
      return true;
    }

    if (deny > grant) {
      return false;
    }

    if (grant > 0) {
      return this._allowIfEqualGrantedDeniedDecisions;
    }

    return this._allowIfAllAbstainDecisions;
  }

  /**
   * Grants access if only grant (or abstain) votes were received.
   *
   * If all voters abstained from voting, the decision will be based on the
   * allowIfAllAbstainDecisions property value (defaults to false).
   */
  _decideUnanimous(user, attributes, object = null) {
    var grant = 0;

    for (var key in attributes) {
      if(! attributes.hasOwnProperty(key)) {
        continue;
      }

      var attribute = attributes[key];

      for (var i in this._voters) {
        if(! this._voters.hasOwnProperty(i)) {
          continue;
        }

        var voter = this._voters[i];
        var result = voter.vote(user, object, [attribute]);

        switch (result) {
          case voter.ACCESS_GRANTED:
            ++grant;
            break;
          case voter.ACCESS_DENIED:
            return false;
          default:
            break;
        }
      }
    }

    // no deny votes
    if (grant > 0) {
      return true;
    }

    return this._allowIfAllAbstainDecisions;
  }
};
