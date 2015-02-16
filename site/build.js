var metalSmith = require('metalsmith');

function titleToId(title) {
    return title.replace(/ /g, '-');
}

metalSmith(__dirname)
    .destination('../site-build')
    .source('src')
    .use(require('metalsmith-collections')({
        assertions: {
            pattern: 'assertions/*/*.md'
        },
        pages: {
            pattern: '*.md'
        }
    }))
    .use(require('metalsmith-static')({
        src: 'static',
        dest: 'static'
    }))
    // Dynamicly generate metadata for assertion files
    .use(function (files, metalsmith, next) {
        Object.keys(files).forEach(function (file) {
            if (files[file].collection.indexOf('assertions') !== -1) {
                // Set the template of all documents in the assertion collection

                var type = file.match(/^assertions\/([^\/]+)/)[1];
                var assertionName = file.match(/([^\/]+)\.md$/)[1];
                assertionName = titleToId(assertionName);

                files[file].template = 'assertion.ejs';
                files[file].name = assertionName;
                files[file].windowTitle = type + ' - ' + assertionName;
                files[file].type = type;

                if (!files[file].title) {
                    files[file].title = assertionName;
                }
                files[file].url = '/' + file.replace(/\.md$/, '/');
            } else {
                files[file].windowTitle = files[file].title;
            }
        });
        next();
    })
    .use(function (files, metalsmith, next) {
        var metadata = metalsmith.metadata();

        var assertionsByType = {};
        metadata.collections.assertions.forEach(function (assertion) {
            assertionsByType[assertion.type] = assertionsByType[assertion.type] || [];
            assertionsByType[assertion.type].push(assertion);
        });
        Object.keys(assertionsByType).forEach(function (type) {
            assertionsByType[type].sort(function (a, b) {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        });
        metadata.assertionsByType = assertionsByType;
        next();
    })
    .use(require('./metalsmith-unexpected-markdown')())
    // permalinks with no options will just make pretty urls...
    .use(require('metalsmith-permalinks')({ relative: false }))
    .use(function (files, metalsmith, next) {
        // Useful for debugging ;-)
        // require('uninspected').log(files);
        next();
    })
    .use(require('metalsmith-less')())
    .use(require('metalsmith-templates')('ejs'))
    .build(function (err) {
        if (err) { throw err; }
        console.log('wrote site to site-build');
    });
