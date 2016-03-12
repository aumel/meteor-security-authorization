

# Upgrade

## Upgrade from 1.x to 2.x

  * `SecurityAuthorization.setAuthenticatedUser` has been removed from the API.
  * `SecurityAuthorization.isGranted` function accepts the user as an optional parameter when you don’t use the built-in accounts package of Meteor.
  * The ui-helper `isGranted` for Blaze has been removed.

**Note:** Thanks to [@monbro](https://github.com/monbro) for the enhancement about `setAuthenticatedUser`.
