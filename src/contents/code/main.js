// Endless Desktop — KWin Script
// Pans all windows on the current desktop vertically as a single canvas layer.

var STEP = readConfig("stepSize", 80);
var INVERT = readConfig("invertUpDown", false);
var DIR = INVERT ? -1 : 1;

var offset = 0;

function getFilteredWindows() {
    var windows = workspace.stackingOrder;
    var result = [];
    for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        if (w.normalWindow && !w.deleted) {
            var desktops = w.desktops;
            if (desktops.length === 0 || desktops.indexOf(workspace.currentDesktop) !== -1) {
                result.push(w);
            }
        }
    }
    return result;
}

function moveWindow(w, dy) {
    var g = w.frameGeometry;
    w.frameGeometry = {
        x: g.x,
        y: g.y + dy,
        width: g.width,
        height: g.height
    };
}

function panBy(delta) {
    offset += delta;
    var windows = getFilteredWindows();
    for (var i = 0; i < windows.length; i++) {
        moveWindow(windows[i], delta);
    }
}

function goHome() {
    panBy(-offset);
}

// Shift newly opened windows to match current canvas offset
workspace.windowAdded.connect(function(w) {
    if (offset !== 0 && w.normalWindow && !w.deleted) {
        var count = 0;
        var handler = function() {
            count++;
            if (count >= 3) {
                w.frameGeometryChanged.disconnect(handler);
                moveWindow(w, offset);
            }
        };
        w.frameGeometryChanged.connect(handler);
    }
});


registerShortcut(
    "EndlessDesktop Up",
    "EndlessDesktop: Pan Up",
    "Meta+Ctrl+Shift+Up",
    function() { panBy(STEP * DIR); }
);

registerShortcut(
    "EndlessDesktop Down",
    "EndlessDesktop: Pan Down",
    "Meta+Ctrl+Shift+Down",
    function() { panBy(-STEP * DIR); }
);

registerShortcut(
    "EndlessDesktop Home",
    "EndlessDesktop: Home",
    "Meta+Ctrl+Shift+Space",
    function() { goHome(); }
);
