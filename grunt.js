/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:flexicarousel.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    concat: {
      dist: {
        src: [
			'<banner:meta.banner>',
			'src/flexicarousel.js'
		],
        dest: 'dist/<%= pkg.name %>.js'
      },
      jquery: {
        src: [
			'<banner:meta.banner>',
			'src/flexicarousel.js',
			'src/jquery.flexicarousel.js'
		],
        dest: 'dist/jquery.<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      jquery: {
        src: ['<banner:meta.banner>', '<config:concat.jquery.dest>'],
        dest: 'dist/jquery.<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
      // files: ['grunt.js', 'src/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
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
        browser: true

		/*jslint eqeq:true, browser:true, debug:true, evil:false, devel:true, smarttabs:true, immed:false */

      },
      globals: {
        // jQuery: true
      }
    },
    uglify: {}
  });

  grunt.registerTask('build', [
    'lint',
    // 'qunit',
    'concat',
    'min'
  ]);



};
