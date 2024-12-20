// <![CDATA[
var speed = 25; // lower number for faster
var flakes = 8; // number of flakes falling at a time
var untidy = 0; // how often do you want the flakes tidied up (high number is less often)
var sizes = 15; // maximum size of flakes in pixels
var colour = '#f7f7f7'; // colour of the snowflakes

/****************************\
*Winter Snow Flakes Effect #3*
*  (c)2013 mf2fm web-design  *
*  http://www.mf2fm.com/rv   *
* DO NOT EDIT BELOW THIS BOX *
\****************************/

var boddie;
var dx = new Array();
var xp = new Array();
var yp = new Array();
var am = new Array();
var dy = new Array();
var le = new Array();
var fs = new Array();
var flaky = new Array();
var swide = 480;
var shigh = 320;
var sleft = 0;
var starty = 0;
var offset = 0;
var tidying = 0;
var deeex = 0;
var has_focus = true;
var snowflakes = new Array(8727, 10016, 10033, 10035, 10036, 10037, 10038, 10042, 10043, 10044, 10045, 10046, 10051, 10052, 10053, 10054, 10055, 10056, 10057, 10058, 10059);
var ie_version = (navigator.appVersion.indexOf("MSIE") != -1) ? parseFloat(navigator.appVersion.split("MSIE")[1]) : false;
var plow = document.createElement("img");
plow.src = 'http://file.hstatic.net/1000033716/file/image.png';

function addLoadEvent(funky) {
    var oldonload = window.onload;
    if (typeof(oldonload) != 'function') window.onload = funky;
    else window.onload = function() {
        if (oldonload) oldonload();
        funky();
    }
}

addLoadEvent(december_21);

function december_21() {
    if (document.getElementById) {
        var i;
        if (ie_version) {
            document.onfocusin = function() {
                has_focus = true;
            };
            document.onfocusout = function() {
                has_focus = false;
                sleft = 0;
            };
        } else {
            window.onfocus = function() {
                has_focus = true;
            };
            window.onblur = function() {
                has_focus = false;
                sleft = 0;
            };
        }
        window.onscroll = set_scroll;
        window.onresize = set_width;
        document.onmousemove = mouse;
        boddie = document.createElement("div");
        boddie.style.position = "fixed";
        boddie.style.bottom = "0px";
        boddie.style.left = "0px";
        boddie.style.width = "100%";
        boddie.style.overflow = "hidden";
        boddie.style.backgroundColor = "transparent";
        boddie.style.pointerEvents = "none";
        boddie.style.zIndex = "9999";
        document.body.insertBefore(boddie, document.body.firstChild);
        set_width();
        plow.style.position = "absolute";
        plow.style.overflow = "hidden";
        plow.style.zIndex = 9999;
        plow.style.bottom = "0px";
        plow.style.left = "-144px";
        boddie.appendChild(plow);
        for (i = 0; i < flakes; i++) freeze_ice(Math.random() * shigh * 3 / 4);
        offset = 0;
        setInterval("winter_flakes()", speed);
    }
}

function freeze_ice(whyp) {
    starty++;
    offset++;
    var f, t;
    start_fall(starty, whyp);
    f = document.createElement("div");
    t = document.createTextNode(String.fromCharCode(snowflakes[starty % snowflakes.length]));
    f.appendChild(t);
    t = f.style;
    t.color = colour;
    if (ie_version && ie_version < 10) t.filter = "glow(color=" + colour + ",strength=1)";
    else if (ie_version) t.boxShadow = "0px 0px 2x 2px " + colour;
    else t.textShadow = colour + ' 0px 0px 2px';
    t.font = fs[starty] + "px sans-serif";
    t.position = "absolute";
    t.zIndex = 1000 + starty;
    t.top = yp[starty] + "px";
    t.left = xp[starty] + "px";
    t.lineHeight = fs[starty] + "px";
    flaky[starty] = f;
    boddie.appendChild(f);
}

function start_fall(i, whyp) {
    fs[i] = Math.floor(sizes * (.25 + .75 * Math.random()));
    dx[i] = Math.random();
    am[i] = 8 + Math.random() * sizes * .75;
    dy[i] = 1 + Math.random() * 2;
    xp[i] = Math.random() * (swide - fs[i]);
    yp[i] = whyp - fs[i];
    le[i] = 'falling';
}

function set_width() {
    var sw, sh;
    if (typeof(window.innerWidth) == 'number' && window.innerWidth) {
        sw = window.innerWidth;
        sh = window.innerHeight;
    } else if (document.compatMode == "CSS1Compat" && document.documentElement && document.documentElement.clientWidth) {
        sw = document.documentElement.clientWidth;
        sh = document.documentElement.clientHeight;
    } else {
        sw = document.body.clientWidth;
        sh = document.body.clientHeight;
    }
    if (sw && sh && has_focus) {
        swide = sw;
        shigh = sh;
    }
    boddie.style.height = shigh + "px";
}

function winter_flakes() {
    var i;
    var c = 0;
    for (i = 0; i < starty; i++) {
        if (flaky[i] && le[i] != 'tidying') {
            if (yp[i] > shigh || xp[i] > swide || xp[i] < -fs[i]) {
                if (offset > 0) offset--;
                boddie.removeChild(flaky[i]);
                flaky[i] = false;
            } else if (yp[i] + offset / flakes < shigh - 0.7 * fs[i]) {
                yp[i] += dy[i];
                dx[i] += 0.02 + Math.random() / 20;
                xp[i] += deeex;
                flaky[i].style.top = yp[i] + "px";
                flaky[i].style.left = (xp[i] + am[i] * Math.sin(dx[i])) + "px";
            } else if (le[i] == 'falling') le[i] = 'landed';
        }
        if (flaky[i] && le[i] == 'falling') c++;
    }
    if (c < flakes) freeze_ice(0);
    if (offset > untidy * flakes && !tidying && Math.random() < .05) tidy_flakes();
}

function tidy_flakes() {
    var i;
    tidying = true;
    for (i = swide; i >= -146; i -= 2) setTimeout('plough(' + i + ')', speed * (swide - i));
    setTimeout('tidying=false; offset=0;', speed * (swide - i));
}

function plough(x) {
    var i, p;
    plow.style.left = x + "px";
    for (i = 0; i < starty; i++) {
        if (flaky[i] && le[i] != 'falling') {
            p = xp[i] + fs[i] + am[i] * Math.sin(dx[i]) - dy[i];
            if (p < 0) {
                boddie.removeChild(flaky[i]);
                flaky[i] = false;
            } else if (p > x && p < x + 3.5) {
                le[i] = 'tidying';
                xp[i] -= 2;
                if (Math.random() < .1) {
                    yp[i]--;
                    flaky[i].style.top = yp[i] + "px";
                }
                flaky[i].style.left = (xp[i] + am[i] * Math.sin(dx[i])) + "px";
            } else if (p > x + 144 && yp[i] < shigh - 0.7 * fs[i]) {
                yp[i] += dy[i];
                dx[i] += 0.02 + Math.random() / 10;
                flaky[i].style.top = yp[i] + "px";
                flaky[i].style.left = (xp[i] + am[i] * Math.sin(dx[i])) + "px";
            }
        }
    }
}

function set_scroll() {
    if (typeof(self.pageXOffset) == 'number' && self.pageXoffset) sleft = self.pageXOffset;
    else if (document.body && document.body.scrollLeft) sleft = document.body.scrollLeft;
    else if (document.documentElement && document.documentElement.scrollLeft) sleft = document.documentElement.scrollLeft;
    else sleft = 0;
}

function mouse(e) {
    var x;
    if (e) x = e.pageX;
    else {
        x = event.x;
        set_scroll();
        x += sleft;
    }
    deeex = has_focus ? Math.floor(-1 + 3 * (x - sleft) / swide) : 0;
}
// ]]>