var TFD = {
	PROCESS_INTERVAL: null,
	
	closeCookie: function(cookie) {
		App.setCookie(cookie, 1, 120);
		jQuery(".app-cookie").addClass("fadeOut hidden");
	},
	
	preloadInquiryImages: function(imgCnt) {
		for (var i=1; i<= imgCnt; i++) {
			App.preloadImages("/images/inq/" + i + "/1.jpg", "/images/inq/" + i + "/2.jpg", "/images/inq/" + i + "/3.jpg", "/images/inq/" + i + "/4.jpg");
		}
	},
	
	handleInquiry: function(nextPage, imgCnt) {
		jQuery(".app-blk-2").hide();
		TFD.showProcessTimeout();
	},
	
	handleInquiryFinish: function(email) {
		AGR.handleInquiryReport(email);
		jQuery(".app-blk-2").hide();
		TFD.showProcessTimeout();
	},
	
	handleVoucherInfo: function(url) {
		jQuery(".app-blk-2").hide();
		TFD.showProcessTimeout();
		jQuery(".app-btn-wrp-1 .app-btn-1").on("click", function() {
			location.href = url;
		});
	},
	
	processNextStep: function(proxy) {
		jQuery(".app-blk-1").addClass("fadeOutLeft").one(App.getAnimationEndEvent(), function() {
			jQuery(".app-blk-1").addClass("app-blk-1-hidden");
			App.postAjax(proxy, "", "spinner", function() {
				jQuery(".app-blk-1").removeClass("app-blk-1-hidden").addClass("fadeInRight").one(App.getAnimationEndEvent(), function() {
					jQuery(".app-blk-1").removeClass("fadeInRight");
				});
			});
		});
	},
	
	processNextInquiryPage: function(obj, proxy, isPersonal) {
		jQuery(".app-inq-answ-ctl label").radio("uncheck");
		jQuery(obj).find(".app-inq-answ-ctl label").radio("check");
		if (isPersonal) {
			jQuery(".app-inq-qst-answ").addClass("fadeOut").one(App.getAnimationEndEvent(), function() {
				jQuery(".app-inq-qst-answ").addClass("app-blk-1-hidden");
				App.postAjax(proxy, "", "spinner", function() {
					jQuery(".app-inq-qst-answ").removeClass("app-blk-1-hidden").addClass("fadeInDown").one(App.getAnimationEndEvent(), function() {
						jQuery(".app-inq-qst-answ").removeClass("fadeInDown");
					});
				});
			});
		} else {
			TFD.processNextStep(proxy);
		}
	},
	
	processPrevInquiryPage: function(proxy) {
		jQuery(".app-blk-1").addClass("fadeOutRight").one(App.getAnimationEndEvent(), function() {
			jQuery(".app-blk-1").addClass("app-blk-1-hidden");
			App.postAjax(proxy, "", "spinner", function() {
				jQuery(".app-blk-1").removeClass("app-blk-1-hidden").addClass("fadeInLeft").one(App.getAnimationEndEvent(), function() {
					jQuery(".app-blk-1").removeClass("fadeInLeft");
				});
			});
		});
	},
	
	showProcessTimeout: function() {
		var started = jQuery("#prcStarted").html().trim() - 0;
		var blk = jQuery(".app-cnt div");
		if (started > 0 && blk.length > 0 && TFD.PROCESS_INTERVAL == null) {
			TFD.PROCESS_INTERVAL = window.setInterval(function(){
				var p = 15;
				var blk = jQuery(".app-cnt div");
				var started = jQuery("#prcStarted").html().trim() - 0;
				var now = Math.round((new Date()).getTime() / 1000);
				var end = started + p * 60;
				if (end - now <= 0) {
					if (jQuery("#__env__").val() != "dev") {
						location.href = jQuery("#prcUrl").html();
					}
				} else {
					var curr = new Date((end - now) * 1000);
					var mm = curr.getMinutes();
					if (mm < 10) mm = "0" + mm;
					var ss = curr.getSeconds();
					if (ss < 10) ss = "0" + ss;
					jQuery(blk).html(mm + ":" + ss);
				}
			}, 1000);
		}
	},
	
	togglePayment: function(obj, pmt, type) {
		if (pmt == 25 || pmt == 1) {
			jQuery(".ordPh1").show();
			jQuery(".ordPh1 input").focus();
		} else {
			jQuery(".ordPh1").hide();
		}
		
		jQuery(".app-ord-pmt-4a label.radio-custom").removeClass("app-ord-pmt-4e");
		jQuery(".app-ord-pmt-4c").removeClass("app-ord-pmt-4c-sel");
		jQuery(obj).parents(".app-ord-pmt-4").find(".app-ord-pmt-4c").addClass("app-ord-pmt-4c-sel");
		
		jQuery(".pmtDetailsVisible").each(function(){
			if (this.id != "pmntDetails" + pmt + "cPLcnt") {
				jQuery(this).removeClass("pmtDetailsVisible").slideUp(400);
			}
		});
		
		if (type == "d") {
			jQuery(".app-ord-pmt-1d").removeClass("app-ord-pmt-2o");
			jQuery(".app-ord-pmt-1n").addClass("app-ord-pmt-2o");
			jQuery(".app-ord-pmt-5").hide();
		} else if (type == "n") {
			jQuery(".app-ord-pmt-5").show();
			jQuery(".app-ord-pmt-1n").removeClass("app-ord-pmt-2o");
			jQuery(".app-ord-pmt-1d").addClass("app-ord-pmt-2o");
		}
	}
};
