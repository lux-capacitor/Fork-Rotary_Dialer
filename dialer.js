function $(sel) {
  return document.querySelector(sel);
}

function Dialer(sel) {
  this.elem = $(sel);

  var rect = this.elem.getBoundingClientRect();
  this.centerX = rect.left + rect.width / 2;
  this.centerY = rect.top + rect.height / 2;

  this.elem.addEventListener("mousedown", this.mousedown.bind(this));
  addEventListener("mousemove", this.mousemove.bind(this));
  addEventListener("mouseup", this.mouseup.bind(this));
}

Dialer.prototype = {
  rotating: false,
  startAngle: null,
  lastAngle: null,
  totalAngle: null,

  mousedown: function (e) {
    this.rotating = true;
    this.startAngle = this.lastAngle = this.getAngle(e);
    this.totalAngle = 0;
    this.elem.classList.add("rotating");
    e.preventDefault();
  },

  mousemove: function (e) {
    if (!this.rotating)
      return;

    var angle = this.getAngle(e);
    var diff = this.getAngleDiff(this.lastAngle, angle);
    this.totalAngle += diff;
    this.elem.style.MozTransform = "rotate(" + Math.max(0, this.totalAngle) + "deg)";
    this.lastAngle = angle;
  },

  mouseup: function (e) {
    this.rotating = false;
    this.startAngle = this.lastAngle = this.totalAngle = null;
    this.elem.classList.remove("rotating");
    this.elem.style.MozTransform = "";
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
  }
};
