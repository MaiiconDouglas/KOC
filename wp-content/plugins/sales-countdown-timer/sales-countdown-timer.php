<?php
/**
 * Plugin Name: Sales Countdown Timer
 * Plugin URI: https://villatheme.com/extensions/sales-countdown-timer/
 * Description: Create a sense of urgency with a countdown to the beginning or end of sales, store launch or other events for higher conversions.
 * Version: 1.0.5.6
 * Author: VillaTheme
 * Author URI: http://villatheme.com
 * Text Domain: sales-countdown-timer
 * Copyright 2018 VillaTheme.com. All rights reserved.
 * Tested up to: 5.5
 */
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
define( 'SALES_COUNTDOWN_TIMER_VERSION', '1.0.5.6' );
/**
 * Detect plugin. For use on Front End only.
 */

include_once( ABSPATH . 'wp-admin/includes/plugin.php' );
if ( is_plugin_active( 'sctv-sales-countdown-timer/sctv-sales-countdown-timer.php' ) ) {
	return;
}
$init_file = WP_PLUGIN_DIR . DIRECTORY_SEPARATOR . "sales-countdown-timer" . DIRECTORY_SEPARATOR . "includes" . DIRECTORY_SEPARATOR . "define.php";
require_once $init_file;

/**
 * Class SALES_COUNTDOWN_TIMER
 */
class SALES_COUNTDOWN_TIMER {
	public function __construct() {

		register_activation_hook( __FILE__, array( $this, 'install' ) );
		register_deactivation_hook( __FILE__, array( $this, 'uninstall' ) );
	}

	/**
	 * When active plugin Function will be call
	 */
	public function install() {
		global $wp_version;
		if ( version_compare( $wp_version, "4.4", "<" ) ) {
			deactivate_plugins( basename( __FILE__ ) ); // Deactivate our plugin
			wp_die( "This plugin requires WordPress version 4.4 or higher." );
		}
	}

	/**
	 * When deactive function will be call
	 */
	public function uninstall() {

	}
}

new SALES_COUNTDOWN_TIMER();