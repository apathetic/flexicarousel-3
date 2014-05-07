/*global module:false*/
module.exports = function(grunt) {

	var port = grunt.option('port') || 8000;

	// Load all grunt-related tasks
	// require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
	grunt.loadNpmTasks( 'grunt-contrib-qunit' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-connect' );

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
					'* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
					' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
		},

		qunit: {
			files: ['test/**/*.html']
		},

		jshint: {
			options: {
				curly: true,
				// eqeqeq: true,
				// immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				globals: {
					'DocumentTouch': true
				}
				/*jslint eqeq:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */
			},
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
			/*jslint eqeq:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */
		},

		// concat: {
		// 	dist: {
		// 		src: [
		// 			'<banner:meta.banner>',
		// 			'src/<%= pkg.name %>.js'
		// 		],
		// 		dest: 'dist/<%= pkg.name %>.js'
		// 	},
		// 	jquery: {
		// 		src: [
		// 			'<banner:meta.banner>',
		// 			'src/<%= pkg.name %>.js',
		// 			'src/jquery.<%= pkg.name %>.js'
		// 		],
		// 		dest: 'dist/jquery.<%= pkg.name %>.js'
		// 	}
		// },

		// min: {
		// 	dist: {
		// 		src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
		// 		dest: 'dist/<%= pkg.name %>.min.js'
		// 	},
		// 	jquery: {
		// 		src: ['<banner:meta.banner>', '<config:concat.jquery.dest>'],
		// 		dest: 'dist/jquery.<%= pkg.name %>.min.js'
		// 	}
		// },

		uglify: {
			options: {
				banner: '<%= meta.banner %>\n'
			},
			build: {
				files: {
					'dist/jquery.<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js', 'src/jquery.<%= pkg.name %>.js'],
					'dist/<%= pkg.name %>.min.js': ['src/<%= pkg.name %>.js']
				}
			}
		},

		connect: {
			server: {
				options: {
					port: port,
					base: '.'
				}
			}
		},

		watch: {
			main: {
				files: [ 'Gruntfile.js', 'src/<%= pkg.name %>.js', 'src/jquery.<%= pkg.name %>.js', 'src/<%= pkg.name %>.css' ],
				tasks: 'default'
			}
		}

	});


	grunt.registerTask( 'default', [
		'jshint',
		'uglify',
		'qunit'
	]);

	grunt.registerTask('build', [
		'jshint',
		// 'qunit',
		// 'concat',		// update these to uglify
		// 'min'			// ....
		'uglify'
	]);

	grunt.registerTask('test', [
		'jshint',
		'qunit'
	]);

	grunt.registerTask('serve', [
		'connect',
		'watch'
	]);

};
