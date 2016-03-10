
"use strict";

Tinytest.add('SecurityAuthorization - constructor', function (test) {

  test.isTrue(
    SecurityAuthorization._voters[0].constructor.name === 'RoleVoter',
    'By default, a roleVoter is added.');
});

Tinytest.add('SecurityAuthorization - setStrategy', function (test) {

  SecurityAuthorization.setStrategy('strategy');

  test.equal(
    SecurityAuthorization._strategy,
    'strategy',
    'The function setStrategy sets the _strategy.');
});

Tinytest.add('SecurityAuthorization - add/removeVoter', function (test) {

  // we remove all voters from previous tests
  SecurityAuthorization.removeAllVoters();

  class PostVoter extends AbstractVoter {
    constructor() {
      super();

      this.test = 'postVoter';
    }
  }

  class BlogVoter extends AbstractVoter {
    constructor() {
      super();

      this.test = 'blogVoter';
    }
  }

  var postVoter = new PostVoter();
  SecurityAuthorization.addVoter(postVoter);
  test.equal(
    SecurityAuthorization._voters[0].test,
    'postVoter',
    'The function addVoter adds the voter to the _voters array.');

  var blogVoter = new BlogVoter();
  SecurityAuthorization.addVoter(blogVoter);
  test.equal(
    SecurityAuthorization._voters.length,
    2,
    'The function addVoter adds the voter to the _voters array.');

  SecurityAuthorization.removeVoter(blogVoter);
  test.equal(
    SecurityAuthorization._voters.length,
    1,
    'The function removeVoter removes the voter from _voters array.');
  test.equal(
    SecurityAuthorization._voters[0].test,
    'postVoter',
    'The function removeVoter removes the voter from _voters array.');


  SecurityAuthorization.removeVoter(postVoter);
  test.equal(
    SecurityAuthorization._voters.length,
    0,
    'The function removeAllVoters removes all the voters from _voters array.');
});

Tinytest.add('SecurityAuthorization - addRoleVoter', function (test) {
  SecurityAuthorization.removeAllVoters();

  SecurityAuthorization.addRoleVoter();
  test.isTrue(
    SecurityAuthorization._voters[0].constructor.name === 'RoleVoter',
    'The function addRoleVoter add a RoleVoter to _voters array.');

});

Tinytest.add('SecurityAuthorization - isGranted', function (test) {

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

  var user = { username: 'test'};

  SecurityAuthorization.addVoter(postVoter);
  SecurityAuthorization.setStrategy(null);

  test.throws(function () {
    SecurityAuthorization.isGranted(['view'], post);
  }, 'No user found. Maybe, "isGranted" function is used outside ' +
     'a method call. Meteor.userId cannot be invoked.');

  test.isTrue(
    SecurityAuthorization.isGranted(['view'], post, user),
    'The function isGranted checks if user has the access to the object.');

  SecurityAuthorization.removeVoter(postVoter);
});
