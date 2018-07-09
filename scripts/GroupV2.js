class GroupV2 {
    constructor(options) {
        if (options == undefined || options == null) {
            throw "Invalid group object";
        }

        if (options.groupName == undefined || options.directory == undefined || !Array.isArray(options.extensionList)) {
            throw "Invalid group object, misssing group data";
        }

        this._groupName = options.groupName;
        this._extensionList = new Set(options.extensionList);
        this._directory = options.directory;
        this.extensionList = [];
    }

    get directory() {
        return this._directory;
    }

    get groupName() {
        return this._groupName;
    }

    hasExtension(extension) {
        return this._extensionList.has(extension);
    }

    addExtension(extension) {
        if (this._extensionList.has(extension)) return false;
        
        this._extensionList.add(extension);
        return true;
    }

    addExtensions(extensions) {
        extension.forEach(e => { this._extensionList.add(e); });
    }

    removeExtension(extension) {
        if (this._extensionList.size <= 1)
            return false;
        this._extensionList.delete(extension);
        return true;
    }

    extensions(converter) {
        if (converter == undefined) {
            converter = this.defaultConveter;
        }

        let map = new Array();
        for (let x of this._extensionList) {
            map.push(converter(x));
        }
        return map;
    }

    defaultConveter(element) {
        return element;
    }

    get toObject() {
        return {
            groupName: this._groupName,
            directory: this._directory,
            extensionList: Array.from(this._extensionList.values()),
        }
    }
}