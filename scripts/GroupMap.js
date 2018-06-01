function GroupMap(opts) {

    if (opts == undefined) {
        this.groups = [];
        return;
    }

    if (Array.isArray(opts.groupTypes)) {
        this.groups = opts.groupTypes;
        return;
    }

    if (Array.isArray(opts.groupObjects)) {
        this.groups = opts.groupObjects.map(function (item) {
            return new Group(item);
        });

        return;
    }
}

GroupMap.prototype.load = function (callback) {
    var groupMap = this;
    chrome.storage.sync.get("maps", function (items) {
        console.log(items);

        groupMap.groups = items.maps.map(function (item, index) {
            return new Group(item);
        });
        console.log(groupMap);
        
        if (callback != undefined && callback != null) {
            callback();
        }
    });
}

GroupMap.prototype.selfReference = function () {
    console.log(this);
    return this;
}

GroupMap.prototype.save = function () {
    chrome.storage.sync.set({ "maps": this.groups }, function () {
        if (chrome.runtime.lastError != undefined) {
            console.log(runtime.lastError);
            return;
        }
        console.log("Maps save successful");
        debugSet();
    })
}

function debugSet() {
    chrome.storage.sync.get(null, function (items) {
        console.log(items);
    });
}

GroupMap.prototype.search = function (fileExtension) {

    if (this.groups == null)
        return undefined;
    //checks the default groups for which the file extension belongs 
    return this.groups.find(function (group) {
        return group.hasExtension(fileExtension);
    });
}

GroupMap.prototype.render = function (renderer) {
    return this.groups.map(renderer);
}

GroupMap.prototype.addGroup = function (group) {
    var found = this.groups.find(function (iter) {
        return iter.groupName == group.groupName
    });

    if (found != undefined) {
        return false;
    }

    this.groups.push(group);
    return true;
}

GroupMap.prototype.deleteGroup = function (opts) {

    var index = null;
    if (opts.groupName != undefined) {
        index = this.findGroupIndex(opts.groupName);
    }

    if (opts.group != undefined) {
        index = this.findGroupIndex(opts.group.groupName);
    }
    this.groups.splice(index, 1);
}

GroupMap.prototype.findGroupIndex = function (groupName) {
    return this.groups.findIndex(function (iter) {
        return iter.groupName == groupName
    });
}

GroupMap.prototype.findGroup = function (groupName) {
    return this.groups.find(function (iter) {
        return iter.groupName == groupName
    });
}

GroupMap.prototype.replaceGroup = function (groupName, newGroup) {
    var oldGroupIndex = this.findGroupIndex(groupName);
    this.groups.splice(oldGroupIndex, 1, newGroup);
}

GroupMap.prototype.clear = function(){
    chrome.storage.sync.clear("maps");
}

// GroupMap.prototype.getFileMap = function (file) {
//     if (this.groups.hasOwnProperty(file)) {
//         return this.groups[file];
//     }
//     return undefined;
// }

// GroupMap.prototype.initDefaultGroups = function () {
//     for (const key in this.defaultGroups) {
//         this.groups[key] = key;
//     }
// }