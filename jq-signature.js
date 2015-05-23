(function(window, document, $) {
	'use strict';

  // Get a regular interval for drawing to the screen
  window.requestAnimFrame = (function (callback) {
    return window.requestAnimationFrame || 
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimaitonFrame ||
      function (callback) {
        window.setTimeout(callback, 1000/60);
      };
  })();

  /*
  * Plugin Constructor
  */

  var pluginName = 'jqSignature',
      defaults = {
        lineColor: "#222222",
        lineWidth: 2,
        width: 300,
        height: 100
      },
      canvas = '<canvas></canvas>';

  function Signature(element, options) {
    // DOM elements/objects
    this.element = element;
    this.$element = $(this.element);
    this.canvas = false;
    this.$canvas = false;
    this.ctx = false;
    // Drawing state
    this.drawing = false;
    this.currentPos = {
      x: 0,
      y: 0
    };
    this.lastPos = this.currentPos;
    // Determine plugin settings
    this._data = this.$element.data();
    this.settings = $.extend({}, defaults, options, this._data);
    // Initialize the plugin
    this.init();
  }

  Signature.prototype = {
    init: function() {
      var that = this;
      // Set up the canvas
      this.$canvas = $(canvas).appendTo(this.$element);
      this.$canvas.attr({
        width: this.settings.width,
        height: this.settings.height
      });
      this.$canvas.css({
        boxSizing: 'border-box',
        width: this.settings.width,
        height: this.settings.height,
        border: '1px solid gray',
        cursor: 'crosshair'
      });
      this.canvas = this.$canvas[0];
      this.ctx = this.canvas.getContext("2d");
      this.ctx.strokeStyle = this.settings.lineColor;
      this.ctx.lineWidth = this.settings.lineWidth;
      // Set up mouse events
      this.$canvas.on('mousedown touchstart', $.proxy(function(e) {
        // console.log(e.originalEvent.constructor);
        this.drawing = true;
        this.lastPos = this.currentPos = this._getCursorPosition(e);
      }, this));
      this.$canvas.on('mousemove touchmove', $.proxy(function(e) {
        this.currentPos = this._getCursorPosition(e);
      }, this));
      this.$canvas.on('mouseup touchend', $.proxy(function(e) {
        this.drawing = false;
      }, this));
      // Prevent document scrolling when touching canvas
      $(document).on('touchstart touchmove touchend', $.proxy(function(e) {
        if (e.target === this.canvas) {
          e.preventDefault();
        }
      }, this));
      // Start drawing
      (function drawLoop() {
        window.requestAnimFrame(drawLoop);
        that._renderCanvas();
      })();
    },
    clearCanvas: function() {
      this.canvas.width = this.canvas.width;
    },
    getDataURL: function() {
      return canvas.toDataURL();
    },
    _getCursorPosition: function(event) {
      var xPos, yPos, rect;
      rect = this.canvas.getBoundingClientRect();
      event = event.originalEvent;
      if (event.constructor === TouchEvent) {
        xPos = event.touches[0].clientX - rect.left,
        yPos = event.touches[0].clientY - rect.top
      }
      else {
        xPos = event.clientX - rect.left,
        yPos = event.clientY - rect.top 
      }
      return {
        x: xPos,
        y: yPos
      };
    },
    _renderCanvas: function() {
      if (this.drawing) {
        this.ctx.moveTo(this.lastPos.x, this.lastPos.y);
        this.ctx.lineTo(this.currentPos.x, this.currentPos.y);
        this.ctx.stroke();
        this.lastPos = this.currentPos;
      }
    }
  };

  /*
  * Plugin wrapper and initialization
  */

  $.fn[pluginName] = function ( options ) {
    var args = arguments;
    if (options === undefined || typeof options === 'object') {
      return this.each(function () {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(this, 'plugin_' + pluginName, new Signature( this, options ));
        }
      });
    } 
    else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
      var returns;
      this.each(function () {
        var instance = $.data(this, 'plugin_' + pluginName);
        if (instance instanceof Signature && typeof instance[options] === 'function') {
          returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
        }
        if (options === 'destroy') {
          $.data(this, 'plugin_' + pluginName, null);
        }
      });
      return returns !== undefined ? returns : this;
    }
  };

})(window, document, jQuery);
