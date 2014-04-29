# git-fork

Command line tool to fork and setup a feature branch for Github projects

	npm install -g git-fork

## Usage

Afterward to fork a github project to your Github account and setup a branch simply do

	git-fork username/repo feature-branch

If you want to add a new feature branch either run the command again or go to the repo and do

	git-fork new-feature-branch

The first time you run it it will ask for Github credentials that are used to generate a personal oauth token
which is stored in `~/.config/git-fork.json`. No credentials are stored.

It will setup up tracking for you so to push your changes to your fork you just need to
go to the local repo and do a `git push` from your branch.

The upstream repo that you forked from is added as the `upstream` remote

## License

MIT