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
    
        this.groupName = options.groupName;
        this.extensionList = new Set(options.extensionList); 
        this.directory = options.directory;
    }

    hasExtension(extension) {
        return this.extensionList.has(extension);
    }
    
    addExtension(extension) {
        this.extensionList.add(extension);
    }
    
    addExtensions(extensions) {
        extension.forEach(e => { this.extensionList.add(e); });
    }
    
    removeExtension(extension) {
        this.extensionList.delete(extension);
        return true;
    }
    
    extensions(converter) {
        if (converter == undefined) {
            converter = this.defaultConveter;
        }

        let map = new Array();
        for (let x of this.extensionList) {
            map.push(converter(x));
        }
        return map;
    }

    defaultConveter(element) { 
        return element;
    }
}