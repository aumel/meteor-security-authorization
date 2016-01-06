
"use strict";

if (Meteor.isServer) {

  Meteor.users.remove({});

  // implement the voter for the test
  class BlogVoter extends AbstractVoter {
    constructor() {
      super();
      this.desc = 'blogVoter';
      this.VIEW = 'view';
      this.EDIT = 'edit';
    }

    // if the attribute isn't one we support, return false
    _supports(attribute, subject) {

      if ((attribute !== this.VIEW) &&
          (attribute !== this.EDIT)) {
        return false;
      }

      // only vote on Blog objects inside this voter
      if (false === (subject.getDomainObjectName() ===  'blogs')) {
        return false;
      }

      return true;
    }

    _voteOnAttribute(attribute, subject, user) {

      if (! user._id) {
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



  Meteor.methods({
    isGranted: function () {

      var blog = { text: 'test'};
      blog.getDomainObjectName = function () {
        return 'blogs';
      };

      var blogVoter = new BlogVoter();

      // We manage the voter in the method for the tests.
      // Info: voters can be managed outside methods.

      // Clean up all configuration from previous tests.
      SecurityAuthorization.removeAllVoters();
      SecurityAuthorization.addVoter(blogVoter);
      SecurityAuthorization.setStrategy(null);
      SecurityAuthorization.setAuthenticatedUser(null);

      return SecurityAuthorization.isGranted(['view'], blog);
    }

  });
}

if (Meteor.isClient) {
  Tinytest.addAsync('SecurityAuthorization - Meteor.user',
                    function (test, next) {
    // create user and log in
    Accounts.createUser({
      username: 'username',
      email: 'email@test.com',
      password: 'test'
    });

    Meteor.call("isGranted", function (error, result) {
      test.isTrue(result, 'The user can view the blog.');
      next();
    });

  });
}
