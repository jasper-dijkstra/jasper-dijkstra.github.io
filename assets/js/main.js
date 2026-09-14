/*
	Multiverse by HTML5 UP
	html5up.net | @ajlkn
	Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)

	Added EXIF data and enhanced for Jekyll by Ram Patra
*/

(function ($) {
	var $window = $(window),
	  $body = $("body"),
	  $wrapper = $("#wrapper");
  
	// Breakpoints.
	breakpoints({
	  xlarge: ["1281px", "1680px"],
	  large: ["981px", "1280px"],
	  medium: ["737px", "980px"],
	  small: ["481px", "736px"],
	  xsmall: [null, "480px"],
	});
  
	// Hack: Enable IE workarounds.
	if (browser.name == "ie") $body.addClass("ie");
  
	// Touch?
	if (browser.mobile) $body.addClass("touch");
  
	// Transitions supported?
	if (browser.canUse("transition")) {
	  // Play initial animations on page load.
	  $window.on("load", function () {
		window.setTimeout(function () {
		  $body.removeClass("is-preload");
		}, 100);
	  });
  
	  // Prevent transitions/animations on resize.
	  var resizeTimeout;
  
	  $window.on("resize", function () {
		window.clearTimeout(resizeTimeout);
  
		$body.addClass("is-resizing");
  
		resizeTimeout = window.setTimeout(function () {
		  $body.removeClass("is-resizing");
		}, 100);
	  });
	}
  
	// Scroll back to top.
	$window.scrollTop(0);
  
	// Panels.
	var $panels = $(".panel");
  
	$panels.each(function () {
	  var $this = $(this),
		$toggles = $('[href="#' + $this.attr("id") + '"]'),
		$closer = $('<div class="closer" />').appendTo($this);
  
	  // Closer.
	  $closer.on("click", function (event) {
		$this.trigger("---hide");
	  });
  
	  // Events.
	  $this
		.on("click", function (event) {
		  event.stopPropagation();
		})
		.on("---toggle", function () {
		  if ($this.hasClass("active")) $this.triggerHandler("---hide");
		  else $this.triggerHandler("---show");
		})
		.on("---show", function () {
		  // Hide other content.
		  if ($body.hasClass("content-active")) $panels.trigger("---hide");
  
		  // Activate content, toggles.
		  $this.addClass("active");
		  $toggles.addClass("active");
  
		  // Activate body.
		  $body.addClass("content-active");
		})
		.on("---hide", function () {
		  // Deactivate content, toggles.
		  $this.removeClass("active");
		  $toggles.removeClass("active");
  
		  // Deactivate body.
		  $body.removeClass("content-active");
		});
  
	  // Toggles.
	  $toggles
		.removeAttr("href")
		.css("cursor", "pointer")
		.on("click", function (event) {
		  event.preventDefault();
		  event.stopPropagation();
  
		  $this.trigger("---toggle");
		});
	});
  
	// Global events.
	$body.on("click", function (event) {
	  if ($body.hasClass("content-active")) {
		event.preventDefault();
		event.stopPropagation();
  
		$panels.trigger("---hide");
	  }
	});
  
	$window.on("keyup", function (event) {
	  if (event.keyCode == 27 && $body.hasClass("content-active")) {
		event.preventDefault();
		event.stopPropagation();
  
		$panels.trigger("---hide");
	  }
	});
  
	// Footer.
	var $footer = $("#footer");
  
	// Copyright.
	// This basically just moves the copyright line to the end of the *last* sibling of its current parent
	// when the "medium" breakpoint activates, and moves it back when it deactivates.
	$footer.find(".copyright").each(function () {
	  var $this = $(this),
		$parent = $this.parent(),
		$lastParent = $parent.parent().children().last();
  
	  breakpoints.on("<=medium", function () {
		$this.appendTo($lastParent);
	  });
  
	  breakpoints.on(">medium", function () {
		$this.appendTo($parent);
	  });
	});
  
	// Main.
	var $main = $("#main");
  
	// Poptrox.
	$main.poptrox({
	  baseZIndex: 20000,
	  caption: function ($a) {
		var $image_img = $a.children('img');
		var description = $image_img.data('description');
		var location = $image_img.data('location');
		var camera = $image_img.data('camera');
		var objective = $image_img.data('objective');
		var aperture = $image_img.data('aperture');
		var shutterSpeed = $image_img.data('shutter-speed');
		var iso = $image_img.data('iso');
		var details = '';
		if (description) details += '<p>' + description + '</p>';
		if (location) details += '<p><i class="fa fa-map-marker-alt" aria-hidden="true"></i> Locatie: ' + location + '</p>';
		if (camera || objective || aperture || shutterSpeed || iso) {
			details += '<details class="photo-details"><summary>Details</summary><div>';
			if (camera) details += '<p><i class="fa fa-camera" aria-hidden="true"></i> Camera: ' + camera + '</p>';
			if (objective) details += '<p><i class="fa fa-bullseye" aria-hidden="true"></i> Objectief: ' + objective + '</p>';
			if (aperture) details += '<p><i class="fa fa-adjust" aria-hidden="true"></i> Diafragma: ' + aperture + '</p>';
			if (shutterSpeed) details += '<p><i class="far fa-clock" aria-hidden="true"></i> Sluitertijd: ' + shutterSpeed + '</p>';
			if (iso) details += '<p><i class="fa fa-film" aria-hidden="true"></i> ' + iso + '</p>';
			details += '</div></details>';
		}
		return details || ' ';
	},
	  fadeSpeed: 300,
	  onPopupClose: function () {
		$body.removeClass("modal-active");
	  },
	  onPopupOpen: function () {
		$body.addClass("modal-active");
	  },
	  overlayOpacity: 0,
	  popupCloserText: "",
	  popupHeight: 150,
	  popupLoaderText: "",
	  popupSpeed: 300,
	  popupWidth: 150,
	  selector: ".thumb > a.image",
	  usePopupCaption: true,
	  usePopupCloser: true,
	  usePopupDefaultStyling: false,
	  usePopupEasyClose: false,
	  usePopupForceClose: true,
	  usePopupLoader: true,
	  usePopupNav: true,
	  windowMargin: 50,
	});
  
	// Hack: Set margins to 0 when 'xsmall' activates.
	breakpoints.on("<=xsmall", function () {
	  $main[0]._poptrox.windowMargin = 0;
	});
  
	breakpoints.on(">xsmall", function () {
	  $main[0]._poptrox.windowMargin = 50;
	});
  
  })(jQuery);
