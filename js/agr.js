var AGR = {
	handleAgreement: function(ctl, pckId, id) {
		var more = jQuery("#" + ctl + " span.more");
		var full = jQuery("#" + ctl + " span.full");
		
		more.off("click").on("click", function() {
			more.hide();
			full.show();
		});
		
		jQuery("#" + ctl + " input").on("change", function() {
			if (id == 0) {
				jQuery(".checkbox[data-agr-pck='" + pckId + "'] label").checkbox("check");
			} else if (!jQuery(this).is(":checked")) {
				jQuery(".checkbox[data-agr-pck='" + pckId + "'][data-agr-id='0'] label").checkbox("uncheck");
			}
		});
	},
	
	handleInquiryReport: function(inp) {
		var hint = jQuery("#" + inp).attr("data-hint");
		var val = jQuery.trim(jQuery("#" + inp).val());
		
		if (val != "" && val != hint) {
			jQuery(".app-inq-agr").show();
		} else {
			jQuery(".app-inq-agr").hide();
		}
		
		jQuery("#" + inp).off("keyup").on("keyup", function() {
			if (jQuery.trim(jQuery(this).val()) != "") {
				jQuery(".app-inq-agr").slideDown(100);
			} else {
				jQuery(".app-inq-agr").slideUp(100);
			}
		}).off("keydown").on("keydown", function(event) {
			if (event.keyCode == 13) {
				return false;
			}
		});
	}
};