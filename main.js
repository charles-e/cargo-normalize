var toml = require('toml');
var otoml = require('@iarna/toml');
var fs = require('fs');

let HOME = process.env.HOME;
let rawconfig = fs.readFileSync(`${HOME}/.config/cargoref.json`);
let config = JSON.parse(rawconfig);
//console.log(config);
let args = process.argv.slice(2);
//console.log(process.argv);
let do_mapping = (args[0] == "-m");
let path = do_mapping ? args[1] : args[0];
//console.log(`target: ${path}`);
let possibles = {};
for (c in config.crates) {
        let crate = config.crates[c];
        possibles[crate.name] = crate;
}

let new_path = (level, root, loc) => {
        let parts = [];
        for (var i = 0; i < level; i++) {
                parts.push('..');
        }
        parts.push(root);
        parts.push(loc);
        return parts.join("/");
}

let edit_toml = (toml_obj, level) => {
        // delete version and set path where necessary/
        for (crate in toml_obj.dependencies) {
                let hit = possibles[crate];
                let map_to = undefined;
                if (hit) {
                        if (do_mapping) {
                                map_to = hit.map;
                                hit = possibles[map_to];
                        }
                        let root = config.projects[hit.proj];
                        let path = new_path(level, root, hit.loc);
                        if (toml_obj["dependencies"][crate]["version"] != undefined) {
                                // explicit object
                                delete (toml_obj["dependencies"][crate]["version"]);
                                toml_obj["dependencies"][crate]["path"] = path;
                        } else {
                                // just a version string
                                toml_obj["dependencies"][crate] = { "path": path }
                        }
                        if (do_mapping) {
                                let temp = toml_obj["dependencies"][crate];
                                toml_obj["dependencies"][map_to] = temp;
                                delete (toml_obj["dependencies"][crate]);
                        }

                }

        }


        for (crate in toml_obj["dev-dependencies"]) {
                let map_to = undefined;

                let hit = possibles[crate];
                if (hit) {
                        if (do_mapping) {
                                map_to = hit.map;
                                hit = possibles[map_to];
                        }
                        // console.log(`${crate} loc=${hit.loc} level=${level}`);
                        let root = config.projects[hit.proj];
                        let path = new_path(level, root, hit.loc);
                        if (toml_obj["dev-dependencies"][crate]["version"] != undefined) {
                                // explicit object
                                delete (toml_obj["dev-dependencies"][crate]["version"]);
                                toml_obj["dev-dependencies"][crate]["path"] = path;
                        } else {
                                // just a version string
                                toml_obj["dev-dependencies"][crate] = { "path": path }
                        }
                        if (do_mapping) {
                                let temp = toml_obj["dev-dependencies"][crate];
                                toml_obj["dev-dependencies"][map_to] = temp;
                                delete (toml_obj["dev-dependencies"][crate]);
                        }
                }
        }
        return otoml.stringify(toml_obj)
}

let recurse_dir = (ppath, level) => {
        fs.readdir(ppath, function (err, items) {
                for (var i = 0; i < items.length; i++) {
                        var file = ppath + '/' + items[i];
                        //console.log("Start: " + file);

                        try {
                                let stats = fs.statSync(file);
                                let isFile = stats.isFile();
                                let isCargo = items[i] == "Cargo.toml";
                                if (isFile & isCargo) {
                                        try {
                                                let tomlStr = fs.readFileSync(file, "utf-8");
                                                console.log(file);

                                                let cargo = toml.parse(tomlStr);
                                                let new_toml = edit_toml(cargo, level);
                                                fs.writeFileSync(file, new_toml, "utf-8")
                                        }
                                        catch (e2) {
                                                console.log(e2);
                                        }

                                }
                                else if (stats.isDirectory()) {
                                        recurse_dir(file, level + 1);
                                }

                        } catch (err) {
                                console.log(`error ${err} editing ${file}`)
                        }
                }
        });

};
recurse_dir(path, 0);




