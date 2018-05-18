

function Group(groupName, directory) {
    this.groupName = groupName;
    this.extentionsList = [];
    this.directory = directory;
}

Group.prototype.hasExtension = function (extension) {
    console.log(this.extentionsList.includes(extension));
    return this.extentionsList.includes(extension);
}

Group.prototype.addExtenion = function (extension) {
    this.extentionsList.push(extension);
}

Group.prototype.addExtenions = function (extensions) {
    this.extentionsList = this.extentionsList.concat(extensions);
}

Group.prototype.removeExtension = function (extension) {
    if (this.extentionsList.length == 1)
        return false
    this.extentionsList.splice(this.extentionsList.indexOf(extension), 1);
    return true;
}