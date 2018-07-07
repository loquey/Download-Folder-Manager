
const API_VERSION_1 = 'v1';
const API_VERSION_2 = 'v2'
const API_VERSION = API_VERSION_2;

//Helper methods to switch between API versions
var groupFactory = null;
var groupMapFactory = null

// function initAPI() { 
    
// }

class APIFactory { 
    static initAPI() { 
        if (API_VERSION == API_VERSION_1) {
            this.groupFactory = (args) => { return new Group(args); }
            this.groupMapFactory = (args) => { return new GroupMap(args); }
        }
        
        if (API_VERSION == API_VERSION_2) {
            this.groupFactory = (args) => { return new GroupV2(args); }
            this.groupMapFactory = (args) => { return new GroupMapV2(args); }
        }
    }
}