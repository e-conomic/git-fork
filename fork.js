#!/usr/bin/env node

var fs = require('fs');
var proc = require('child_process');
var ghauth = require('ghauth');
var minimist = require('minimist');
var Github = require('github-api');

var onerror = function(err) {
	console.error(err.message || err);
	process.exit(2);
};

var onrepoerror = function(err) {
	if (err.error === 404) return onerror('Repository not found');
	onerror(err);
};

var ready = function(opts) {
	ghauth({
		configName: 'git-fork',
		scopes: ['repo'],
		note: 'This for easy forking on Github'
	}, function(err, result) {
		if (err) return onerror(err);

		var remote = 'https://'+result.token+':x-oauth-basic@github.com/'+opts.username+'/'+opts.repo+'.git';
		var forkedRemote = 'https://'+result.token+':x-oauth-basic@github.com/'+result.user+'/'+opts.repo+'.git';

		var github = new Github({
			token: result.token,
			auth: 'oauth'
		});

		var repo = github.getRepo(opts.username, opts.repo);

		var oncloned = function() {
			proc.spawn('git',  ['checkout', '-b', opts.branch, 'upstream/master'], {cwd:opts.cwd, stdio:'inherit'}).on('exit', function(code) {
				if (code) return process.exit(code);
				proc.spawn('git', ['push', '-u', 'origin', opts.branch], {stdio:'inherit', cwd:opts.cwd}).on('exit', function(code) {
					if (code) return process.exit(code);
					console.log('\nFeature branch for '+opts.branch+' setup in '+fs.realpathSync(opts.cwd));
					console.log('Create and push your changes. When you are ready go to:\n\n  https://github.com/'+result.user+'/'+opts.repo+'/tree/'+opts.branch+'\n\nand send a pull request.');
					process.exit(code);
				});
			});
		};

		var ensureUpstream = function(cb) {
			proc.spawn('git', ['remote', 'add', 'upstream', remote], {cwd:opts.cwd}).on('exit', cb);
		};

		var onpull = function() {
			ensureUpstream(function() {
				proc.spawn('git', ['fetch', 'upstream', 'master'], {stdio:'inherit', cwd:opts.cwd}).on('exit', function(code) {
					if (code) return process.exit(code);
					oncloned();
				});
			});
		};

		var onclone = function() {
			proc.spawn('git', ['clone', forkedRemote], {stdio:'inherit'}).on('exit', function(code) {
				if (code) return process.exit(code);
				onpull();
			});
		};

		repo.show(function(err) {
			if (err) return onrepoerror(err);

			repo.fork(function(err) {
				if (err) return onerror(err);
				if (fs.existsSync(opts.cwd)) onpull();
				else onclone();
			});
		});
	});
};

var parse = function(github, branch, cwd) {
	var repo = github.split('/')[1];
	var user = github.split('/')[0];

	ready({
		branch: branch,
		username: user,
		repo: repo,
		cwd: cwd || repo
	});
};

var findUpstream = function(cb) {
	proc.exec('git remote -v', function(err, stdout) {
		if (err) return cb(new Error('You need to be in a git repo if you do not provide the repo name'));

		var upstream = stdout.trim().split('\n').filter(function(line) {
			return line.indexOf('upstream') === 0;
		})[0];

		if (!upstream) return cb(new Error('No upstream remote set'));
		cb(null, upstream.split(/\s+/)[1].replace(/\.git$/, '').split('/').slice(-2).join('/'));
	});
};

var argv = minimist(process.argv);
var args = argv._.slice(2);

if (!args.length || (args[0].indexOf('/') > -1 && args.length < 2) || (args[0].indexOf('/') === -1 && args.length > 1)) {
	console.error('Usage: git-fork [username/repo]? [feature-branch]');
	process.exit(1);
}

findUpstream(function(err, upstream) {
	if (args.length === 1 && err) return onerror(err);
	if (args.length === 1) return parse(upstream, args[0], '.');

	if (upstream && args[0] !== upstream) return onerror('Upstream does not match current repository');
	if (upstream) return parse(upstream, args[1], '.');

	parse(args[0], args[1]);
});