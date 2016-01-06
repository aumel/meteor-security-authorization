
/**
 * @summary Constructor SecurityAuthorizationServer namespace on the server.
 *
 * @extends SecurityAuthorizationCommon
 */
SecurityAuthorizationServer =
  class SecurityAuthorizationServer extends SecurityAuthorizationCommon {

  constructor() {
    super();
  }
};

// For tests only
// jshint ignore: start
var Sp = SecurityAuthorizationServer.prototype;
Sp.AccessDecisionManager = AccessDecisionManager;
Sp.AuthorizationChecker = AuthorizationChecker;
// jshint ignore: end
