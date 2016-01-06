
"use strict";

Tinytest.add('AuthorizationChecker - constructor', function (test) {

  test.throws(function () {
    new SecurityAuthorization.AuthorizationChecker('invalid-manager');
  }, 'The accessDecisionManager must be an instance of AccessDecisionManager.');
});


Tinytest.add('AuthorizationChecker - isGranted', function (test) {

  class PostVoter extends AbstractVoter {
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

  var postVoter = new PostVoter();
  var post = { text: 'test'};
  post.getDomainObjectName = function () {
    return 'posts';
  };

  var accessDecisionManager = new SecurityAuthorization.AccessDecisionManager(
    [postVoter]
  );

  var authorizationChecker = new SecurityAuthorization.AuthorizationChecker(
    accessDecisionManager, 'user');

  test.isTrue(
    authorizationChecker.isGranted(['view'], post),
    'The function isGranted checks if user has the access to the object.');
});
