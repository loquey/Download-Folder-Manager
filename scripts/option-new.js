APIFactory.initAPI();

var globalContext = {
    groupMap: {},
    port: {},
    newGroupForm: null,
    newGroupFormModal: null,
    newExtensionForm: null,
    newExtensionFormModal: null,
};



(function ($) {
    $(function () {
        initCache();
        initPort();
        loadGroups();
        groupModalSetup($);
    });
})(jQuery)

function initCache() {
    globalContext.newGroupForm = $(".new-group-form");
    globalContext.newGroupFormModal = $(".new-group-form-modal");
    globalContext.newExtensionForm = $(".new-extension-form");
    globalContext.newExtensionFormModal = $(".new-extension-modal");
}

function initPort() {
    globalContext.port = chrome.runtime.connect({
        name: "conn"
    });
    globalContext.port.onMessage.addListener(function (msg) {
        routeMessage(msg);
    });
}

function loadGroups() {
    console.log("Load groups command sent");
    globalContext.port.postMessage({
        "command": "get-loaded-groups"
    });
}

function hookEventHandlers($) {
    hookDeleteGroupHandlers($)
    //hook delete extension handler 
}

function hookDeleteGroupHandlers($) {
    $(".delete-group").click(function () {
        let groupName = $(this).attr("data-dm-groupname");
        globalContext.port.postMessage({
            command: "delete-group",
            data: groupName
        });
        globalContext.groupMap.deleteGroup({
            groupName: groupName
        });
        $(`div[data-dm-groupfor='${groupName}']`).remove();
    });
}

function renderGroups(groupMap) {
    var rows = groupMap.render(renderGroupsToTableRow);
    appendTableRows(rows);
}

function renderGroupsToTableRow(item, index) {
    console.log(item.groupName)
    return `
        <div class="ui  segments" data-dm-groupfor="${item.groupName}">
            <div class="ui top attached block header grid no-top-padding">
                <i class="object group icon column"></i>
                <i class="two wide column">${item.groupName}</i>
                <i class="ui circle close icon right floated column delete-group" data-dm-groupname="${item.groupName}"></i>
            </div>
            <div class="ui segment" data-dm-group-extensions="${item.groupName}">
                <a class="ui blue right bottom right attached label no-lower-right add-extension" data-dm-groupname="${item.groupName}">
                    <i class="right plus circle icon"></i>
                    Add Extension
                </a>
                ${item.extensions(extensionToButton).join("")}
            </div>
            <div class="ui bottom attached block header">
                <i class="folder icon"></i>
                ${item.directory}
            </div>
        </div>`;
}

function extensionToButton(ext) {
    return `
        <div class="ui label row-spacing">
            ${ext}
            <i class="close icon"></i>
        </div>`;
}

function appendTableRows(rows) {
    $(".group-list").append(rows);
}

function routeMessage(msg) {
    switch (msg.command) {
        case "get-loaded-groups":
            {
                console.log(msg.data);
                console.log("loaded group response");
                globalContext.groupMap = APIFactory.groupMapFactory({
                    groupObjects: msg.data
                });
                console.log(globalContext.groupMap);
                renderGroups(globalContext.groupMap);
                hookDeleteGroupHandlers($);
                hookAddExtensionHandler($);
                break;
            }
        case "delete-group":
            {
                console.log("Group deleted " + msg.data);
                break;
            }
        case "delete-group-extension":
            {
                console.log(`Extension deleted response ${msg.data.status}`);
                console.log(msg);
                if (msg.data.status) {
                    $(`div[data-dm-groupname='${msg.data.group.groupName}'] a[data-dm-ext='${msg.data.ext}']`).remove();
                }
                break;
            }
        case "add-group-extension":
            {
                console.log("add-group-extension command response received");
                console.log(msg);
                if (msg.data.status) {
                    let btn = extensionToButton(msg.data.ext);
                    $(`div[data-dm-group-extensions='${msg.data.group.groupName}']`).append(btn);
                }
                //hook delete extension handler
                break;
            }
        case "add-new-group":
            {
                if (!msg.data.status) {
                    alert(msg.data.statusMsg);
                    return;
                }

                var group = APIFactory.groupFactory(msg.data.group);
                globalContext.groupMap.addGroup(group);
                appendTableRows(renderGroupsToTableRow(group));

                //shouldn't rehook add group event handler
                hookAddExtensionHandler($);
                //hook delete extension handlers
                break;
            }
        default:
            {
                console.log("Unknown command: " + msg.command);
            }
    }
}

function groupModalSetup($) {
    groupModalFormValidationSetup($);

    $(".add-group").click(() => {
        globalContext.newGroupFormModal
            .modal({
                closable: false,
                onApprove: () => {
                    if (!globalContext.newGroupForm.form("validate form")) {
                        return false;
                    }

                    let groupName = document.forms["newgroup"]["groupname"].value.trim();
                    let directory = document.forms["newgroup"]["directory"].value.trim();
                    let extensions = document.forms["newgroup"]["extensions"].value.trim();

                    return saveGroup(groupName, directory, extensions);
                },
                onHidden: () => {
                    globalContext.newGroupForm.form('reset');
                    $(".ui.error.message").children().remove();
                },
                transition: 'fade up',
            })
            .modal("show");
    });
}

function groupModalFormValidationSetup($) {
    globalContext.newGroupForm
        .form({
            fields: {
                groupname: {
                    identifier: 'groupname',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please specify {name}'
                    }]
                },
                directory: {
                    identifier: 'directory',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please specify target {name}'
                    }]
                },
                extensions: {
                    identifier: 'extensions',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please specify {name} list'
                    }]
                },
            }
        })
}

function saveGroup(groupName, directory, extensions) {

    var group = APIFactory.groupFactory({
        groupName: groupName,
        directory: directory,
        extensionList: extensions.split(",")
    });

    console.log(group);
    globalContext.port.postMessage({
        command: "add-new-group",
        data: group.toObject
    });
    return true;
}

function hookAddExtensionHandler($) {
    extensionModalFormValidationSetup($);

    $(".add-extension").click(function () {
        let groupName = $(this).attr("data-dm-groupname");

        $(".new-extension-modal")
            .modal({
                closable: false,
                onHidden: () => {
                    globalContext.newExtensionForm.form('reset');
                    $(".ui.error.message").children().remove();
                },
                onApprove: () => {
                    if (!globalContext.newExtensionForm.form("validate form")) {
                        return false;
                    }

                    let extensionList = globalContext.newExtensionForm.form("get value", 'groupextensions');
                    return saveGroupExtension(groupName, extensionList);
                },
                transition: 'fade up'
            })
            .modal("show");
    });
}

function extensionModalFormValidationSetup($) {
    globalContext.newExtensionForm
        .form({
            fields: {
                groupname: {
                    identifier: 'groupextensions',
                    rules: [{
                        type: 'empty',
                        prompt: 'Please specify {name}'
                    }]
                }
            }
        })
}

function saveGroupExtension(groupName, extension) {

    console.log(extension);
    var group = globalContext.groupMap.findGroup(groupName);
    if (group == undefined) {
        return false;
    }

    if (group.addExtension(extension)) {
        globalContext.port.postMessage({
            command: "add-group-extension",
            data: {
                group: group.toObject,
                ext: extension
            }
        });
    } else {
        return false
    }

}