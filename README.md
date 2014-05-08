# git-fork

Command line tool to fork and setup a feature branch for Github projects

	npm install -g git-fork

## Usage

Afterward to fork a github project to your Github account and setup a branch simply do

	git-fork username/repo feature-branch

If you want to add a new feature branch either run the command again or go to the repo and do

	git-fork new-feature-branch

After you have finished committing your changes you can do

  git-fork --pull-request

and the pull request screen window will be opened in your browser. You can also use the -p option as short for pull request.

The first time you run `git-fork` it will ask for Github credentials that are used to generate a personal oauth token
which is stored in `~/.config/git-fork.json`. No credentials are stored.

The upstream repo that you forked from is added as the `upstream` remote and your local master is updated with changes from `upstream/master` everytime you do a new fork.
When you do a fork it will setup tracking for you. To push your changes to your fork simply go to the local repo and do a `git push` from your branch.

## License

MIT
