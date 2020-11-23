<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'CR_Export_Reviews' ) ):

class CR_Export_Reviews {

    /**
     * @var string URL to admin reviews import page
     */
    protected $page_url;

    /**
     * @var Ivole_Import_Admin_Menu The instance of the admin menu
     */
    protected $admin_menu;

    /**
     * @var string The slug of this tab
     */
    protected $tab;

    /**
     * @var array The fields for this tab
     */
    protected $settings;

    public function __construct( $admin_menu ) {
        $this->admin_menu = $admin_menu;

        $this->tab = 'export';

        $this->page_url = add_query_arg( array(
            'page' => $_GET['page']
        ), admin_url( 'admin.php' ) );

        add_action( 'admin_init', array( $this, 'handle_download' ) );

        add_filter( 'cr_import_export_tabs', array( $this, 'register_tab' ) );
        add_action( 'cr_import_export_display_' . $this->tab, array( $this, 'display' ) );

        add_action( 'admin_enqueue_scripts', array( $this, 'include_scripts' ) );
    }

    public function register_tab( $tabs ) {
        $tabs[$this->tab] = __( 'Export', 'customer-reviews-woocommerce' );
        return $tabs;
    }

    public function display() {
        $this->init_settings();
        WC_Admin_Settings::output_fields( $this->settings );

        $download_url = add_query_arg( array(
            'action'   => 'cr-download-export-reviews',
            '_wpnonce' => wp_create_nonce( 'download_csv_export_reviews' )
        ), $this->page_url );

        ?>
        <div id="cr-export-reviews">
            <button type="button" class="button button-primary" id="cr-export-button"><?php _e( 'Export', 'customer-reviews-woocommerce' ); ?></button>
            <?php
            if( file_exists( CR_Reviews_Exporter::FILE_PATH ) ):
            ?>
            <a href="<?php echo esc_url( $download_url ); ?>" class="button button-primary" target="_blank"><?php _e( 'Download', 'customer-reviews-woocommerce' ); ?></a>
            <?php
            endif;
            ?>
        </div>
        <div id="cr-export-progress">
            <h2 id="cr-export-text"><?php _e( 'Export is in progress', 'customer-reviews-woocommerce' ); ?></h2>
            <progress id="cr-export-progress-bar" max="100" value="0"></progress>
            <div>
                <button id="cr-export-cancel" class="button button-secondary"><?php _e( 'Cancel', 'customer-reviews-woocommerce' ); ?></button>
            </div>
        </div>
        <div id="cr-export-results">
            <h3 id="cr-export-result-status"><?php _e( 'Export Completed', 'customer-reviews-woocommerce' ); ?></h3>
            <p id="cr-export-result-started"></p>
            <p id="cr-export-result-finished"></p>
            <p id="cr-export-result-exported"></p>
            <br>
            <a id="cr-export-download" href="<?php echo esc_url( $download_url ); ?>" class="button button-primary" style="display: none"><?php _e( 'Download', 'customer-reviews-woocommerce' ); ?></a>
        </div>

        <?php
    }

    public function handle_download(){
        if( isset( $_GET['action'] ) && $_GET['action'] === 'cr-download-export-reviews' ){
            // Ensure a valid nonce has been provided
            if ( ! isset( $_GET['_wpnonce'] ) || ! wp_verify_nonce( $_GET['_wpnonce'], 'download_csv_export_reviews' ) ) {
                wp_die( sprintf( __( 'Failed to download: invalid nonce. <a href="%s">Return to settings</a>', 'customer-reviews-woocommerce' ), $this->page_url ) );
            }

            $filename = CR_Reviews_Exporter::FILE_PATH;

            header( 'Content-Description: File Transfer' );
            header( 'Content-Type: application/octet-stream' );
            header( 'Content-Disposition: attachment; filename="export-reviews.csv"' );
            header( 'Content-Transfer-Encoding: binary' );
            header( 'Connection: Keep-Alive' );
            header( 'Expires: 0' );
            header( 'Cache-Control: must-revalidate, post-check=0, pre-check=0' );
            header( 'Pragma: public' );
            header( 'Content-Length: ' . filesize($filename) );

            //echo file_get_contents($filename);
            readfile($filename);

            exit;
        }
    }

    protected function init_settings() {
      $desc = '';
      if( file_exists( CR_Reviews_Exporter::FILE_PATH ) ) {
        $desc = __( 'A utility to export reviews to a CSV file. Use the Export button to start export of reviews. Use the Download button to download the last export.', 'customer-reviews-woocommerce' );
      } else {
        $desc = __( 'A utility to export reviews to a CSV file.', 'customer-reviews-woocommerce' );
      }
      $this->settings = array(
          array(
              'title' => __( 'Export Reviews to CSV File', 'customer-reviews-woocommerce' ),
              'type'  => 'title',
              'desc'  => $desc,
              'id'    => 'cr_export'
          ),
          array(
              'type' => 'sectionend',
              'id'   => 'cr_export'
          )
      );
    }

    public function is_this_tab() {
      return $this->admin_menu->is_this_page() && ( $this->admin_menu->get_current_tab() === $this->tab );
    }

    public function include_scripts() {
        wp_register_script( 'cr-export-reviews', plugins_url( 'js/admin-export.js', __FILE__ ), [ 'jquery' ] );

        wp_localize_script( 'cr-export-reviews', 'CrExportStrings', array(
            'exporting'        => __( 'Export is in progress (%s/%s completed)', 'customer-reviews-woocommerce' ),
            'cancelling'       => __( 'Cancelling', 'customer-reviews-woocommerce' ),
            'cancel'           => __( 'Cancel', 'customer-reviews-woocommerce' ),
            'export_cancelled' => __( 'Export Cancelled', 'customer-reviews-woocommerce' ),
            'export_failed'    => __( 'Export Failed', 'customer-reviews-woocommerce' ),
            'result_started'   => __( 'Started: %s', 'customer-reviews-woocommerce' ),
            'result_finished'  => __( 'Finished: %s', 'customer-reviews-woocommerce' ),
            'result_cancelled' => __( 'Cancelled: %s', 'customer-reviews-woocommerce' ),
            'result_imported'  => __( '%d review(s) successfully exported', 'customer-reviews-woocommerce' ),
        ) );

        wp_enqueue_script( 'cr-export-reviews' );
    }
}

endif;
