<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'Ivole_Premium_Settings' ) ):

class Ivole_Premium_Settings {

    /**
     * @var Ivole_Settings_Admin_Menu The instance of the settings admin menu
     */
    protected $settings_menu;

    /**
     * @var string The slug of this tab
     */
    protected $tab;

    /**
     * @var array The fields for this tab
     */
    protected $settings;

    public function __construct( $settings_menu ) {
        $this->settings_menu = $settings_menu;

        $this->tab = 'license-key';

        add_filter( 'ivole_settings_tabs', array( $this, 'register_tab' ) );
        add_action( 'ivole_settings_display_' . $this->tab, array( $this, 'display' ) );
        add_action( 'ivole_save_settings_' . $this->tab, array( $this, 'save' ) );
        add_action( 'admin_footer', array( $this, 'output_page_javascript' ) );
    }

    public function register_tab( $tabs ) {
        $tabs[$this->tab] = __( '&#9733; License Key &#9733;', IVOLE_TEXT_DOMAIN );
        return $tabs;
    }

    public function display() {
        $this->init_settings();
        WC_Admin_Settings::output_fields( $this->settings );
    }

    public function save() {
        $this->init_settings();

        $field_id = 'ivole_license_key';
				if( !empty( $_POST ) && isset( $_POST[$field_id] ) ) {
					//error_log( print_r( $_POST[$field_id], true ) );
					$license = new Ivole_License();
					$license->register_license( $_POST[$field_id] );
				}

        WC_Admin_Settings::save_fields( $this->settings );
    }

    protected function init_settings() {
        $this->settings = array(
            array(
                'title' => __( 'Types of License Keys', IVOLE_TEXT_DOMAIN ),
                'type'  => 'title',
                'desc'  => __( '<p>Customer Reviews (CR) service works with two types of license keys: (1) professional and (2) free.</p><p>(1) You can unlock <b>all</b> features for managing customer reviews by purchasing a professional license key => <a href="https://www.cusrev.com/business/" target="_blank">Professional License Key</a><img src="' . untrailingslashit( plugin_dir_url( __FILE__ ) ) . '/img/external-link.png' .'" class="cr-product-feed-categories-ext-icon"></p>' .
                '<p>(2) Basic features of CR service (e.g., social media integration, analytics, replies to reviews) are available for free but require a (free) license key. If you would like to request a free license key (no pro features), create an account here => <a href="https://www.cusrev.com/register.html" target="_blank">Free License Key</a><img src="' . untrailingslashit( plugin_dir_url( __FILE__ ) ) . '/img/external-link.png' .'" class="cr-product-feed-categories-ext-icon"></p>', IVOLE_TEXT_DOMAIN ) .
                '<p>' . sprintf( __( 'An overview of features available in the Free and Pro versions of Customer Reviews: %s', IVOLE_TEXT_DOMAIN ), '<a href="https://www.cusrev.com/business/pricing.html" target="_blank">Free vs Pro</a><img src="' . untrailingslashit( plugin_dir_url( __FILE__ ) ) . '/img/external-link.png' .'" class="cr-product-feed-categories-ext-icon"></p>'),
                'id'    => 'ivole_options_premium'
            ),
            array(
                'type' => 'sectionend',
                'id'   => 'ivole_options_premium'
            ),
            array(
                'title' => __( 'License Key', IVOLE_TEXT_DOMAIN ),
                'type'  => 'title',
                'desc'  => __( 'Please enter your license key (free or pro) in the field below. The plugin will automatically determine type of your license key.', IVOLE_TEXT_DOMAIN ),
                'id'    => 'ivole_options_license'
            ),
            array(
                'title'    => __( 'License Status', IVOLE_TEXT_DOMAIN ),
                'type'     => 'license_status',
                'desc'     => __( 'Information about license status.', IVOLE_TEXT_DOMAIN ),
                'default'  => '',
                'id'       => 'ivole_license_status',
                'desc_tip' => true
            ),
            array(
                'title'    => __( 'License Key', IVOLE_TEXT_DOMAIN ),
                'type'     => 'text',
                'desc'     => __( 'Enter your license key here.', IVOLE_TEXT_DOMAIN ),
                'default'  => '',
                'id'       => 'ivole_license_key',
                'desc_tip' => true
            ),
            array(
                'type' => 'sectionend',
                'id'   => 'ivole_options_license'
            )
        );
    }

    public function is_this_tab() {
        return $this->settings_menu->is_this_page() && ( $this->settings_menu->get_current_tab() === $this->tab );
    }

    public function output_page_javascript() {
        if ( $this->is_this_tab() ) {
        ?>
            <script type="text/javascript">
                jQuery(function($) {
                    if ( jQuery('#ivole_license_status').length > 0 ) {
                        var data = {
                            'action': 'ivole_check_license_ajax'
                        };

                        jQuery('#ivole_license_status').val( 'Checking...' );

                        jQuery.post(ajaxurl, data, function(response) {
                            jQuery('#ivole_license_status').val( response.message );

                            if ('<?php echo __( 'Active: Professional Version', IVOLE_TEXT_DOMAIN ); ?>' === response.message) {
                                jQuery( '.ivole-upload-shop-logo-submit' ).prop( 'disabled', false );
                                jQuery( '#ivole_upload_shop_logo' ).prop( 'disabled', false );
                            }
                        });
                    }
                });
            </script>
        <?php
        }
    }
}

endif;
