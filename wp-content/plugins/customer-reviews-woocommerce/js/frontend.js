jQuery(document).ready(function($) {
  // Initial resize all items in [cusrev_reviews_grid]
  resizeAllGridItems();
  // Resize all items in [cusrev_reviews_grid] on window resize
  jQuery(window).resize(function () {
    resizeAllGridItems();
  });
  //enable attachment of images to comments
  jQuery('form#commentform').attr( "enctype", "multipart/form-data" ).attr( "encoding", "multipart/form-data" );
  //prevent review submission if captcha is not solved
  jQuery("#commentform").submit(function(event) {
    if( ajax_object.ivole_recaptcha === '1' ) {
      var recaptcha = jQuery("#g-recaptcha-response").val();
      if (recaptcha === "") {
        event.preventDefault();
        alert("Please confirm that you are not a robot");
      }
    }
    if( ajax_object.ivole_allow_empty_comment === '0' && jQuery("#cr-ajax-reviews-review-form form#commentform textarea#comment").val().trim().length === 0 ) {
      event.preventDefault();
      alert(ajax_object.ivole_allow_empty_comment_alert);
    }
  });
  //show lightbox when click on images attached to reviews
  jQuery("ol.commentlist").on("click", ".ivole-comment-a", function(t) {
    if(ajax_object.ivole_disable_lightbox === '0') {
        //only if lightbox is not disabled in settings of the plugin
        t.preventDefault();
        var o = jQuery(".pswp")[0];
        var pics = jQuery(this).parent().parent().find("img");
        var this_pic = jQuery(this).find("img");
        var inx = 0;
        if (pics.length > 0 && this_pic.length > 0) {
            var a = [];
            for (i = 0; i < pics.length; i++) {
                a.push({
                    src: pics[i].src,
                    w: pics[i].naturalWidth,
                    h: pics[i].naturalHeight,
                    title: pics[i].alt
                });
                if (this_pic[0].src == pics[i].src) {
                    inx = i;
                }
            }
            var r = {
                index: inx
            };
            new PhotoSwipe(o, PhotoSwipeUI_Default, a, r).init();
        }
    }
  });
  //register a listener for votes on for reviews
  jQuery("ol.commentlist").on("click", "a.ivole-a-button-text", function(t) {
    t.preventDefault();
    var reviewIDhtml = jQuery(this).attr('id');
    if(reviewIDhtml != null) {
      var reviewID = reviewIDhtml.match(/\d+/)[0];
      var data = {
        "action": "ivole_vote_review",
        "reviewID": reviewID,
        "upvote": 1,
        "security": ajax_object.ajax_nonce
      };
      //check if it is upvote or downvote
      if(reviewIDhtml.indexOf("ivole-reviewyes-") >= 0) {
        data.upvote = 1;
      } else if(reviewIDhtml.indexOf("ivole-reviewno-") >= 0) {
        data.upvote = 0;
      } else {
        return;
      }
      jQuery("#ivole-reviewyes-" + reviewID).parent().parent().parent().parent().hide();
      jQuery("#ivole-reviewno-" + reviewID).parent().parent().parent().parent().hide();
      jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_processing);
      jQuery.post(ajax_object.ajax_url, data, function(response) {
        if( response.code === 0 ) {
          jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 1 ) {
          jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 2 ) {
          jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 3 ) {
          jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_error1);
        } else {
          jQuery("#ivole-reviewvoting-" + reviewID).text(ajax_object.text_error2);
        }
      }, "json");
    }
  });
  //show lightbox when click on images attached to reviews
  jQuery(".ivole-video-a, .iv-comment-video-icon").click(function(t) {
    if( ! jQuery( "#iv-comment-videos-id" ).hasClass( "iv-comment-videos-modal" ) ) {
      var tt = t.target.closest("[id^='iv-comment-video-id-']");
      var iid = "#" + tt.id;
      jQuery( "#iv-comment-videos-id" ).addClass( "iv-comment-videos-modal" );
      jQuery( iid ).addClass( "iv-comment-video-modal" );
      jQuery( iid ).find( "video" ).prop( "controls", true );
      jQuery( iid ).find( ".iv-comment-video-icon" ).hide();
      jQuery( iid ).find( "video" ).get(0).play();
      jQuery( iid ).css({
        "top": "50%",
        "margin-top": function() { return -$(this).outerHeight() / 2 }
      });
      return false;
    }
  });
  //close video lightbox
  jQuery("#iv-comment-videos-id").click(function(t) {
    if( jQuery( "#iv-comment-videos-id" ).hasClass( "iv-comment-videos-modal" ) ) {
      jQuery( "#iv-comment-videos-id" ).removeClass( "iv-comment-videos-modal" );
      var vids = jQuery( "#iv-comment-videos-id" ).find("[id^='iv-comment-video-id-']");
      var i = 0;
      var iid = "";
      for( i = 0; i < vids.length; i++ ) {
        iid = "#" + vids[i].id;
        if( jQuery( iid ).hasClass( "iv-comment-video-modal" ) ) {
          jQuery( iid ).removeClass( "iv-comment-video-modal" );
          jQuery( iid ).find( "video").get(0).pause();
          jQuery( iid ).find( "video" ).prop( "controls", false );
          jQuery( iid ).find( ".iv-comment-video-icon" ).show();
          jQuery( iid ).removeAttr("style");
        }
      }
      return false;
    }
  });
  //show more ajax reviews
  jQuery("#cr-show-more-reviews-id").click(function(t){
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery(this).attr("data-nonce");
    var cr_page = jQuery(this).attr("data-page");
    var cr_sort = jQuery("#cr-ajax-reviews-sort").children("option:selected").val();
    var cr_rating = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s a.ivole-histogram-a").attr("data-rating");
    var cr_search = jQuery(".cr-ajax-search input").val();
    if(!cr_rating){
      cr_rating = 0;
    }
    var cr_data = {
      "action": "cr_show_more_reviews",
      "productID": cr_product_id,
      "page": cr_page,
      "sort": cr_sort,
      "rating": cr_rating,
      "search": cr_search,
      "security": cr_nonce
    };
    jQuery(".cr-search-no-reviews").hide();
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      if(response.page > 0){
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
      if(response.html == null && response.page === 1){
        jQuery(".cr-search-no-reviews").show();
      }
    }, "json");
  });
  //ajax sorting of reviews
  jQuery("#cr-ajax-reviews-sort").change(function(t){
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery(this).attr("data-nonce");
    var cr_sort = jQuery(this).children("option:selected").val();
    var cr_rating = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s a.ivole-histogram-a").attr("data-rating");
    if(!cr_rating){
      cr_rating = 0;
    }
    var cr_data = {
      "action": "cr_sort_reviews",
      "productID": cr_product_id,
      "sort": cr_sort,
      "rating": cr_rating,
      "security": cr_nonce
    };
    jQuery(".cr-search-no-reviews").hide();
    jQuery('.cr-ajax-search input').val("").trigger("change");
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery(".commentlist.cr-ajax-reviews-list").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      if(response.page>0){
        jQuery(".commentlist.cr-ajax-reviews-list").empty();
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery(".commentlist.cr-ajax-reviews-list").show();
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
    }, "json");
  });
  //ajax filtering of reviews
  jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").on("click", "a.ivole-histogram-a, .ivole-seeAllReviews", function(t){
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").attr("data-nonce");
    var cr_rating = jQuery(this).attr("data-rating");
    var cr_sort = jQuery("#cr-ajax-reviews-sort").children("option:selected").val();
    var cr_data = {
      "action": "cr_filter_reviews",
      "productID": cr_product_id,
      "rating": cr_rating,
      "sort": cr_sort,
      "security": cr_nonce
    };
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s").removeClass("ivole-histogramRow-s");
    if( cr_rating > 0 ) {
      jQuery(this).closest("tr.ivole-histogramRow").addClass("ivole-histogramRow-s");
    }
    jQuery(".cr-search-no-reviews").hide();
    jQuery('.cr-ajax-search input').val("").trigger("change");
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery(".commentlist.cr-ajax-reviews-list").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      if(response.page>0){
        jQuery("div#cr-ajax-reviews-fil-sta").remove();
        jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").append(response.filter_note);
        jQuery(".commentlist.cr-ajax-reviews-list").empty();
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery(".commentlist.cr-ajax-reviews-list").show();
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
    }, "json");
  });
  //ajax search of reviews
  jQuery('.cr-ajax-search input').on("keyup", function(e){
      if(e.keyCode == 13){
          jQuery(".cr-ajax-search button").trigger("click");
      }
      //show clear icon
      if(jQuery(this).val() != "") jQuery(".cr-clear-input").css("display", "inline-block");
  }).on("change", function(){
      if(jQuery(this).val() === "") jQuery(".cr-clear-input").hide();
  });
  jQuery(".cr-clear-input").on("click", function () {
    jQuery(this).prev("input").val("");
    jQuery(".cr-clear-input").hide();
    jQuery(".cr-ajax-search button").trigger("click");
  });
  jQuery(".cr-ajax-search button").on("click", function (e) {
    e.preventDefault();

    jQuery("#cr-show-more-reviews-id").attr("data-page", 0);
    //clear reviews
    jQuery(".cr-reviews-ajax-comments .cr-ajax-reviews-list").empty();

    jQuery("#cr-show-more-reviews-id").trigger("click");
  });
  jQuery("button.cr-ajax-reviews-add-review").click(function(t){
    t.preventDefault();
    jQuery("#comments.cr-reviews-ajax-comments").hide();
    jQuery("#cr-ajax-reviews-review-form").show();
  });
  jQuery("a#cr-ajax-reviews-cancel").click(function(t){
    t.preventDefault();
    jQuery("#cr-ajax-reviews-review-form").hide();
    jQuery("#comments.cr-reviews-ajax-comments").show();
  });
  jQuery("div.iv-comment-image-top img").click(function(t){
    t.preventDefault();
    var slide_no = jQuery(this).data("slide");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-mask").addClass("cr-mask-active");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal-cont").addClass("cr-mask-active");
    jQuery("body").addClass("cr-noscroll");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('setPosition');
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('setPosition');
    if(typeof slide_no !== 'undefined') {
      jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('slickGoTo',slide_no,true);
      jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('slickGoTo',slide_no,true);
    }
  });
  jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-mask, #reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal button.cr-ajax-reviews-cus-images-close").click(function(t){
    t.preventDefault();
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('refresh');
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('refresh');
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-mask").removeClass("cr-mask-active");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal-cont").removeClass("cr-mask-active");
    jQuery("body").removeClass("cr-noscroll");
  });
  //Product variations
  $( ".single_variation_wrap" ).on( "show_variation", function ( event, variation ) {
    if(jQuery(".cr_gtin").length){
      jQuery(".cr_gtin_val").text(variation._cr_gtin);
    }
    if(jQuery(".cr_mpn").length){
      jQuery(".cr_mpn_val").text(variation._cr_mpn);
    }
    if(jQuery(".cr_brand").length){
      jQuery(".cr_brand_val").text(variation._cr_brand);
    }
  });
  //Reset Product variations
  jQuery(document).on('reset_data', function () {

    var $cr_gtin = jQuery(".cr_gtin"),
        $cr_mpn = jQuery(".cr_mpn"),
        $cr_brand = jQuery(".cr_brand");

    if($cr_gtin.length){
      jQuery(".cr_gtin_val").text($cr_gtin.data("o_content"));
    }
    if($cr_mpn.length){
      jQuery(".cr_mpn_val").text($cr_mpn.data("o_content"));
    }
    if($cr_brand.length){
      jQuery(".cr_brand_val").text($cr_brand.data("o_content"));
    }
  });
  //show more ajax reviews in the grid
  jQuery(".ivole-show-more-button").on("click", function (e) {
    e.preventDefault();

    var $this = jQuery(this),
    $spinner =  $this.next(".ivole-show-more-spinner"),
    attributes = $this.parents(".ivole-reviews-grid").data("attributes");

    attributes.offset = $this.parents(".ivole-reviews-grid").find(".ivole-review-card.cr-card-product").length;
    attributes.shop_offset = $this.parents(".ivole-reviews-grid").find(".ivole-review-card.cr-card-shop").length;

    var grid_data = {
      'action': "ivole_show_more_grid_reviews",
      'attributes': attributes
    };

    $this.hide();
    $spinner.show();

    jQuery.post(ajax_object.ajax_url, grid_data, function(response) {
      $spinner.hide();
      $reviews = jQuery(response.html).find(".ivole-reviews-grid-inner");
      if($reviews.length){
        $this.parents(".ivole-reviews-grid").find(".ivole-reviews-grid-inner").append($reviews.html());
        $this.show();
        resizeAllGridItems();
      } else {
        $this.hide();
      }
    }).fail(function(response) {
      $spinner.hide();
      $this.show();
      $this.parent().append('<div style="color: #cd2653;text-align: center;display: block;">'+response.responseText+'</div>');
    });
  });
  jQuery('#cr_floatingtrustbadge_front').click(function(){
    if( !jQuery(this).hasClass( 'cr-floatingbadge-big' ) ) {
      jQuery(this).find('img.cr_floatingtrustbadge_small').hide();
      jQuery(this).find('a.cr_floatingtrustbadge_big').css( 'display', 'block' );
      jQuery(this).find('div.cr-floatingbadge-close').css( 'display', 'block' );
      jQuery(this).addClass( 'cr-floatingbadge-big' );
      //update colors
      var crcolors = jQuery(this).data('crcolors');
      if (typeof crcolors !== 'undefined') {
        jQuery(this).css( 'border-color', crcolors['big']['border'] );
        jQuery(this).find('div.cr-floatingbadge-background-top').css( 'background-color', crcolors['big']['top'] );
        jQuery(this).find('div.cr-floatingbadge-background-middle').css( 'background-color', crcolors['big']['middle'] );
        jQuery(this).find('div.cr-floatingbadge-background-bottom').css( 'background-color', crcolors['big']['bottom'] );
        jQuery(this).find('div.cr-floatingbadge-background-bottom').css( 'border-color', crcolors['big']['border'] );
      }
    }
  });
  jQuery('#cr_floatingtrustbadge_front .cr-floatingbadge-close').click(function(event){
    if( jQuery('#cr_floatingtrustbadge_front').hasClass( 'cr-floatingbadge-big' ) ) {
      jQuery(this).closest('#cr_floatingtrustbadge_front').find('a.cr_floatingtrustbadge_big').hide();
      jQuery(this).closest('#cr_floatingtrustbadge_front').find('img.cr_floatingtrustbadge_small').css( 'display', 'block' );
      jQuery(this).closest('#cr_floatingtrustbadge_front').removeClass( 'cr-floatingbadge-big' );
      //update colors
      var crcolors = jQuery(this).closest('#cr_floatingtrustbadge_front').data('crcolors');
      if (typeof crcolors !== 'undefined') {
        jQuery(this).closest('#cr_floatingtrustbadge_front').css( 'border-color', crcolors['small']['border'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-top').css( 'background-color', crcolors['small']['top'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-middle').css( 'background-color', crcolors['small']['middle'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-bottom').css( 'background-color', crcolors['small']['bottom'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-bottom').css( 'border-color', crcolors['small']['border'] );
      }
    } else {
      jQuery('#cr_floatingtrustbadge_front').hide();
      document.cookie = 'cr_hide_trustbadge=true; path=/; max-age='+60*60*24+';';
    }
    event.stopPropagation();
  });
});

function resizeAllGridItems(){
    jQuery('.ivole-reviews-grid-inner > .ivole-review-card').each(function() {
      let $parent = jQuery( this ).parent();
      if($parent.width() < 600 && !$parent.hasClass("cr-single-column")){
        $parent.addClass("cr-single-column");
      }
      let rowHeight = parseInt( $parent.css('grid-auto-rows') );
      let rowGap = parseInt( $parent.css('grid-row-gap') );
      let rowSpan = Math.ceil( ( jQuery( this ).find('.ivole-review-card-content').height() + rowGap ) / ( rowHeight + rowGap ) );
      rowSpan += 5;
      jQuery( this ).css( 'gridRowEnd', 'span ' + rowSpan );
    });
}
