webpackJsonp([1],{

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

	module.exports = "I wrote an article on working with React JS in a browserify workflow. Well, I got some more experience with it and here is PART2. You can grab this boilerplate at [react-app-boilerplate](https://github.com/christianalfoni/react-app-boilerplate).\n\nThere were specifically two things we did not handle very well on the initial workflow:\n\n1. External dependencies\n2. Testing\n\n### External dependencies\nWhen browserify rebundles your project it goes through all the require statements in your application code and figures out what to put into your bundle. Luckily we have watchify that makes sure that it does not rebundle what it already has bundled, BUT browserify still goes through the files and figures out if something should be done. You might not notice this when only React JS is part of the bundle, but as you load up more dependencies it can take several seconds on each save and rebundle of your project.\n\nWhat we want to do is only touch these external dependencies once and never touch them again during the workflow session. You will not do any changes to React JS or underscore I suppose?\n\n### Testing\nThe initial version of this workflow used Karma for testing. Now Karma is great, but by including browserify as part of the testing it got very slow. By letting our current workflow bundle our tests with external dependencies and watchify we can make this a lot faster! It would also be nice that our tests run automatically when we do changes to our project.\n\n### Our Gulpfile.js\n```javascript\n// We need a bunch of dependencies, but they all do an important\n// part of this workflow\nvar gulp = require('gulp');\nvar source = require('vinyl-source-stream');\nvar browserify = require('browserify');\nvar watchify = require('watchify');\nvar reactify = require('reactify'); \nvar gulpif = require('gulp-if');\nvar uglify = require('gulp-uglify');\nvar streamify = require('gulp-streamify');\nvar notify = require('gulp-notify');\nvar concat = require('gulp-concat');\nvar cssmin = require('gulp-cssmin');\nvar gutil = require('gulp-util');\nvar shell = require('gulp-shell');\nvar glob = require('glob');\nvar livereload = require('gulp-livereload');\nvar jasminePhantomJs = require('gulp-jasmine2-phantomjs');\n\n// We create an array of dependencies. These are NPM modules you have\n// installed in node_modules. Think: \"require('react')\" or \"require('underscore')\"\nvar dependencies = [\n  'react' // react is part of this boilerplate\n];\n\n// Now this task both runs your workflow and deploys the code,\n// so you will see \"options.development\" being used to differenciate\n// what to do\nvar browserifyTask = function (options) {\n\n  /* First we define our application bundler. This bundle is the\n     files you create in the \"app\" folder */\n  var appBundler = browserify({\n    entries: [options.src], // The entry file, normally \"main.js\"\n        transform: [reactify], // Convert JSX style\n    debug: options.development, // Sourcemapping\n    cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify\n  });\n\n  /* We set our dependencies as externals of our app bundler.\n     For some reason it does not work to set these in the options above */\n  appBundler.external(options.development ? dependencies : []);\n  \n  /* This is the actual rebundle process of our application bundle. It produces\n    a \"main.js\" file in our \"build\" folder. */\n  var rebundle = function () {\n    var start = Date.now();\n    console.log('Building APP bundle');\n    appBundler.bundle()\n      .on('error', gutil.log)\n      .pipe(source('main.js'))\n      .pipe(gulpif(!options.development, streamify(uglify())))\n      .pipe(gulp.dest(options.dest))\n      .pipe(gulpif(options.development, livereload())) // It notifies livereload about a change if you use it\n      .pipe(notify(function () {\n        console.log('APP bundle built in ' + (Date.now() - start) + 'ms');\n      }));\n  };\n\n  /* When we are developing we want to watch for changes and\n    trigger a rebundle */\n  if (option.development) {\n    appBundler = watchify(appBundler);\n    appBundler.on('update', rebundle);\n  }\n  \n  // And trigger the initial bundling\n  rebundle();\n\n  if (options.development) {\n\n    // We need to find all our test files to pass to our test bundler\n    var testFiles = glob.sync('./specs/**/*-spec.js');\n    \n    /* This bundle will include all the test files and whatever modules\n       they require from the application */\n    var testBundler = browserify({\n      entries: testFiles,\n      debug: true,\n      transform: [reactify],\n      cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify\n    });\n\n    // Again we tell this bundle about our external dependencies\n    testBundler.external(dependencies);\n\n    /* Now this is the actual bundle process that ends up in a \"specs.js\" file\n      in our \"build\" folder */\n    var rebundleTests = function () {\n      var start = Date.now();\n      console.log('Building TEST bundle');\n      testBundler.bundle()\n        .on('error', gutil.log)\n        .pipe(source('specs.js'))\n        .pipe(gulp.dest(options.dest))\n        .pipe(livereload()) // Every time it rebundles it triggers livereload\n        .pipe(notify(function () {\n          console.log('TEST bundle built in ' + (Date.now() - start) + 'ms');\n        }));\n    };\n    \n    // We watch our test bundle\n    testBundler = watchify(testBundler);\n    \n    // We make sure it rebundles on file change\n    testBundler.on('update', rebundleTests);\n    \n    // Then we create the first bundle\n    rebundleTests();\n\n    /* And now we have to create our third bundle, which are our external dependencies,\n      or vendors. This is React JS, underscore, jQuery etc. We only do this when developing\n      as our deployed code will be one file with all application files and vendors */\n    var vendorsBundler = browserify({\n      debug: true, // It is nice to have sourcemapping when developing\n      require: dependencies\n    });\n    \n    /* We only run the vendor bundler once, as we do not care about changes here,\n      as there are none */\n    var start = new Date();\n    console.log('Building VENDORS bundle');\n    vendorsBundler.bundle()\n      .on('error', gutil.log)\n      .pipe(source('vendors.js'))\n      .pipe(gulpif(!options.development, streamify(uglify())))\n      .pipe(gulp.dest(options.dest))\n      .pipe(notify(function () {\n        console.log('VENDORS bundle built in ' + (Date.now() - start) + 'ms');\n      }));\n  }\n}\n\n// We also have a simple css task here that you can replace with\n// SaSS, Less or whatever\nvar cssTask = function (options) {\n    if (options.development) {\n      var run = function () {\n        gulp.src(options.src)\n          .pipe(concat('main.css'))\n          .pipe(gulp.dest(options.dest));\n      };\n      run();\n      gulp.watch(options.src, run);\n    } else {\n      gulp.src(options.src)\n        .pipe(concat('main.css'))\n        .pipe(cssmin())\n        .pipe(gulp.dest(options.dest));   \n    }\n}\n\n// Starts our development workflow\ngulp.task('default', function () {\n\n  browserifyTask({\n    development: true,\n    src: './app/main.js',\n    dest: './build'\n  });\n  \n  cssTask({\n    development: true,\n    src: './styles/**/*.css',\n    dest: './build'\n  });\n\n});\n\n// Deploys code to our \"dist\" folder\ngulp.task('deploy', function () {\n\n  browserifyTask({\n    development: false,\n    src: './app/main.js',\n    dest: './dist'\n  });\n  \n  cssTask({\n    development: false,\n    src: './styles/**/*.css',\n    dest: './dist'\n  });\n\n});\n\n// Runs the test with phantomJS and produces XML files\n// that can be used with f.ex. jenkins\ngulp.task('test', function () {\n    return gulp.src('./build/testrunner-phantomjs.html').pipe(jasminePhantomJs());\n});\n```\n\n### Getting in the flow\n\n1. Run `gulp`\n2. Start up a webservice in the \"build\" folder, f.ex. `python -m SimpleHTTPServer 3000`\n3. Go to \"localhost:3000\", here you will find your app\n4. Go to \"localhost:3000/testrunner.html\", here you will find your tests\n\nTo make **LiveReload** work you need to install an extension to Chrome, [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei). This puts a small button up in the right corner of your browser. When on you app and/or your tests, hit that button and you will see the little circle in the center will become a black dot. Now these pages will refresh on file changes either in your tests or application files... blazingly fast!\n"

/***/ }

});