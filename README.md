
# SecurityAuthorization for Meteor [![Build Status](https://travis-ci.org/aumel/meteor-security-authorization.svg)](https://travis-ci.org/aumel/meteor-security-authorization)

An authorization security system with voters for Meteor compatible with built-in accounts package and `alanning:roles` package.

It is inspired by the PHP Symfony framework and the Java Spring framework.

<a name="toc">
## Table of contents

* [Installation](#installation)
* [Overview](#overview)
* [How to use voters to check users permissions](#how-to-use-voters)
  * [Checking for access](#checking-access)
  * [Creating a custom voter](#creating-custom-voter)
  * [Configuring the voter](#configuring-voter)
  * [Checking for roles](#checking-for-roles)
  * [Changing the strategy](#changing-the-strategy)
* [How to use in the client-side](#how-to-use-client-side)
* [How to use your own user system](#how-to-use-your-own-user-system)
* [SecurityAuthorization API](#security-authorization-api)
* [Domain object name](#domain-object-name)
* [Contributing](#contributing)
* [Changelog](#changelog)
* [License](#license)

<a name="installation">
## Installation

```sh
$ meteor add aumel:security-authorization
```

`security-authorization` package is compatible with Meteor `v1.2.x`.


To set your authorization logic, you need ECMAScript 2015 features (e.g. class concept). By default, the `ecmascript` package is already installed when you create a new project with Meteor `v1.2.x`. If not, install it!

```sh
$ meteor add ecmascript
```


<a name="overview">
## Overview

SecurityAuthorization allows you to centralize your authorization logic. You can check the user permission to access data with custom voters.

All voters are called each time you use the `isGranted()` function of SecurityAuthorization. Each voter votes if the user should have access to some resource.

SecurityAuthorization polls all voters and decides to allow or deny access to the resource according to the strategy defined in the application. There are three strategies: *affirmative*, *consensus* or *unanimous*.

<a name="how-to-use-voters">
## How to use voters to check user permissions

For fine-grained restrictions, you must define custom voters, which are like simple conditional statements.

<a name="checking-access">
### Checking for access

Imagine you want to check if the current user can edit or view the object. In your `Meteor.methods`, you'll check access with code like this:

```js
Meteor.methods({
  showTask: function (id) {
    // get a Task object - e.g. query for it
    var task = Tasks.findOne(id);

    // check for "view" access: calls all voters
    if (false === SecurityAuthorization.isGranted('view', task)) {
      throw new Meteor.Error("not-authorized");
    }

    // ...
  },
  editTask: function (id) {
    // get a Task object - e.g. query for it
    var task = Tasks.findOne(id);

    // check for "edit" access: calls all voters
    if (false === SecurityAuthorization.isGranted('edit', task)) {
      throw new Meteor.Error("not-authorized");
    }

    // ...
  }
});
```

The function `isGranted` calls the voter system.
In the example, no voter is configured. But you can create your own voter that decides if the current user can *view* or *edit* using whatever logic you want.

<a name="creating-custom-voter">
### Creating a custom voter

Imagine, you want to define a specific logic. A user can always edit or view his own `Task`. If a `Task` is marked as "public", anyone can view it.

A custom voter needs to extend `AbstractVoter` class and override the two functions `_supports()` and `_voteOnAttribute`. The voter for the example would look like this:

```js
class TaskVoter extends AbstractVoter {
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

    // if no subject (null), return false
    if (null === subject) {
      return false;
    }

    // only vote on Task objects inside this voter

    // This assumes that the subject has a getDomainObjectName() function
    // to get the object name.
    // Read the section 'Domain object name' in the README for more information.
    if ('undefined' !== typeof subject &&
        'function'  === subject.getDomainObjectName &&
        'tasks' !== subject.getDomainObjectName()) {
      return false;
    }

    return true;
  }

  _voteOnAttribute(attribute, subject, user) {
    if (! user) {
      // the user must be logged in; if not, deny access
      return false;
    }

    var task = subject;

    switch (attribute) {
      case this.VIEW:
        return this._canView(task, user);
      case this.EDIT:
        return this._canEdit(task, user);
    }

    throw new Meteor.Error(
      'logic-exception',
      'This code should not be reached!');

  }

  _canView(task, user) {
    // if they can edit, they can view
    if (this._canEdit(task, user)) {
        return true;
    }

    // the Task object could have, for example, a isPublic() function
    // that checks a boolean public property
    return task.isPublic();
  }

  _canEdit(task, user) {
    // this assumes that the data object has a getOwner() function
    // to get the entity of the user who owns this data object
    return user._id === task.getOwner();
  }
}
```

There are two important functions in this code snippet `_supports()` and `_voteOnAttribute()`.

`_supports(attribute, subject)` function determines if the attribute (e.g. *ROLE_ADMIN*, *edit*) and subject (e.g. *null*, a *Task* object) are supported by this voter.

`_voteOnAttribute(attribute, subject, user)` function performs a single access check operation on a given attribute, subject and user. This function is called if `supports()` call returns true. The job of `_voteOnAttribute()` is: return true to allow access and false to deny access.

<a name="configuring-voter">
### Configuring the voter

After defining your voter, you must configure it. To do this, you add your voter to SecurityAuthorization with `addVoter()` call.

```js
// ...

var taskVoter = new TaskVoter();
SecurityAuthorization.addVoter(TaskVoter);

// ...
```

Now, when you call `isGranted()` with view/edit and a Task object, your voter will be executed and you can control access.

<a name="checking-for-roles">
### Checking for roles

SecurityAuthorization doesn't provide a role system but only a security authorization layer to check role.
By default, a `RoleVoter` is added to SecurityAuthorization for managing role.

Your role system must respect some rules to be compatible with `RoleVoter`:

* The user instance must have a roles property (i.e. `user.roles`).
* The `user.roles` must be an array (e.g. `['ROLE_ADMIN']`).
* A role must begin with a prefix `ROLE_` in uppercase.

**Note:** SecurityAuthorization is compatible with `alanning:roles` package. By default, `RoleVoter` doesn't manage the *'group'* feature provided by `alanning:roles` package, but you can implement a custom voter to achieve it.

In our previous example, you want to add new authorization logic. Now, a user with role `ROLE_ADMIN` can view and edit all tasks. To do this, you check only the role inside the voter in the `_canEdit()` function like this:
```js
// ...
class TaskVoter extends AbstractVoter {

  // Here same code from the previous example...

  _canEdit(task, user) {
    // ROLE_ADMIN can edit and view all tasks
    if (SecurityAuthorization.isGranted(['ROLE_ADMIN'])) {
      return true;
    }
    // this assumes that the data object has a getOwner() function
    // to get the entity of the user who owns this data object
    return user._id === task.getOwner();
  }
}
```

No need to modify another part of code from the previous example. The function `_canView()` calls `_canEdit()` function.




<a name="changing-the-strategy">
### Changing the strategy

Generally, only one voter will vote and others will abstain. But, other scenarios may occur with multiple voters. By example, you want to check if the user has the role `ROLE_MEMBER` with one voter and also if he is 18 years old with another voter.

To handle those scenarios, SecurityAuthorization needs to know which access decision strategy to apply.

There are three strategies:

* *affirmative*: Grants access if any voter returns an affirmative response.
* *consensus*: Grants access if there are more granted responses than denied responses.
* *unanimous*: Grants access if only grant (or abstain) votes were received.

By default, SecurityAuthorization is configured with an *affirmative* strategy. You can change the strategy with `setStrategy()` call.

```js
// ...

SecurityAuthorization.setStrategy('consensus');

// ...
```

<a name="how-to-use-client-side">
## How to use in the client-side

As the server-side, the client-side has access to all functions of SecurityAuthorization with the addition of a `isGranted` Blaze helper.

**IMPORTANT:** The access to sensitive data must always be controlled on the server-side. Any client-side helpers cannot be trusted. Those helpers can be used for accessing to some templates if the access to data is restricted to the server-side.


A user with `ROLE_ADMIN` can access to editor elements for all tasks:
```html
<template name="edit_task">
  {{#if isGranted 'ROLE_ADMIN'}}
    {{> editor}}  
  {{/if}}
</template>
```

A user with permissions *edit* on *Task* object can access to editor elements:
```html
<template name="edit_task">
  {{#if isGranted 'edit' task }}
    {{> editor}}
  {{/if}}
</template>
```

<a name="how-to-use-your-own-user-system">
## How to use your own user system

If you don't use the built-in accounts package of Meteor or if you use a Model layer over the `Meteor.user()`, SecurityAuthorization provides a solution to hold those situations.

If you have your own users system, add manually the authenticated user to SecurityAuthorization with `setAuthenticatedUser` function (server-side).

```js
SecurityAuthorization.setAuthenticatedUser(user);
```

For the client-side, you can add the user as parameter in the helper `isGranted`.

```html
<template name="edit_task">
  {{#if isGranted 'edit' task user }}
    {{> editor}}
  {{/if}}
</template>
```

**IMPORTANT:** The access to sensitive data must always be controlled on the server-side. Any client-side helpers cannot be trusted. Those helpers can be used for accessing to some templates if the access to data is restricted to the server-side.

<a name="security-authorization-api">
## SecurityAuthorization API

This describes the functions available for SecurityAuthorization.

### .setStrategy(strategy)

Set the strategy (*affirmative*, *consensus* or *unanimous*). By default, SecurityAuthorization is configured with the strategy *affirmative*.

```js
SecurityAuthorization.setStrategy('consensus');
```

### .addVoter(voter)

Add the voter to SecurityAuthorization. A voter must extend `AbstractVoter`.

```js
SecurityAuthorization.addVoter(yourVoter);
```


### .removeVoter(voter)

Remove the voter from SecurityAuthorization.

```js
SecurityAuthorization.removeVoter(yourVoter);
```

### .removeAllVoters()

Remove all voters from SecurityAuthorization. Be careful, this function also removes predefined voters (e.g. `RoleVoter`).

```js
SecurityAuthorization.removeAllVoter();
```

### .addRoleVoter()

Add the predefined `Rolevoter` to SecurityAuthorization. By default, this voter is already added. This function is defined for convenience.

```js
SecurityAuthorization.addVoter(yourVoter);
```


### .isGranted(attributes, object = null)

Checks if the attributes are granted against the current authenticated user
and optionally supplied object.

```js
SecurityAuthorization.isGranted('view', task);
```

### .setAuthenticatedUser(user)

Set the authenticated user if you don't use the built-in accounts package.

```js
SecurityAuthorization.setAuthenticatedUser(user);
```

<a name="domain-object-name">
## Domain object name

You must get the domain object name to determine which voter to apply.

There are two options to get the domain object name:

* using the class name from the class concept in ES6,
* implementing a `getDomainObjectName` function in the object (or document).

If you are using the class concept, get the domain object name with `object.constructor.name`.

If the object is not defined with the class concept from ES6, add a `getDomainObjectName` function in the object (or document). This function must return an unique  *'domain name'* string.

For documents, add the `getDomainObjectName` function using the `transform` function of `Mongo.Collection`.

```js
Tasks = new Mongo.Collection("tasks", {
  transform: function (doc) {
    // add getDomainObjectName to all documents
    // of the collection
    doc.getDomainObjectName = function () {
      // return the unique name of the collection
      return Tasks._name;
    };
    return doc;
  }
});
```

If you use a Model layer, you must extend the prototype with a `getDomainObjectName` function.

```js
Task = function (doc) {
  _.extend(this, doc);
};

Task.prototype = {
  constructor: Post,
  // add getDomainObjectName
  getDomainObjectName: function () {
    // return a unique domain name
    return 'Task';
    }
  }
};
```

<a name="contributing">
## Contributing

Please make sure to read the [Contributing Guide](CONTRIBUTING.md) before making a pull request.

<a name="changelog">
## Changelog

Details changes for each release are documented in the [CHANGELOG file](CHANGELOG.md).

<a name="License">
## License

SecurityAuthorization is released under the [MIT License](LICENSE).
