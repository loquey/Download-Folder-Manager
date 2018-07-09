

function Group(opts) {
    if (opts == undefined || opts == null) {
        throw "Invalid group object";
    }

    if (opts.groupName == undefined || opts.directory == undefined || !Array.isArray(opts.extensionList)) {
        throw "Invalid group object, misssing group data";
    }

    this.groupName = opts.groupName;
    this.extensionList = opts.extensionList;
    this.directory = opts.directory;
}

// Group.prototype.directory = function (extension) {
//     return this.directory.includes(extension);
// }

// Group.prototype.groupName = function (extension) {
//     return this.groupName;
// }

Group.prototype.hasExtension = function (extension) {
    return this.extensionList.includes(extension);
}

Group.prototype.directory = function() {
    return this.directory;
}

Group.prototype.groupName = function() {
    return this.groupName;
}


Group.prototype.addExtension = function (extension) {
    if (this.hasExtension(extension)) 
        return false;
    this.extensionList.push(extension);
    return true;
}

Group.prototype.addExtensions = function (extensions) {
    this.extensionList = this.extensionList.concat(extensions);
}

Group.prototype.removeExtension = function (extension) {
    if (this.extensionList.length == 1)
        return false
    this.extensionList.splice(this.extensionList.indexOf(extension), 1);
    return true;
}

Group.prototype.extensions = function (converter) {
    if (converter != undefined) {
        return this.extensionList.map(converter);
    }
    return this.extensionList.join(", ");

}