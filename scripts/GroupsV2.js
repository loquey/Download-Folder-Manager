class Group
{
    constructor(options)
    {
        if (options == undefined || options == null) {
            throw "Invalid group object";
        }
    
        if (options.groupName == undefined || options.directory == undefined || !Array.isArray(options.extensionList)) {
            throw "Invalid group object, misssing group data";
        }
    
        this._groupName = options.groupName;
        this._extensionList = new Set(options.extensionList); 
        this._directory = options.directory;
    }

    directory() {
        return this._directory;
    }

    groupName() {
        return this._groupName;
    }

    hasExtension(extension) {
        return this._extensionList.has(extension);
    }
    
    addExtension(extension) {
        this._extensionList.add(extension);
    }
    
    addExtensions(extensions) {
        extension.forEach(e => { this._extensionList.add(e); });
    }
    
    removeExtension(extension) {
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
}