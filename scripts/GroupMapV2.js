class GroupMapV2 {

    constructor(options) {
        this._extensionMap = new Map();
        this._groups = new Map();

        if (Array.isArray(options.groupTypes)) {
            this.addGroupTypesToMap(options.groupTypes);
            return;
        }

        if (Array.isArray(options.groupObjects)) {
            this.addGroupObjectsToMap(options.groupObjects);
            return;
        }
        this.flattenGroups();
    }

    load(callback) {
        var groupMap = this;
        chrome.storage.sync.get("maps", function (items) {
            console.log(items);

            addGroupObjectsToMap(items.map);
            groupMap.flattenGroups();
            // groupMap.groups = items.maps.map(function (item, index) {
            //     return new Group(item);
            // });
            console.log(groupMap);

            if (callback != undefined && callback != null) {
                callback();
            }
        });
    }

    addGroupObjectsToMap(groupObjects) {
        groupObjects.forEach(group => {
            let tmpGroup = new Group(group);
            this._groups.set(tmpGroup.groupName(), tmpGroup);
        });
    }

    addGroupTypesToMap(groupTypes) {
        groupTypes.forEach(group => {
            this._groups.set(group.groupName(), group);
        })
    }

    save() {
        let groups = Array.from(this._groups.values());

        chrome.storage.sync.set({ "maps": groups }, function () {
            if (chrome.runtime.lastError != undefined) {
                console.log(runtime.lastError);
                return;
            }
            console.log("Maps save successful");
            debugSet();
        })
    }

    flattenGroups() {
        for (let group of this._groups.values()) {
            this.flattenGroup(group);
        }
        //flatten groupset to map
    }

    flattenGroup(group) {
        group.extensions().forEach(ext => {
            this._extensionMap.set(ext, group.directory());
        });
    }

    //search from flattened map 
    search(fileExtension) {

        if (this._groups == null)
            return undefined;
        //checks the default groups for which the file extension belongs 
        return this._extensionMap[fileExtension]

    }

    render(renderer) {
        let renderArray = [];
        this._groups.forEach((value, key, map) => {
            renderArray.push(renderer(value));
        })
        return renderArray;
    }

    //add group extensions to flattend structure 
    addGroup(group) {
        var found = this._groups[group.groupName()];

        if (found != undefined) {
            return false;
        }

        this._groups.set(group.groupName(), group);
        this.flattenGroup(group);
        return true;
    }

    //remove group extensions from flattened structure
    deleteGroup(options) {
        try {
            let groupName = options.groupName != undefined ? options.groupName : options.group.groupName();
            this._groups.delete(groupName);
        }
        catch (e) {
            console.log("Group deails not specified ");
            console.log(options);
            console.log(e);
        }
    }

    clear() {
        chrome.storage.sync.clear("maps");
    }

    debugSet() {
        chrome.storage.sync.get(null, function (items) {
            console.log(items);
        });
    }

    // findGroupIndex(groupName) {
    //     return this._groups.findIndex(function (iter) {
    //         return iter.groupName == groupName
    //     });
    // }

    // findGroup(groupName) {
    //     return this._groups.find(function (iter) {
    //         return iter.groupName == groupName
    //     });
    // }

    // replaceGroup(groupName, newGroup) {
    //     var oldGroupIndex = this.findGroupIndex(groupName);
    //     this._groups.splice(oldGroupIndex, 1, newGroup);
    // }

   
}




// getFileMap(file) {
//     if (this.groups.hasOwnProperty(file)) {
//         return this.groups[file];
//     }
//     return undefined;
// }

// initDefaultGroups() {
//     for (const key in this.defaultGroups) {
//         this.groups[key] = key;
//     }
// }