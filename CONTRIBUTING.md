
# Contributing to SecurityAuthorization

Thank you for contributing to the project!

Before submitting your contribution though, please make sure to take a moment and read through the following guidelines.


## Issue reporting guidelines

- Try to search for your issue, it may have already been answered or even fixed in the master branch.
- Check if the issue is reproducible with the latest stable version of SecurityAuthorization.
- It is required that you clearly describe the steps necessary to reproduce the issue you are running into.
- If your issue is resolved but still open, don’t hesitate to close it. In case you found a solution by yourself, it could be helpful to explain how you fixed it.

## Pull request guidelines


- If you add new feature, provide convincing reason to add this feature. You should open a suggestion issue first to discuss about it before working on it.
- Create a topic branch (use a descriptive name for your branch i.e. `issue-xxxx` where xxxx is the issue number)
- Squash the commit if there are too many small ones.
- Follow the [Code style](#code-style).
- If you fix a bug or add new feature, test your changes.
- Make sure all tests have passed.
    * `meteor test-packages ./`
    * `jshint .` (code style)
- All the patches you are going to submit must be released under the MIT license.
- Before submitting your patch, rebase it.

<a name="code-style">
## Code style

Use JSHint to check the code style (read `.jshintrc` file).

JSHint is published to npm, the package manager for the Node.js. You may install JSHint globally using the following command:
```sh
$ npm install -g jshint
```

To check code style of SecurityAuthorization, use the following command:
```sh
$ jshint .
```
