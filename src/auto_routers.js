/**
 * Created by Administrator on 2015/10/12.
 */
var _file = require('fs');
var _path = require('path');
function AutoRequire(router, dir) {
    var files = [];
    dir = dir || __dirname;
    var init_dir_len = dir.length;
    var getAllFiles = function (dir, parent_dir) {
        parent_dir = parent_dir || '';
        var fs = _file.readdirSync(dir), temp_name = '', temp_path = '';
        fs.forEach(function (e) {
            if (e.indexOf('auto_routes.js') !== -1 || e.indexOf('index.js') !== -1) {
                return;
            }
            if (e.indexOf('.') === -1) {
                return getAllFiles(_path.join(dir, '/', e), e);
            }
            temp_name = e.split('.')[0];
            temp_path = dir.substr(init_dir_len).replace('\\','/').replace('\\','/');
            parent_dir && (temp_name = temp_path + '/' + temp_name);
            files.push({file: _path.join(dir, '/', e), name: temp_name});
        });
    };
    var loadModules = function () {
        files.forEach(function (e) {
            router.use(e.name, require(e.file));
        });
    };
    getAllFiles(dir);
    loadModules();
}

module.exports = AutoRequire;