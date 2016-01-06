
"use strict";

Tinytest.add('AbstractVoter - extends', function (test) {


  class PostVoter extends AbstractVoter {
    constructor() {
      super();

      this.test = 'postVoter';
    }
  }

  var postVoter = new PostVoter();

  test.isTrue(
    postVoter instanceof AbstractVoter,
    'The voter is an instance of AbstractVoter.');

  test.isTrue(
    typeof postVoter.vote === 'function',
    'The voter has a "vote" function.');

  test.isTrue(
    typeof postVoter._supports === 'function',
    'The voter has a "_supports" function.');

  test.isTrue(
    typeof postVoter._voteOnAttribute === 'function',
    'The voter has a "_voteOnAttribute" function.');

  test.throws(function () {
    postVoter._supports();
  }, '_supports method not implemented');

  test.throws(function () {
    postVoter._voteOnAttribute();
  }, '_voteOnAttribute method not implemented');
});

Tinytest.add('AbstractVoter - vote', function (test) {

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

  test.throws(function () {
    postVoter.vote('user', 'post', 'view');
  }, 'Attributes must be an array.');


  test.equal(
    postVoter.vote('user', post, ['view']),
    1,
    'The vote function returns value of ACCESS_GRANTED.');

  test.equal(
    postVoter.vote('user', post, ['edit']),
    -1,
    'The vote function returns value of ACCESS_DENIED.');

  test.equal(
    postVoter.vote('user', post, ['delete']),
    0,
    'The vote function returns value of ACCESS_ABSTAIN.');

  post.getDomainObjectName = function () {
    return 'other-posts';
  };

  test.equal(
    postVoter.vote('user', post, ['edit']),
    0,
    'The vote function returns value of ACCESS_ABSTAIN.');
});
