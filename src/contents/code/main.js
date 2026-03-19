// Endless Desktop — KWin Script
// Pans all windows on the current desktop vertically as a single canvas layer.

function getStep() {
    return Number(readConfig("stepSize", 80));
}

function getDir() {
    return String(readConfig("invertUpDown", false)) === "true" ? -1 : 1;
}

var offsets = {};

function currentDesktopId() {
    return workspace.currentDesktop.id;
}

function getOffset() {
    return offsets[currentDesktopId()] || 0;
}

function setOffset(value) {
    offsets[currentDesktopId()] = value;
}

function isOnCurrentDesktop(w) {
    var desktops = w.desktops;
    if (desktops.length === 0) return true;
    var currentId = workspace.currentDesktop.id;
    for (var i = 0; i < desktops.length; i++) {
        if (desktops[i].id === currentId) return true;
    }
    return false;
}

function getFilteredWindows() {
    var windows = workspace.stackingOrder;
    var result = [];
    for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        if (w.normalWindow && !w.deleted && isOnCurrentDesktop(w)) {
            result.push(w);
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
    setOffset(getOffset() + delta);
    var windows = getFilteredWindows();
    for (var i = 0; i < windows.length; i++) {
        moveWindow(windows[i], delta);
    }
}

function goHome() {
    panBy(-getOffset());
}

// Shift newly opened windows to match current canvas offset
workspace.windowAdded.connect(function(w) {
    var currentOffset = getOffset();
    if (currentOffset !== 0 && w.normalWindow && !w.deleted) {
        var timer = new QTimer();
        timer.interval = 50;
        timer.singleShot = true;
        timer.timeout.connect(function() {
            if (!w.deleted) {
                moveWindow(w, currentOffset);
            }
        });
        timer.start();
    }
});


registerShortcut(
    "EndlessDesktop Up",
    "EndlessDesktop: Pan Up",
    "Meta+Ctrl+Shift+Up",
    function() { panBy(getStep() * getDir()); }
);

registerShortcut(
    "EndlessDesktop Down",
    "EndlessDesktop: Pan Down",
    "Meta+Ctrl+Shift+Down",
    function() { panBy(-getStep() * getDir()); }
);

registerShortcut(
    "EndlessDesktop Home",
    "EndlessDesktop: Home",
    "Meta+Ctrl+Shift+Space",
    function() { goHome(); }
);
