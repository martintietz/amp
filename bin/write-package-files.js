// re-writes dependencies in package.json of each module
// based on actual dependencies used.
var fs = require('fs');
var modules = require('../lib/get-packages')();
var size = require('../size');
var fixpack = require('fixpack');
var mainPack = require('../package.json');


modules.forEach(function (mod) {
    var result = {};
    var pack = mod.pack;

    mod.dependencies.forEach(function (dep) {
        result[dep] = '^1.0.0';
    });

    // maintain custom-set versions if they already exist
    for (var item in result) {
        if (pack.dependencies && pack.dependencies[item]) {
            result[item] = pack.dependencies[item];
        }
    }
    
    if (size(result)) {
        pack.dependencies = result;
    } else {
        delete pack.dependencies;
    }

    pack.name = mod.name;
    pack.main = mod.fileName;
    pack.description = mod.bareName + ' util function part of http://amp.ampersandjs.com.';
    pack.homepage = mod.docUrl;
    pack.bugs = 'https://github.com/ampersandjs/amp/issues';
    pack.keywords = [
        'amp', 
        'util',
        mod.category
    ];

    pack.repository = {
        type: 'git',
        url: 'git://github.com/ampersandjs/amp'
    };

    if (mod.requiresDom) {
        if (!pack.scripts) {
            pack.scripts = {};
        }
        if (!pack.devDependencies) {
            pack.devDependencies = {};
        }
        pack.scripts.test = 'browserify test.js | tape-run | tap-spec';
        pack.devDependencies.browserify = mainPack.dependencies.browserify;
        pack.devDependencies['tape-run'] = mainPack.dependencies['tape-run'];
        pack.devDependencies['tap-spec'] = mainPack.dependencies['tap-spec'];
    }

    fs.writeFileSync(mod.folder + '/package.json', JSON.stringify(pack, null, 2), 'utf8');

    fixpack(mod.folder + '/package.json');
}); 

