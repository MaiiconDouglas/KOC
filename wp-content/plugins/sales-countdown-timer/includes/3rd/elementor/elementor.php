<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
} // Exit if accessed directly
if ( ! is_plugin_active( 'elementor/elementor.php' ) ) {
	return;
}
add_action( 'elementor/widgets/widgets_registered', function () {
	if ( is_file( SALES_COUNTDOWN_TIMER_INCLUDES . '3rd/elementor/shortcode-widget.php' ) ) {
		require_once( 'shortcode-widget.php' );
		$reviews_widget = new SALES_COUNTDOWN_TIMER_Elementor_Widget();
		Elementor\Plugin::instance()->widgets_manager->register_widget_type( $reviews_widget );
	}
} );