APIFactory.initAPI();

var globalContext = {
    groupMap: {},
    port: {}, 
    newGroupForm : null, 
    newGroupFormModal : null, 
};



(function ($) {
    $(function () {
        initCache();
        initPort();
        loadGroups();
        hookEventHandlers($);
    });
})(jQuery)

function initCache() {
    globalContext.newGroupForm = $(".new-group-form");
    globalContext.newGroupFormModal = $(".new-group-form-modal");
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
    groupModalSetup($);
    //extensionModalSetup($);
}

function renderGroups(groupMap) {
    var rows = groupMap.render(renderGroupsToTableRow);
    appendTableRows(rows);
}

function renderGroupsToTableRow(item, index) {
    return `
        <div class="ui  segments">
            <div class="ui top attached block header grid no-top-padding">
                <i class="object group icon column"></i>
                <i class="two wide column">${item.groupName}</i>
                <i class="ui circle close icon right floated column"></i>
            </div>
            <div class="ui segment">
                <a class="ui blue right bottom right attached label no-lower-right">
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

    // var row = $("<div class='divTableRow'></div>")
    // row.attr("data-dm-groupname", item.groupName);
    // var name = $("<div class='divTableCell'></div>").append(item.groupName);
    // var ext = $("<div class='divTableCell'></div>").append(item.extensions(extensionToButton));
    // var dir = $("<div class='divTableCell'></div>").append(item.directory);
    // var act = $("<div class='divTableCell'></div>")
    //     .append(addExtensionButton(item.groupName))
    //     //.append(editGroupButton(item.groupName))
    //     .append(deleteGroupButton(item.groupName));

    // row.append(name)
    //     .append(ext)
    //     .append(dir)
    //     .append(act);
    // return row;
}

function extensionToButton(ext) {
    return `
        <div class="ui label row-spacing">
            ${ext}
            <i class="close icon"></i>
        </div>`;
    // var btn = $('<a href="#" class="btn btn-default btn-sm" ></a>');
    // btn.attr("data-dm-ext", ext);
    // btn.append(ext);
    // btn.append('<span class="glyphicon glyphicon-remove btn-space"></span>');
    // return btn;
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
                //hookEventHandlers();
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
                console.log(msg);
                if (msg.data.status) {
                    var btn = extensionToButton(msg.data.ext);
                    $(`div[data-dm-groupname='${msg.data.group.groupName}'] div:nth-child(2)`).append(btn);
                }
                hookEventHandlers();
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
                hookEventHandlers($);
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

function extensionModalSetup($) {
    $(".add-group").click(() => {
        $(".new-extension-form")
            .modal({
                closable: false,
                onDeny: () => {
                    document.forms["newgroup"].reset()
                },
                onApprove: () => {
                    //approved function call here
                },
                transition: 'fade up'
            })
            .modal("show");
    });
}