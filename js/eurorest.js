var EHC = {
	hotelSearching: null,
	
	showBanner: function() {
		jQuery(".app-page-head-wrp .app-page-head:visible").addClass("app-page-head-anim").one(App.getTransitionEndEvent(), function() {
			var banners = jQuery(".app-page-head-wrp .app-page-head");
			if (banners.length > 1) {
				var currIdx = jQuery(this).attr("data-idx") - 0;
				var next = null;
				jQuery.each(banners, function(idx, val) {
					if (jQuery(val).attr("data-idx") - 0 > currIdx && !jQuery(val).is(":visible")) {
						next = val;
					}
				});
				if (next == null) {
					next = banners[0];
				}
				jQuery(this).fadeOut(1000);
				jQuery(next).fadeIn(1000);
			}
		});
	},
	
	handleDatePeriod: function(ctl, selectAction, clearAction, options, startDate, endDate) {
		var picker = jQuery("#" + ctl + " .app-date-picker");
		picker.bootstrapDP(options).on("show changeDate changeMonth changeYear", function(e){
			EHC.handleDatePeriodRange(ctl, picker);
		});
		
		if (startDate != null && endDate != null) {
			picker.bootstrapDP("setDates", [endDate, startDate]);
		}
		
		picker.find(".prev, .next").on("click", function() {
			window.setTimeout(function() {
				EHC.handleDatePeriodRange(ctl, picker);
			}, 10);
		});
		
		jQuery("#" + ctl + " .app-date-accept").on("click", function() {
			var dates = picker.bootstrapDP("getUTCDates");
			App.postAjax(selectAction, JSON.stringify([dates[0].getTime() / 1000, dates[1].getTime() / 1000]), "spinner");
		});
		
		jQuery("#" + ctl + " .app-date-clear").on("click", function() {
			App.postAjax(clearAction, "", "spinner");
		});
	},
	
	handleDatePeriodRange: function(ctl, picker) {
		picker.find("td.day[data-date]").removeClass("app-date-range");
		var dates = picker.bootstrapDP("getUTCDates");
		var fromEl = jQuery("#" + ctl + "_from");
		var toEl = jQuery("#" + ctl + "_to");
		var start, end;
		var locale = $.fn.bootstrapDP.dates[jQuery("html").attr("lang")];
		
		if (dates.length > 0) {
			jQuery("#" + ctl + " .app-date-clear").removeClass("hidden");
			start = dates[0].getTime();
			fromEl.html(EHC.formatDate(dates[0], locale));
		} else {
			jQuery("#" + ctl + " .app-date-clear").addClass("hidden");
		}
		
		if (dates.length > 1) {
			end = dates[1].getTime();
			if (start > end) {
				var st = start;
				start = end;
				end = st;
			}

			fromEl.html(EHC.formatDate(new Date(start), locale));
			toEl.html(EHC.formatDate(new Date(end), locale));
			
			var day = 86400000;
			for (var t = start + day; t < end; t = t + day) {
				picker.find("td.day[data-date='" + t + "']").addClass("app-date-range");
			}
			
			jQuery("#" + ctl + " .app-date-clear").removeClass("hidden");
		} 
	},
	
	formatDate: function(date, locale) {
		return locale.daysMin[date.getDay()].substr(0, 2) + ", " + date.getDate() + " " + locale.monthsShort[date.getMonth()].replace(".", "");
	},
	
	handleHotelList: function(count) {
		jQuery(".app-hotel-item-s23").off("click").on("click", function() {
			var desc = jQuery("#descs" + jQuery(this).attr("data-id"));
			if (desc.is(":visible")) {
				desc.slideUp(100);
				jQuery(this).find(".fa-chevron-down").show();
				jQuery(this).find(".fa-chevron-up").hide();
			} else {
				desc.slideDown(100);
				jQuery(this).find(".fa-chevron-down").hide();
				jQuery(this).find(".fa-chevron-up").show();
			}
		});
		
		jQuery(".app-hotel-item-addr-toggle").off("click").on("click", function(ev) {
			jQuery(".popover").remove();
			var tip = jQuery(this).parent().find(".app-hotel-item-addr");
			if (tip.is(":visible")) {
				tip.slideUp(100);
			} else {
				jQuery(".app-hotel-item-addr").slideUp(100);
				tip.slideDown(100);
			}
		});
		
		jQuery(document).on("click", function(ev) {
			jQuery(".popover").remove();
			if (!jQuery(ev.target).hasClass("app-hotel-item-addr-toggle")) {
				jQuery(".app-hotel-item-addr").slideUp(100);
			}
		});
		
		jQuery(".app-hotel-item-addr").on("click", function(ev) {
   			ev.stopPropagation();
		});
		
		jQuery(".app-hotel-item-s11 .fa-chevron-down").off("click").on("click", function() {
			jQuery(this).parents(".app-hotel-item-s").find(".app-hotel-item-s3").slideDown(100);
			jQuery(this).hide();
			jQuery(this).parents(".app-hotel-item-s").find(".app-hotel-item-s11 .fa-chevron-up").show();
		});
		
		jQuery(".app-hotel-item-s11 .fa-chevron-up").off("click").on("click", function() {
			jQuery(this).parents(".app-hotel-item-s").find(".app-hotel-item-s3").slideUp(100);
			jQuery(this).hide();
			jQuery(this).parents(".app-hotel-item-s").find(".app-hotel-item-s11 .fa-chevron-down").show();
		});
		
		jQuery(".app-hotel-list .fa-comments, .app-hotel-list .fa-heart-o, .app-hotel-list .fa-heart, .app-hotel-list .fa-times-circle, .app-hotel-list .fa-pencil").popover({ 
			delay: { "show": 500, "hide": 100 }, 
			trigger: "hover", 
			placement: "bottom",
			container: "body"
		});	

		if (count == 0) {
			jQuery(".app-hotel-no-data").show().addClass("fadeIn");
		}
	},
	
	handleHotelSearch: function(control, url, proxy) {
		var ctl = jQuery("#" + control);
		var inp = jQuery("#" + control + " input.textbox");
		
		if (!App.isXs() && !App.isSm()) {
			jQuery(document).on("click", function() {
				if (inp.is(":visible")) {
					EHC.hotelSearchHide(control);
				}
			});
			
	    	jQuery("#" + control).on("click", function(ev) {
	    		if (inp.is(":visible")) {
	    			ev.stopPropagation();
				}
			});
	    	
			jQuery("#" + control + " i.fa-search").off("click").on("click", function() {
				var w = 620; 
				if (ctl.hasClass("app-hotel-search-hidden")) {
					jQuery(".app-hotel-fav-list").slideUp(100);
					jQuery(".app-hotel-fav-menu").removeClass("app-hotel-fav-menu-on");
					jQuery(".app-hotel-search-results").width(w - 40);
					ctl.removeClass("app-hotel-search-hidden").addClass("app-hotel-search-visible");
					jQuery(".app-menu-page").hide();
					inp.animate({ width: w }, 100);
				} else {
					EHC.hotelSearchHide(control);
				}
			});
		}

		jQuery(".app-hotel-search-results ul").perfectScrollbar();
		
		var min = 3;
		
		jQuery(inp).keyup(function(e){
			var s = jQuery.trim(this.value);
			if (s.length >= min) {
				window.clearTimeout(EHC.hotelSearching);
				EHC.hotelSearching = window.setTimeout(function() {
					jQuery("#" + control + " .app-hotel-search-results").slideDown(200);
					EHC.hotelSearch(ctl, proxy, url, s, inp);
				}, 500);
			}
		});
	},
	
	hotelSearch: function(ctl, proxy, url, text, inp) {
		ctl.find(".app-hotel-search-loader").show();
		inp.attr("disabled", "true");
		jQuery.post(url, { s: text}, function(data) {
			data = JSON.parse(data);
			ctl.find(".app-hotel-search-loader").hide();
			var ul = ctl.find(".app-hotel-search-results ul");
			ul.find("li").remove();
			if (data.length > 0) {							
				jQuery.each(data, function(key, item){
					ul.append('<li><a href="" onclick="App.postAjax(\'' + proxy + '\', \'' + item.param + '\', \'spinner\'); return false">' + item.text + '</a></li>');
				});
			}
			inp.removeAttr("disabled");
		});
	},
	
	hotelSearchHide: function(control) {
		var ctl = jQuery("#" + control);
		var inp = jQuery("#" + control + " input.textbox");
		
		inp.animate({ width: 0 }, 100, "swing", function() {
			inp.val(inp.attr("data-hint"));
			ctl.removeClass("app-hotel-search-visible").addClass("app-hotel-search-hidden");
			jQuery("#" + control + " .app-hotel-search-results").hide();
			jQuery(".app-menu-page").show();
		});
	},
	
	handleFavoriteSelector: function(control) {
		var list = jQuery("#" + control + " .app-hotel-fav-list");
		
		jQuery(document).on("click", function() {
			if (list.is(":visible")) {
				list.slideUp(200);
				jQuery(".app-hotel-fav-menu").removeClass("app-hotel-fav-menu-on");
			}
		});
		
    	jQuery("#" + control).on("click", function(ev) {
    		if (list.is(":visible")) {
    			ev.stopPropagation();
			}
		});
		
		jQuery("#" + control + " .app-hotel-fav-toggle").off("click").on("click", function() {
			if (list.is(":hidden")) {
				list.slideDown(200);
				jQuery(".app-hotel-fav-menu").addClass("app-hotel-fav-menu-on");
			} else {
				list.slideUp(200);
				jQuery(".app-hotel-fav-menu").removeClass("app-hotel-fav-menu-on");
			}
		});
		
		jQuery(".app-hotel-fav-menu").removeClass("app-hotel-fav-menu-on");
	},
	
	handleSelectedHotels: function(ctl) {
		jQuery("#" + ctl + " .app-selected-hotels-title div").off("click").on("click", function() {
			if (jQuery("#" + ctl).hasClass("app-selected-hotels-exp")) {
				jQuery("#" + ctl + " .app-selected-hotels-items").slideUp(100);
				jQuery("#" + ctl).removeClass("app-selected-hotels-exp");
			} else {
				jQuery("#" + ctl + " .app-selected-hotels-items").slideDown(100);
				jQuery("#" + ctl).addClass("app-selected-hotels-exp");
			}
		});
	},
	
	handleHotel: function(inLat, inLng, visitProxy) {
		jQuery(document).ready(function() {
			lc_lightbox(".app-hotel-gallery a", {
				skin: "dark",
				slideshow: false,
				socials: false,
				txt_toggle_cmd: false,
				ol_color: "#000000",
				ol_opacity: 0.9,
				nav_btn_pos: "middle"
			});
		});
		
		if (inLat != undefined && inLng != undefined) {
			var latLng = new google.maps.LatLng(inLat, inLng);
			
			var styledMap = [
			    {
			        "featureType": "administrative",
			        "elementType": "labels.text.fill",
			        "stylers": [
			            {
			                "color": "#444444"
			            }
			        ]
			    },
			    {
			        "featureType": "administrative.country",
			        "elementType": "geometry.fill",
			        "stylers": [
			            {
			                "visibility": "off"
			            },
			            {
			                "color": "#fc6e6e"
			            }
			        ]
			    },
			    {
			        "featureType": "administrative.province",
			        "elementType": "geometry.fill",
			        "stylers": [
			            {
			                "visibility": "off"
			            },
			            {
			                "hue": "#008aff"
			            }
			        ]
			    },
			    {
			        "featureType": "landscape",
			        "elementType": "all",
			        "stylers": [
			            {
			                "color": "#f2f2f2"
			            }
			        ]
			    },
			    {
			        "featureType": "poi",
			        "elementType": "all",
			        "stylers": [
			            {
			                "visibility": "off"
			            }
			        ]
			    },
			    {
			        "featureType": "road",
			        "elementType": "all",
			        "stylers": [
			            {
			                "saturation": -100
			            },
			            {
			                "lightness": 45
			            }
			        ]
			    },
			    {
			        "featureType": "road.highway",
			        "elementType": "all",
			        "stylers": [
			            {
			                "visibility": "simplified"
			            }
			        ]
			    },
			    {
			        "featureType": "road.arterial",
			        "elementType": "labels.icon",
			        "stylers": [
			            {
			                "visibility": "off"
			            }
			        ]
			    },
			    {
			        "featureType": "transit",
			        "elementType": "all",
			        "stylers": [
			            {
			                "visibility": "off"
			            }
			        ]
			    },
			    {
			        "featureType": "water",
			        "elementType": "all",
			        "stylers": [
			            {
			                "color": "#bee0ee"
			            },
			            {
			                "visibility": "on"
			            }
			        ]
			    }
			];
			
			var blockOptions = {
				center: latLng,
				zoom: 15,
				disableDoubleClickZoom: true,
				streetViewControl: false,
				zoomControl: false,
				mapTypeControl: false,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				styles: styledMap
			};
			
			var blockMap = new google.maps.Map(jQuery(".app-hotel-map")[0], blockOptions);
			
			var blockMarker = new google.maps.Marker({
				position: latLng,
				map: blockMap,
				icon: "/images/pin.png"
			});
		}
		
		if (visitProxy != undefined) {
			window.setTimeout(function() {
				console.log("insertVisit");
				App.postAjax(visitProxy);
			}, 60000);
		}
	},
	
	removeFavoriteHotelFromList(obj, proxy) {
		jQuery(".popover").remove();
		var item = jQuery(obj).parents("div[data-id]");
		var id = item.attr("data-id");
		jQuery(item).addClass("fadeOut").one(App.getAnimationEndEvent(), function() {
			jQuery(item).hide();
			App.postAjax(proxy, id);
		});
	},
	
	removeFavoriteHotelFromControl(obj, proxy, id) {
		var item = jQuery(obj).parents("div.app-hotel-fav-item");
		jQuery(item).addClass("fadeOut").one(App.getAnimationEndEvent(), function() {
			jQuery(item).hide();
			var total = jQuery(".app-hotel-fav-list div.app-hotel-fav-item:visible").length;
			if (total == 0) {
				jQuery(".app-hotel-fav-link").addClass("hidden");
				jQuery(".app-hotel-fav-empty").removeClass("hidden").addClass("fadeIn");
			}
			App.postAjax(proxy, id + "");
		});
	},
	
	handleHotelEditor: function(hotel, uploadUrl, cropUrl, deleteProxy) {
		jQuery(document).ready(function() {
			lc_lightbox(".app-hotel-gallery a", {
				skin: "dark",
				slideshow: false,
				socials: false,
				txt_toggle_cmd: false,
				ol_color: "#000000",
				ol_opacity: 0.9,
				nav_btn_pos: "middle"
			});
			
			var uploader = new qq.FineUploaderBasic({
				button: document.getElementById("newImage"),
				messages: {
					fileInputTitle: "Dodaj zdjÄ™cia"
				},
				request: {
					endpoint: uploadUrl,
					params: {
						hotel: hotel
					}
				},
				validation: {
					allowedExtensions: ["jpg", "jpeg", "png"],
					stopOnFirstInvalidFile: false
				},
				callbacks: {
					onProgress: function() {
						jQuery("#spinner_ctl").show();
					},
					onAllComplete: function() {
						location.reload();
					}
				}
			});
			
			var cropper;
			
			jQuery(".app-hotel-gallery .app-hotel-edt-2").on("click", function() {
				if (cropper != undefined) {
					cropper.destroy();
				}
				
				jQuery(".app-hotel-edt-dlg div img").remove();
				jQuery(".app-hotel-edt-dlg div").append("<img/>");
				var img = jQuery(".app-hotel-edt-dlg div img");
				var imgName = jQuery(this).parents(".app-hotel-img-edited").attr("data-img");
				img.attr("src", "/images/hotel/" + hotel + "/" + imgName);
				jQuery(".app-hotel-edt-dlg p").attr("data-img", imgName);
				
				cropper = new Cropper(img.get(0), {
					aspectRatio: 20/17,
					guides: false,
					minCropBoxWidth: 600,
					minCropBoxHeight: 510
				});
				
				qc.getWrapper("resizeDialog").showDialogBox();
			});
			
			jQuery(".app-hotel-edt-dlg p").off("click").on("click", function() {
				var imageData = cropper.getCroppedCanvas().toDataURL("image/jpeg");
				
				var formData = new FormData();
				var b64 = imageData.replace('data:image/jpeg;base64,', '');
			    var binary = atob(b64);
			    var array = [];
			    for (var i = 0; i < binary.length; i++) {
			        array.push(binary.charCodeAt(i));
			    }
			    var data = new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
				
			    formData.append("hotel", hotel);
				formData.append("image", data, jQuery(this).attr("data-img"));
				var xhr = new XMLHttpRequest();
				xhr.open("POST", cropUrl, true);
				xhr.onload = function() {
					location.reload();
				};
				xhr.send(formData);
			});

			jQuery("#delAllImages").on("click", function() {
				var toDel = [];
				jQuery(".app-hotel-gallery .app-hotel-img-dim").each(function() {
					toDel.push(jQuery(this).attr("data-img"));
				});
				App.postAjax(deleteProxy, JSON.stringify(toDel), "spinner", function() {
					location.reload();
				});
			});
			
			var dimSize = jQuery(".app-hotel-gallery .app-hotel-img-dim").length;
			if (dimSize == 0) {
				jQuery("#delAllImages").hide();
			}
		});
	}
};

jQuery(window).resize(function() {
	if (!App.isXs() && !App.isSm()) {
		jQuery(".app-menu-xs-bck").hide();
	}
});

function togglePayment(pmt, callback) {
	if (pmt == 25 || pmt == 1) {
		jQuery(".ordPh1").show();
		jQuery(".ordPh1 input").focus();
	} else {
		jQuery(".ordPh1").hide();
	}
	
	jQuery(".pmtDetailsVisible").each(function(){
		if (this.id != "pmntDetails" + pmt + "cPLcnt") {
			jQuery(this).removeClass("pmtDetailsVisible").slideUp(400, callback);
		}
	});
}

function togglePaymentDetails(pmt, callback) {
	if (jQuery("#" + pmt).hasClass("pmtDetailsVisible")) {
		jQuery("#" + pmt).removeClass("pmtDetailsVisible").slideUp(400, callback);
	} else {
		jQuery(".paymentDetails").removeClass("pmtDetailsVisible").hide();
		jQuery("#" + pmt).addClass("pmtDetailsVisible").slideDown(400, callback);
	}
}

function extendedLoading(obj, form) {
	window.setTimeout(function(){
		qc.pA(form, obj, 'ClickEvent', '', '');
	}, 3000);
}

function isChequeAvailable(obj, form) {
	window.setTimeout(function() {
		qc.pA(form, obj, 'ClickEvent', '', '');
	}, 5000);
}
