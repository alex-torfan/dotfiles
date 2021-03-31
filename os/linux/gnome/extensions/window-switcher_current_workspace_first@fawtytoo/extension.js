const AltTab = imports.ui.altTab;
const Config = imports.misc.config;

let AltTab_WindowList;

var _originalFunction = [];

var _manager;

var windowCount;

function windowList_init(windows, mode)
{
    let workspace = _manager.get_active_workspace();
    // the first window in the list should be the currently focused window
    // therefore, we can use that for sorting
    let monitor = windows[0].get_monitor();

    let windowsCurrent = windows.filter(window => window.get_workspace() == workspace).filter(window => window.get_monitor() == monitor).concat(windows.filter(window => window.get_workspace() == workspace).filter(window => window.get_monitor() != monitor));
    let windowsOther = windows.filter(window => window.get_workspace() != workspace);

    windowCount = windowsCurrent.length;

    // pass the new lists to the original function
    _originalFunction['windowList_init'].apply(this, [windowsCurrent.concat(windowsOther), mode]);
}

function windowList_highlight(index, justOutline)
{
    _originalFunction['windowList_highlight'].apply(this, [index, justOutline]);

    // the old style needs to be removed before applying another one
    this._label.remove_style_class_name(index < windowCount ? 'label-app-other' : 'label-app-current');
    this._label.add_style_class_name(index < windowCount ? 'label-app-current' : 'label-app-other');
}

function windowSwitcherPopup_getWindowList()
{
    // we need windows from all workspaces
    return AltTab.getWindows(null);
}

function init()
{
    // thanks to jwarkentin for suggesting global.workspace_manager
    _manager = global.screen;
    if (_manager == undefined)
        _manager = global.workspace_manager;

    if (AltTab.WindowList)
        AltTab_WindowList = AltTab.WindowList;
    else
        AltTab_WindowList = AltTab.WindowSwitcher;
}

function enable()
{
    _originalFunction['windowList_init'] = AltTab_WindowList.prototype._init;
    AltTab_WindowList.prototype._init = windowList_init;
    _originalFunction['windowList_highlight'] = AltTab_WindowList.prototype.highlight;
    AltTab_WindowList.prototype.highlight = windowList_highlight;
    _originalFunction['windowSwitcherPopup_getWindowList'] = AltTab.WindowSwitcherPopup.prototype._getWindowList;
    AltTab.WindowSwitcherPopup.prototype._getWindowList = windowSwitcherPopup_getWindowList;
}

function disable()
{
    AltTab_WindowList.prototype._init = _originalFunction['windowList_init'];
    AltTab_WindowList.prototype.highlight = _originalFunction['windowList_highlight'];
    AltTab.WindowSwitcherPopup.prototype._getWindowlist = _originalFunction['windowSwitcherPopup_getWindowList'];
}
