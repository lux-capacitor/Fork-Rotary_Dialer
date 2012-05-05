function $(sel) {
  return document.querySelector(sel);
}

function $$(sel) {
  return document.querySelectorAll(sel);
}

function Dialer(dial, number) {
  this.dial = $(dial);
  this.number = $(number);

  var rect = this.dial.getBoundingClientRect();
  this.centerX = rect.left + rect.width / 2;
  this.centerY = rect.top + rect.height / 2;

  this.dial.addEventListener("mousedown", this.mousedown.bind(this));
  addEventListener("mousemove", this.mousemove.bind(this));
  addEventListener("mouseup", this.mouseup.bind(this));
}

Dialer.prototype = {
  digit: null,
  rotating: false,
  lastAngle: null,
  totalAngle: null,

  mousedown: function (e) {
    var digit = this.findDigit(e);
    if (digit === null)
      return;

    this.digit = digit;
    this.rotating = true;
    this.lastAngle = this.getAngle(e);
    this.totalAngle = 0;
    this.dial.classList.add("rotating");
    e.preventDefault();
  },

  mousemove: function (e) {
    if (!this.rotating)
      return;

    var angle = this.getAngle(e);
    var diff = this.getAngleDiff(this.lastAngle, angle);
    this.totalAngle += diff;
    this.dial.style.MozTransform = "rotate(" + Math.max(0, this.totalAngle) + "deg)";
    this.lastAngle = angle;
  },

  mouseup: function (e) {
    if (e.clientX > this.centerX && e.clientY > this.centerY)
      this.number.innerHTML += this.digit;

    this.rotating = false;
    this.lastAngle = this.totalAngle = null;
    this.dial.classList.remove("rotating");
    this.dial.style.MozTransform = "";
    navigator.mozVibrate([100, 50, 100, 50, 100, 50, 100, 50, 100, 50, 100, 50, 100]);
  },

  getAngle: function (e) {
    var x = e.clientX - this.centerX;
    var y = e.clientY - this.centerY;
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
  }
};
