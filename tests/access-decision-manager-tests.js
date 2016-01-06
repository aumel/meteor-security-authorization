
"use strict";

Tinytest.add('AccessDecisionManager - constructor', function (test) {


  test.throws(function () {
    new SecurityAuthorization.AccessDecisionManager('invalid-voters');
  }, 'Voters must be an array.');

  test.throws(function () {
    new SecurityAuthorization.AccessDecisionManager([], 'invalid-strategy');
  }, 'The "invalid-strategy" is not supported.');

  test.throws(function () {
    new SecurityAuthorization.AccessDecisionManager([], 'affirmative',
                                                    'invalid');
  }, 'allowIfAllAbstainDecisions  must be a boolean.');

  test.throws(function () {
    new SecurityAuthorization.AccessDecisionManager([], 'affirmative',
                                                    false, 'invalid');
  }, 'allowIfEqualGrantedDeniedDecisions must be a boolean.');

  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager();

  test.equal(
    accessDecisionManager._strategy,
    'decideAffirmative',
    'By default, the method strategy is decideAffirmative.');

  test.throws(function () {
    new SecurityAuthorization.AccessDecisionManager([], 'invalid-strategy');
  }, 'The "invalid-strategy" is not supported.');



});

Tinytest.add('AccessDecisionManager - setVoters', function (test) {

  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager();


  test.throws(function () {
    accessDecisionManager.setVoters('invalid-voters');
  }, 'Voters must be an array.');

  var voters = ['invalid-voter'];
  test.throws(function () {
    accessDecisionManager.setVoters(voters);
  }, 'The voter must inherit from AbstractVoter.');

  class PostVoter extends AbstractVoter {
    constructor() {
      super();

      this.test = 'postVoter';
    }
  }

  var postVoter = new PostVoter();

  accessDecisionManager.setVoters([postVoter]);

  test.equal(
    accessDecisionManager._voters,
    [postVoter],
    'The function "setVoters" sets correctly the voters '+
    'for the AccessDecisionManager.');

});

Tinytest.add('AccessDecisionManager - decide', function (test) {

  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager();

  test.throws(function () {
    accessDecisionManager.decide();
  }, 'The user cannot be undefined.');

  test.throws(function () {
    accessDecisionManager.decide('user', 'invalid-attibutes');
  }, 'Attributes must be an array.');


});

Tinytest.add('AccessDecisionManager - _decideAffirmative', function (test) {

  class PostVoter1 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return true;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  class PostVoter2 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return false;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  var postVoter1 = new PostVoter1();
  var postVoter2 = new PostVoter2();
  var post = { text: 'test'};
  post.getDomainObjectName = function () {
    return 'posts';
  };

  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager();
  accessDecisionManager.setVoters([postVoter1, postVoter2]);

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    true,
    'The decide function returns true when one voter votes to grant access.');

  test.equal(
    accessDecisionManager.decide('user', ['edit'], post),
    false,
    'The decide function returns false when all voters vote to deny.');

  test.equal(
    accessDecisionManager.decide('user', ['delete'], post),
    false,
    'The decide function returns false when all voters vote to abstain.');

});

Tinytest.add('AccessDecisionManager - _decideConsensus', function (test) {

  class PostVoter1 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return true;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  class PostVoter2 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return false;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  var postVoter1 = new PostVoter1();
  var postVoter2 = new PostVoter2();
  var postVoter3 = new PostVoter1();
  var post = { text: 'test'};
  post.getDomainObjectName = function () {
    return 'posts';
  };


  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter1, postVoter2, postVoter3],
    'consensus'
  );

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    true,
    'The decide function returns true when majority of voter votes to grant.');

  postVoter3 = new PostVoter2();
  accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter1, postVoter2, postVoter3],
    'consensus'
  );

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    false,
    'The decide function returns false when majority of voter votes to deny.');

  accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter1, postVoter2],
    'consensus'
  );

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    true,
    'The decide function returns true when there are ' +
    'an equal number of grant and deny votes.');

  test.equal(
    accessDecisionManager.decide('user', ['delete'], post),
    false,
    'The decide function returns false when all abstain.');

});

Tinytest.add('AccessDecisionManager - _decideUnanimous', function (test) {

  class PostVoter1 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return true;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  class PostVoter2 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.VIEW:
          return false;
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  class PostVoter3 extends AbstractVoter {
    constructor() {
      super();

      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if (attribute !== this.EDIT) {
        return false;
      }

      // only vote on Post objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'posts')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user) {
        // the user must be logged in; if not, deny access
        return false;
      }

      switch (attribute) {
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }
  }

  var postVoter1 = new PostVoter1();
  var postVoter2 = new PostVoter1();
  var postVoter3 = new PostVoter3();
  var post = { text: 'test'};
  post.getDomainObjectName = function () {
    return 'posts';
  };


  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter1, postVoter2, postVoter3],
    'unanimous'
  );

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    true,
    'The decide function returns true when all voter votes to grant.');

  postVoter2 = new PostVoter2();
  accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter1, postVoter2, postVoter3],
    'unanimous'
  );

  test.equal(
    accessDecisionManager.decide('user', ['view'], post),
    false,
    'The decide function returns false when one voter votes to deny.');

  test.equal(
    accessDecisionManager.decide('user', ['delete'], post),
    false,
    'The decide function returns false when all voters vote to abstain.');

});
