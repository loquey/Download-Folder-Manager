function GroupMap(groups) {
    this.groups = groups;
}


GroupMap.prototype.load = function () {
    chrome.storage.sync.get("maps", function (items) {
        this.groups = this.groups.concat(items);
    });
}

GroupMap.prototype.save = function () {
    chrome.storage.sync.set({ "maps": this.groups }, function () {
        if (chrome.runtime.lastError != undefined) {
            console.log(runtime.lastError);
            return;
        }
        console.log("Maps save successful");
    })
}

GroupMap.prototype.search = function (fileExtension) {

    if (this.groups == null)
        return undefined;
    //checks the default groups for which the file extension belongs 
    return this.groups.find(function (group) {
        return group.hasExtension(fileExtension);
    });
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