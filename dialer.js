function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return document.querySelectorAll(sel);
}

var Dialer = {
  hole: null,
  digit: null,
  moving: false,
  rotating: false,
  lastAngle: null,
  totalAngle: null,
  maxAngle: null,

  init: function () {
    this.dial = $("#dialer");
    this.number = $("#number");
    this.center = $("#center");
    this.player = $("#player");

    var rect = this.dial.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;

    this.dial.addEventListener("mousedown", this.mousedown.bind(this));
    this.center.addEventListener("click", this.click.bind(this));
    addEventListener("mousemove", this.mousemove.bind(this));
    addEventListener("mouseup", this.mouseup.bind(this));
  },

  mousedown: function (e) {
    if (this.rotating || this.moving)
      return;

    var digit = this.findDigit(e);
    if (digit === null)
      return;

    var hole = this.findHole(e);
    if (hole === null)
      return;

    this.maxAngle = 135;
    var rect = hole.getBoundingClientRect();
    var holeAngle = this.getAngle(rect.left + rect.width / 2, rect.top + rect.height / 2);

    if (holeAngle >= 180)
      this.maxAngle += 360 - holeAngle;
    else
      this.maxAngle -= holeAngle;

    this.digit = digit;
    this.hole = hole;
    this.rotating = this.moving = true;
    this.lastAngle = this.getAngle(e.clientX, e.clientY);
    this.totalAngle = 0;
    this.dial.classList.add("rotating");
    this.center.classList.add("rotating");
    e.preventDefault();
  },

  mousemove: function (e) {
    if (!this.rotating || !this.moving)
      return;

    var angle = this.getAngle(e.clientX, e.clientY);
    var diff = this.getAngleDiff(this.lastAngle, angle);
    this.totalAngle += diff;

    var rotation = Math.min(this.maxAngle, Math.max(0, this.totalAngle));
    this.dial.style.MozTransform = "rotate(" + rotation + "deg)";
    this.lastAngle = angle;
  },

  mouseup: function (e) {
    if (!this.rotating || !this.moving)
      return;

    var rect = this.hole.getBoundingClientRect();
    if (rect.left > this.centerX && rect.top > this.centerY)
      this.number.textContent += this.digit;

    this.moving = false;
    this.lastAngle = this.totalAngle = null;
    this.dial.classList.remove("rotating");
    this.center.classList.remove("rotating");
    this.dial.style.MozTransform = "";

    this.player.play();
    navigator.mozVibrate([100, 50, 100, 50, 100, 50, 100, 50, 100, 50, 100, 50, 100]);

    var self = this;
    this.dial.addEventListener("transitionend", function onEnd() {
      self.dial.removeEventListener("transitionend", onEnd);
      self.rotating = false;
    });
  },

  click: function (e) {
    if (this.rotating || this.moving)
      return;

    var classes = this.center.classList;
    if (classes.contains("dialing")) {
      classes.remove("dialing");
      this.number.textContent = "";
      this.call.hangUp();
      this.call = null;
    } else {
      classes.add("dialing");
      this.call = navigator.mozTelephony.dial(this.number.textContent);
    }
  },

  getAngle: function (x, y) {
    x -= this.centerX;
    y -= this.centerY;
    return 180 - (Math.atan2(x, y) * 180 / Math.PI);
  },

  getAngleDiff: function (from, to) {
    if (from > to && from > 270 && to < 90)
      return 360 - from + to;

    if (from < to && to > 270 && from < 90)
      return 360 - to + from;

    return to - from;
  },

  findDigit: function (e) {
    var x = e.clientX;
    var y = e.clientY;
    var digits = $$(".digit");

    for (var i = 0; i < digits.length; i++) {
      var rect = digits[i].getBoundingClientRect();
      if (rect.left <= x && rect.width + rect.left >= x &&
          rect.top <= y && rect.height + rect.top >= y)
        return i == 9 ? 0 : i + 1;
    }

    return null;
  },

  findHole: function (e) {
    var x = e.clientX;
    var y = e.clientY;
    var holes = $$(".hole");

    for (var i = 0; i < holes.length; i++) {
      var rect = holes[i].getBoundingClientRect();
      if (rect.left <= x && rect.width + rect.left >= x &&
          rect.top <= y && rect.height + rect.top >= y)
        return holes[i];
    }

    return null;
  }
};

Dialer.init();
