
"use strict";

Tinytest.add('RoleVoter - vote', function (test) {

  var user = { _id:'john', roles: ['ROLE_ADMIN', 'ROLE_MODERATOR'] };
  var roleVoter = new RoleVoter();

  test.throws(function () {
    roleVoter.vote(user, null, 'view');
  }, 'Attributes must be an array.');

  test.equal(
    roleVoter.vote(user, null, ['ROLE_ADMIN']),
    1,
    'The vote function returns value of ACCESS_GRANTED.');

  test.equal(
    roleVoter.vote(user, null, ['ROLE_MODERATOR']),
    1,
    'The vote function returns value of ACCESS_GRANTED.');

  test.equal(
    roleVoter.vote(user, null, ['ROLE_MEMBER']),
    -1,
    'The vote function returns value of ACCESS_DENY.');

  test.equal(
    roleVoter.vote(user, null, ['not-a-role']),
    0,
    'The vote function returns value of ACCESS_ABSTAIN.');

  // Group not supported by RoleVoter
  user = { _id:'john', roles: { 'group': ['ROLE_ADMIN']} };

  test.equal(
    roleVoter.vote(user, null, ['ROLE_ADMIN']),
    -1,
    'RoleVoter does not support group.');


});

Tinytest.add('RoleVoter - checking role inside voter', function (test) {
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
          return this._canView(user);
        case this.EDIT:
          return false;
      }

      throw new Meteor.Error(
        'logic-exception',
        'This code should not be reached!');

    }

    _canView(user) {
      // A user with ROLE_ADMIN can always view all posts
      if (SecurityAuthorization.isGranted(['ROLE_ADMIN'], null, user)) {
          return true;
      }

      return false;
    }
  }

  var postVoter = new PostVoter();
  var post = { text: 'test'};
  post.getDomainObjectName = function () {
    return 'posts';
  };

  var user = { username: 'test', roles: ['ROLE_ADMIN']};

  // For tests be sure RoleVoter is added.
  SecurityAuthorization.removeAllVoters();
  SecurityAuthorization.addRoleVoter();
  SecurityAuthorization.addVoter(postVoter);

  test.isTrue(
    SecurityAuthorization.isGranted(['view'], post, user),
    'A user with ROLE_ADMIN can always view all posts.');
});
