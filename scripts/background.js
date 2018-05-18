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
};

var groupMap = null;

chrome.runtime.onStartup.addListener(function () {
    if (groupMap != null)
        return;

    groupMap = new groupMap();
    groupMap.load();
});

chrome.downloads.onDeterminingFilename.addListener(function (downloadItem, suggest) {
    var ext = extractExtension(downloadItem.filename);
    var group = groupMap.search(ext);
    suggest({"filename" : group.directory + "/" + downloadItem.filename, "conflictAction" : "uniquify"});
});

function extractExtension(filename) {
    return filename.substr(filename.lastIndexOf(".") + 1);
}

chrome.runtime.onInstalled.addListener(function () {
    //TODO: Check the reason for installation and act accordingly
    var groups = [];
    for (const key in defaultGroups) {
        var group = new Group(key, key);
        group.addExtenions(defaultGroups[key])
        groups.push(group);
    }

    groupMap = new GroupMap(groups);
    groupMap.save();
});