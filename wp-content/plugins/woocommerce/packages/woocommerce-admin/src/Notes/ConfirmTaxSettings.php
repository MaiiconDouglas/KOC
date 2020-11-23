<?php
/**
 * WooCommerce Admin: Confirm tax settings
 *
 * Adds a note to ask the user to confirm tax settings after automated taxes
 * has been automatically enabled (see OnboardingAutomateTaxes).
 */

namespace Automattic\WooCommerce\Admin\Notes;

defined( 'ABSPATH' ) || exit;

/**
 * ConfirmTaxSettings.
 */
class Confirm_Tax_Settings {
	/**
	 * Note traits.
	 */
	use NoteTraits;

	/**
	 * Name of the note for use in the database.
	 */
	const NOTE_NAME = 'wc-admin-confirm-tax-settings';

	/**
	 * Get the note.
	 *
	 * @return Note
	 */
	public static function get_note() {
		$note = new WC_Admin_Note();

		$note->set_title( __( 'Confirme as configurações de impostos', 'woocommerce' ) );
		$note->set_content( __( 'Cálculos de impostos automatizados são ativados em sua loja por meio do WooCommerce Shipping & Tax. Saiba mais sobre impostos automatizados <a href="https://docs.woocommerce.com/document/woocommerce-services/#section-12">here</a>.', 'woocommerce' ) );
		$note->set_source( 'woocommerce-admin' );
		$note->add_action(
			'confirm-tax-settings_edit-tax-settings',
			__( 'Editar configurações de impostos', 'woocommerce' ),
			admin_url( 'admin.php?page=wc-settings&tab=tax' ),
			WC_Admin_Note::E_WC_ADMIN_NOTE_UNACTIONED,
			true
		);

		return $note;
	}
}
