
"use strict";

if (Meteor.isClient) {

  Tinytest.add('UIHelpers - isGranted', function (test) {

    // implement the voter for the test
    class GenericVoter extends AbstractVoter {
      constructor() {
        super();
        this.desc = 'genericVoter';
        this.VIEW = 'view';
        this.EDIT = 'edit';
      }

      // if the attribute isn't one we support, return false
      _supports(attribute, subject) {

        if ((attribute !== this.VIEW) &&
            (attribute !== this.EDIT)) {
          return false;
        }

        // test hash object (object null)
        if (subject === null) {
          return false;
        }

        // grant access for all objects
        return true;
      }

      _voteOnAttribute(attribute, subject, user) {

        if (user._id !== 'john') {
          // the user must be logged in as john for this test
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

    var genericVoter = new GenericVoter();
    SecurityAuthorization.removeAllVoters();
    SecurityAuthorization.addVoter(genericVoter);

    var user = { _id: 'john'};
    var object = { text: 'test'};

    var invalidAttribute = { text: 'invalid'};

    test.isFalse(
      SecurityAuthorization._uiHelpers.isGranted(
        invalidAttribute , object, user),
      'The helper isGranted manages correctly invalid attribute.');

    var attribute = 'delete, view';

    test.isTrue(
      SecurityAuthorization._uiHelpers.isGranted(attribute, object, user),
      'The helper isGranted manages correctly comma and spaces.');

    test.equal(
      SecurityAuthorization._authenticatedUser._id,
      'john',
      'The helper isGranted manages correctly the user option.');

    // Blaze uses hash object for unspecified parameter in helper.
    object = { hash: {}};
    SecurityAuthorization.setAuthenticatedUser(null);
    test.isFalse(
      SecurityAuthorization._uiHelpers.isGranted(attribute, object),
      'isGranted with hash object from Blaze for object returns false.');

    object = { text: 'test'};
    user = { hash: {}};
    test.isFalse(
      SecurityAuthorization._uiHelpers.isGranted(attribute, object, user),
      'isGranted with hash object from Blaze for user returns false.');
  });
}
