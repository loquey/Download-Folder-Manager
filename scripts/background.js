var defaultGroups = {
    "Documents": [
        "pdf", "xls", "doc", "docx", "xlsx", "rtf"
    ],
    "Programs": [
        "exe", "msi"
    ],
    "Music": [
        "mp3", 'm4a', "wav", "wma", "flac", "ogg"
    ],
    "Compressed": [
        "zip", "7z", "rar", "lzo", "lzma", "tar", "gz", "bz"
    ],
    "Pictures": [
        "png", "bmp", "jpg", "jpeg", "tiff", "gif", "tif", "jpe", "jfif", "dib"
    ]
    //videos are missing
};

var globalContext = {
    groupMap : null
};


chrome.runtime.onStartup.addListener(function () {
    console.log("On Statup event call");
    if (globalContext.groupMap != null)
        return;
    
    globalContext.groupMap = new GroupMap();
    globalContext.groupMap.load();
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    var ext = extractExtension(downloadItem.filename);
    var group = globalContext.groupMap.search(ext);
    suggest({ "filename": group.directory + "/" + downloadItem.filename, "conflictAction": "uniquify" });
});

function extractExtension(filename) {
    return filename.substr(filename.lastIndexOf(".") + 1);
}

chrome.runtime.onInstalled.addListener(function (details) {

    if (details.reason == "install") {
        setupDefaultGroups();
    }

    globalContext.groupMap = new GroupMap({});
    globalContext.groupMap.load();
});

function setupDefaultGroups() {
    var newGroups = [];
    for (const key in defaultGroups) {
        var group = new Group({ groupName: key, directory: key, extensionList: defaultGroups[key] });
        newGroups.push(group);
    }
    globalContext.groupMap = new GroupMap({ groupTypes: newGroups });
    globalContext.groupMap.save();
    console.log("onInstall Event:Default group setup");
}

var port = null;
chrome.runtime.onConnect.addListener(function (requestPort) {
    port = requestPort;
    port.onMessage.addListener(handleMessages);
});

function handleMessages(msg) {
    if (port == null)
        return;

    switch (msg.command) {
        case "get-loaded-groups": {
            console.log("load groups command processing...");
            console.log(globalContext.groupMap);
            port.postMessage({ command: msg.command, data: globalContext.groupMap });
            break;
        }
        case "delete-group": {
            globalContext.groupMap.deleteGroup({ groupName: msg.data });
            globalContext.groupMap.save();
            port.postMessage({ command: msg.command, data: msg.data })
            break;
        }
        case "delete-group-extension": {
            // var group = new Group(msg.data.group);
            // globalContext.groupMap.replaceGroup(group.groupName, group);
            // globalContext.groupMap.save();
            // port.postMessage({ command: msg.command, data: { status: true, ext: msg.data.ext } })
            // break;
        }
        case "add-group-extension" : {
            var group = new Group(msg.data.group);
            globalContext.groupMap.replaceGroup(group.groupName, group);
            globalContext.groupMap.save();
            port.postMessage({ command: msg.command, data: { status: true, ext: msg.data.ext, group : group } })
            break;
        }
        case "add-new-group": {
            //conver to group object 
            var group = new Group(msg.data);
            var status = true;
            var statusMsg = "New group added successfully ";

            if (!globalContext.groupMap.addGroup(group)) {
                status = false;
                statusMsg = "Duplicate group found";
            }

            globalContext.groupMap.save();
            port.postMessage({ command: "add-new-group", data: { status: status, statusMsg: statusMsg, group: group } });
            break;
        }
        default: {
            console.log("Unknown command: " + msg.command);
        }
    }
}