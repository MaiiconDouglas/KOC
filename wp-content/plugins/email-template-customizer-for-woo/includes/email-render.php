<?php

namespace VIWEC\INC;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Email_Render {

	protected static $instance = null;
	public $preview;
	public $demo;
	public $sent_to_admin;
	public $render_data = [];
	public $plain_text;
	public $template_args;
	public $order;
	public $other_message_content;
	public $class_email;
	protected $order_currency;
	protected $user;
	protected $email_id;
	protected $font_family_default = "Helvetica Neue, Helvetica, Roboto, Arial, sans-serif";

	private function __construct() {
		add_action( 'viwec_render_content', array( $this, 'render_content' ), 10, 2 );
		add_filter( 'gettext', array( $this, 'recover_text' ), 10, 3 );
		add_action( 'viwec_order_item_parts', array( $this, 'order_download' ), 10, 3 );
		add_filter( 'woocommerce_order_shipping_to_display_shipped_via', [ $this, 'remove_shipping_method' ] );
		add_action( 'woocommerce_email_customer_details', [ $this, 'render_html_billing_address_via_hook' ], 20, 5 );
		add_action( 'woocommerce_email_customer_details', [ $this, 'render_html_shipping_address_via_hook' ], 20, 5 );
	}

	public static function init() {
		if ( null == self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public function recover_text( $translation, $text, $domain ) {
		if ( $text == 'Order fully refunded.' ) {
			$translation = $text;
		}

		return $translation;
	}

	public function set_object( $email ) {
		$this->email_id = $email->id;
		$object         = $email->object;
		if ( is_a( $object, 'WC_Order' ) ) {
			$this->order          = $object;
			$this->order_currency = $this->order->get_currency();
		} elseif ( is_a( $object, 'WP_User' ) ) {
			$this->user = $email;
		}
	}

	public function set_user( $user ) {
		$this->user = $user;
	}

	public function order( $order_id ) {
		if ( $order_id ) {
			$this->order = wc_get_order( $order_id );
			if ( $this->order ) {
				$this->order_currency = $this->order->get_currency();
			}
		}
	}

	public function demo_order() {
		$this->demo = true;

		$order = new \WC_Order();
		$order->set_id( 123456 );
		$order->set_billing_first_name( 'John' );
		$order->set_billing_last_name( 'Doe' );
		$order->set_billing_email( 'johndoe@domain.com' );
		$order->set_billing_country( 'US' );
		$order->set_billing_city( 'Azusa' );
		$order->set_billing_state( 'NY' );
		$order->set_payment_method( 'paypal' );
		$order->set_payment_method_title( 'Paypal' );
		$order->set_billing_postcode( 10001 );
		$order->set_billing_phone( '0123456789' );
		$order->set_billing_address_1( 'Ap #867-859 Sit Rd.' );
		$order->set_shipping_total( 10 );
		$order->set_total( 60 );
		$this->order = $order;
	}

	public function demo_new_user() {
		$user             = new \WP_User();
		$user->user_login = 'johndoe';
		$user->user_pass  = '$P$BKpFUPNogZw6kAv/dMrk6CjSmlFI8l0';
		$this->user       = $user;
	}

	public function parse_styles( $data ) {
		if ( empty( $data ) ) {
			return '';
		}

		$style = '';
		if ( is_array( $data ) ) {
			foreach ( $data as $key => $value ) {
				if ( $key === 'border-style' && isset( $data['border-width'] ) && $data['border-width'] == '0px' ) {
					continue;
				}
				$style .= "{$key}:{$value};";
			}

			$border_width = isset( $data['border-width'] ) && $data['border-width'] !== '0px' ? true : false;
			$border_style = isset( $data['border-style'] ) ? true : false;

			$style .= $border_width && ! $border_style ? 'border-style:solid;' : '';
		} else {
			$style = $data;
		}

		return $style;
	}

	public function replace_template( $located, $template_name ) {
		if ( $template_name == 'emails/email-styles.php' ) {
			$located = VIWEC_TEMPLATES . 'email-style.php';
		}

		return $located;
	}

	public function render( $data ) {
		add_filter( 'woocommerce_email_styles', '__return_empty_string' );
		add_filter( 'wc_get_template', array( $this, 'replace_template' ), 10, 2 );

		$bg_style = isset( $data['style_container'] ) ? $this->parse_styles( $data['style_container'] ) : '';

		$this->email_header( $bg_style );
		?>
        <table align='center' width='600' border='0' cellpadding='0' cellspacing='0'>
			<?php
			if ( ! empty( $data['rows'] ) && is_array( $data['rows'] ) ) {
				foreach ( $data['rows'] as $row ) {
					if ( ! empty( $row ) && is_array( $row ) ) {
						$row_outer_style = ! empty( $row['props']['style_outer'] ) ? $this->parse_styles( $row['props']['style_outer'] ) : '';
						?>
                        <tr>
                            <td valign='top' width='100%' style='background-repeat: no-repeat;background-size: cover;background-position: top;<?php echo esc_attr(
								$row_outer_style ) ?>'>

                                <!--[if mso | IE]>
                                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                                    <v:fill type="tile" color="#f2f2f2"></v:fill>
                                </v:background>
                                <![endif]-->

                                <table align='center' width='100%' border='0' cellpadding='0' cellspacing='0' style='border-collapse: collapse;margin: 0; padding:0'>
                                    <tr>
                                        <td valign='top' width='100%' class='viwec-responsive-padding viwec-inline-block' border='0' cellpadding='0' cellspacing='0'
                                            style='width: 100%; font-family: Helvetica Neue, Helvetica, Roboto, Arial, sans-serif;font-size: 0 !important;border-collapse: collapse;margin: 0; padding:0; '>

											<?php
											$end_array = array_keys( $row );
											$end_array = end( $end_array );

											if ( ! empty( $row['cols'] && is_array( $row['cols'] ) ) ) {
												$arr_key    = array_keys( $row['cols'] );
												$start      = current( $arr_key );
												$end        = end( $arr_key );
												$col_number = count( $row['cols'] );
//												$width      = round( 100 / $col_number ) - 0.1 . '%';

												$width = ( 100 / $col_number ) . '%';

												foreach ( $row['cols'] as $key => $col ) {
													$col_style = ! empty( $col['props']['style'] ) ? $this->parse_styles( $col['props']['style'] ) : '';

													if ( $start == $key ) { ?>
                                                        <!--[if mso | IE]>
                                                        <table width="100%" role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                            <tr>
                                                                <td valign='top' class="" style="vertical-align:top;width:<?php echo esc_attr( $width ) ?>;"><![endif]-->
													<?php } ?>

                                                    <table align="left" width="<?php echo esc_attr( $width ) ?>" class='viwec-responsive' border="0" cellpadding="0" cellspacing="0"
                                                           style='margin:0; padding:0;border-collapse: collapse;'>
                                                        <tr>
                                                            <td>
                                                                <table width='100%' align='left' border='0' cellpadding='0' cellspacing='0'
                                                                       style='margin:0; padding:0;border-collapse: collapse;width: 100%'>
                                                                    <tr>
                                                                        <td valign='top' width='100%' style='<?php echo esc_attr( $col_style ) ?>'>
																			<?php
																			if ( ! empty( $col['elements'] && is_array( $col['elements'] ) ) ) {
																				foreach ( $col['elements'] as $el ) {
																					$type          = isset( $el['type'] ) ? str_replace( '/', '_', $el['type'] ) : '';
																					$content_style = isset( $el['style'] ) ? $this->parse_styles( str_replace( "'", '', $el['style'] ) ) : '';
																					$el_style      = ! empty( $el['props']['style'] ) ? $this->parse_styles( str_replace( "'", '', $el['props']['style'] ) ) : '';
																					?>
                                                                                    <table align='center' width='100%' border='0' cellpadding='0' cellspacing='0'
                                                                                           style='border-collapse: separate;'>
                                                                                        <tr>
                                                                                            <td valign='top' style='<?php echo esc_attr( $el_style ); ?>'>
                                                                                                <table check='' align='center' width='100%' border='0' cellpadding='0'
                                                                                                       cellspacing='0'
                                                                                                       style='border-collapse: separate;'>
                                                                                                    <tr>
                                                                                                        <td valign='top'
                                                                                                            style='font-size: 15px;<?php echo esc_attr( $content_style ) ?>'>
																											<?php
																											do_action( 'viwec_render_content', $type, $el, $this );
																											?>
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                </table>
                                                                                            </td>
                                                                                        </tr>
                                                                                    </table>
																					<?php
																				}
																			}
																			?>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
													<?php
													if ( $end == $key ) {
														?>
                                                        <!--[if mso | IE]></td></tr></table><![endif]-->
													<?php } else {
														?>
                                                        <!--[if mso | IE]></td>
                                                        <td valign='top' style="vertical-align:top;width:<?php echo esc_attr( $width ) ?>;"><![endif]-->
														<?php
													}
												}
											} ?>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
					<?php }
				}
			} ?>
        </table>
		<?php
		$this->email_footer();
	}

	public function email_header( $bg_style ) {
		wc_get_template( 'email-header.php', [ 'bg_style' => $bg_style ], '', VIWEC_TEMPLATES );
	}

	public function email_footer() {
		?>
        </td></tr></tbody></table></div></body></html>
		<?php
	}

	public function render_content( $type, $props ) {
		$func = 'render_' . $type;
		if ( method_exists( $this, $func ) ) {
			$this->$func( $props );
		}
	}

	public function replace_shortcode( $text ) {
		$object = '';

		if ( $this->order ) {
			$object = $this->order;
		} elseif ( $this->user ) {
			$object = $this->user;
		}

		$text = Utils::replace_shortcode( $text, $this->template_args, $object, $this->preview );

		return $text;
	}

	public function render_html_image( $props ) {
		$src      = isset( $props['attrs']['src'] ) ? $props['attrs']['src'] : '';
		$width    = isset( $props['childStyle']['img'] ) ? $this->parse_styles( $props['childStyle']['img'] ) : '';
		$ol_width = ! empty( $props['childStyle']['img']['width'] ) ? str_replace( 'px', '', $props['childStyle']['img']['width'] ) : '100%';
		?>
        <img width="<?php echo esc_attr( $ol_width ) ?>" src='<?php echo esc_url( $src ) ?>' max-width='100%'
             style='max-width: 100%;vertical-align: middle;<?php echo esc_attr( $width ) ?>'/>
		<?php
	}

	public function render_html_text( $props ) {
		$content = isset( $props['content']['text'] ) ? $props['content']['text'] : '';
		$content = $this->replace_shortcode( $content );
		echo wp_kses( $content, viwec_allowed_html() );
	}

	public function render_html_order_detail( $props ) {
		if ( $this->order ) {
			$temp    = ! empty( $props['attrs']['data-template'] ) ? $props['attrs']['data-template'] : 1;
			$preview = $this->demo ? 'pre-' : '';

			if ( is_file( VIWEC_TEMPLATES . "order-items/{$preview}style-{$temp}.php" ) ) {
				?>
                <table width='100%' border='0' cellpadding='0' cellspacing='0' align='center'>
                    <tr>
                        <td valign='top'>
							<?php
							$sent_to_admin = $this->template_args['sent_to_admin'] ?? '';
							wc_get_template( "order-items/{$preview}style-{$temp}.php", [
								'order'               => $this->order,
								'items'               => $this->order->get_items(),
								'show_sku'            => $sent_to_admin,
								'show_download_links' => $this->order->is_download_permitted() && ! $sent_to_admin,
								'show_purchase_note'  => $this->order->is_paid() && ! $sent_to_admin,
								'props'               => $props,
								'render'              => $this
							], '', VIWEC_TEMPLATES );
							?>
                        </td>
                    </tr>
                </table>
				<?php
			}
		}
	}

	public function render_html_order_subtotal( $props ) {
		$html = '';
		if ( $this->order ) {
			$discount_html = $shipping_html = $fee_html = $taxes_html = $refund_html = '';
			$left_style    = isset( $props['childStyle']['.viwec-td-left'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-left'] ) : 'text-align:left;';
			$right_style   = isset( $props['childStyle']['.viwec-td-right'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-right'] ) : 'text-align:right; width:40%;';
			$el_style      = isset( $props['childStyle']['.viwec-order-subtotal-style'] ) ? $this->parse_styles( $props['childStyle']['.viwec-order-subtotal-style'] ) : '';


			$trans_subtotal = $props['content']['subtotal'] ?? esc_html__( 'Subtotal', 'viwec-email-template-customizer' );
			$sub_total      = $this->demo ? wc_price( 50 ) : $this->order->get_subtotal_to_display();
			$subtotal_html  = "<tr><td valign='top'  class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_subtotal}</td>";
			$subtotal_html  .= "<td valign='top'  class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$sub_total}</td></tr>";

			if ( $this->order->get_total_discount() > 0 ) {
				$trans_discount = $props['content']['discount'] ?? esc_html__( 'Discount', 'viwec-email-template-customizer' );
				$discount_html  = "<tr><td valign='top'  class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_discount}</td>";
				$discount_html  .= "<td valign='top'  class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$this->order->get_discount_to_display()}</td></tr>";
			}

			$shipping = $this->demo ? wc_price( 10 ) : '';
			if ( $this->order->get_shipping_method() ) {
				$shipping = $this->order->get_shipping_to_display();
			}

			if ( $shipping ) {
				$trans_shipping = $props['content']['shipping'] ?? esc_html__( 'Shipping', 'viwec-email-template-customizer' );
				$shipping_html  = "<tr><td valign='top'  class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_shipping}</td>";
				$shipping_html  .= "<td valign='top'  class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$shipping}</td></tr>";
			}

			$line_items_fee = $this->order->get_items( 'fee' );

			if ( is_array( $line_items_fee ) && count( $line_items_fee ) ) {
				foreach ( $line_items_fee as $id => $fee ) {
					if ( empty( $fee['line_total'] ) && empty( $fee['line_tax'] ) ) {
						continue;
					}
					$fee_total = wc_price( $fee->get_total() + $fee->get_total_tax(), [ 'currency' => $this->order_currency ] );
					$fee_html  .= "<tr><td valign='top'  class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$fee->get_name()}</td>";
					$fee_html  .= "<td  valign='top' class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$fee_total}</td></tr>";
				}
			}

			if ( 'excl' === get_option( 'woocommerce_tax_display_cart' ) && wc_tax_enabled() ) {
				if ( 'itemized' === get_option( 'woocommerce_tax_total_display' ) ) {
					foreach ( $this->order->get_tax_totals() as $code => $tax ) {
						$taxes_html .= "<tr><td  valign='top' class='viwec-mobile-50' style='{$el_style} {$left_style}'>{$tax->label}</td>";
						$taxes_html .= "<td  valign='top' class='viwec-mobile-50' style='{$el_style} {$right_style}'>{$tax->formatted_amount}</td></tr>";
					}
				} else {
					$label      = WC()->countries->tax_or_vat();
					$value      = wc_price( $this->order->get_total_tax(), array( 'currency' => $this->order->get_currency() ) );
					$taxes_html .= "<tr><td valign='top'  class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$label}</td>";
					$taxes_html .= "<td valign='top'  class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$value}</td></tr>";
				}
			}

			$trans_full_refund = ! empty( $props['content']['refund-full'] ) ? $props['content']['refund-full'] : esc_html__( 'Order fully refunded', 'viwec-email-template-customizer' );
			$trans_part_refund = ! empty( $props['content']['refund-part'] ) ? $props['content']['refund-part'] : esc_html__( 'Refund', 'viwec-email-template-customizer' );
			$refunds           = $this->order->get_refunds();
			if ( $refunds ) {
				foreach ( $refunds as $id => $refund ) {
					$reason      = $refund->get_reason();
					$label       = $reason && $reason != 'Order fully refunded.' ? $reason : ( $reason == 'Order fully refunded.' ? $trans_full_refund : $trans_part_refund );
					$value       = wc_price( '-' . $refund->get_amount(), array( 'currency' => $this->order->get_currency() ) );
					$refund_html .= "<tr><td  valign='top' class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$label}</td>";
					$refund_html .= "<td valign='top'  class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$value}</td></tr>";
				}
			}

			$html .= $subtotal_html . $discount_html . $shipping_html . $fee_html . $taxes_html . $refund_html;
		}
		$this->table( $html );
	}

	public function render_html_order_total( $props ) {
//	    echo '<pre>'. print_r($props, true).'</pre>';
		$html = '';
		if ( $this->order ) {
			$left_style  = isset( $props['childStyle']['.viwec-td-left'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-left'] ) : 'text-align:left;';
			$right_style = isset( $props['childStyle']['.viwec-td-right'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-right'] ) : 'text-align:right; width:40%;';
			$el_style    = isset( $props['childStyle']['.viwec-order-total-style'] ) ? $this->parse_styles( $props['childStyle']['.viwec-order-total-style'] ) : '';

			$trans_total = $props['content']['order_total'] ?? 'Total';
			$total_html  = "<tr><td valign='top' class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_total}</td>";
			$total_html  .= "<td valign='top' class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$this->order->get_formatted_order_total()}</td></tr>";

			$html .= $total_html;
		}
		$this->table( $html );
	}

	public function render_html_order_note( $props ) {
		if ( $this->order && $this->order->get_customer_note() ) {
			$html        = '';
			$left_style  = isset( $props['childStyle']['.viwec-td-left'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-left'] ) : 'text-align:left;';
			$right_style = isset( $props['childStyle']['.viwec-td-right'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-right'] ) : 'text-align:right; width:40%;';
			$el_style    = isset( $props['childStyle']['.viwec-order-total-style'] ) ? $this->parse_styles( $props['childStyle']['.viwec-order-total-style'] ) : '';

			$trans_note = $props['content']['order_note'] ?? 'Note';
			$note_html  = "<tr><td valign='top' class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_note}</td>";
			$note_html  .= "<td valign='top' class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$this->order->get_customer_note()}</td></tr>";

			$html .= $note_html;
			$this->table( $html );
		}
	}

	public function render_html_shipping_method( $props ) {
		if ( $this->order ) {
			if ( $shipping_method = $this->order->get_shipping_method() ?? '' ) {
				$shipping_method_html = '';
				$left_style           = isset( $props['childStyle']['.viwec-td-left'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-left'] ) : 'text-align:left;';
				$right_style          = isset( $props['childStyle']['.viwec-td-right'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-right'] ) : 'text-align:right; width:40%;';
				$el_style             = isset( $props['childStyle']['.viwec-shipping-method-style'] ) ? $this->parse_styles( $props['childStyle']['.viwec-shipping-method-style'] ) : '';

				$trans_shipping_method = $props['content']['shipping_method'] ?? esc_html__( 'Shipping method', 'viwec-email-template-customizer' );
				$shipping_method_html  .= "<tr><td  valign='top' class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_shipping_method}</td>";
				$shipping_method_html  .= "<td  valign='top' class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$shipping_method}</td></tr>";
				$this->table( $shipping_method_html );
			}
		}
	}

	public function render_html_payment_method( $props ) {
		$html = '';
		if ( $this->order ) {
			$payment_method_html = '';
			$left_style          = isset( $props['childStyle']['.viwec-td-left'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-left'] ) : 'text-align:left;';
			$right_style         = isset( $props['childStyle']['.viwec-td-right'] ) ? $this->parse_styles( $props['childStyle']['.viwec-td-right'] ) : 'text-align:right; width:40%;';
			$el_style            = isset( $props['childStyle']['.viwec-payment-method-style'] ) ? $this->parse_styles( $props['childStyle']['.viwec-payment-method-style'] ) : '';

			$payment_method = $this->order->get_total() > 0 && $this->order->get_payment_method_title() && 'other' !== $this->order->get_payment_method_title() ? $this->order->get_payment_method_title() : '';

			$trans_payment_method = $props['content']['payment_method'] ?? esc_html__( 'Payment method', 'viwec-email-template-customizer' );
			if ( $payment_method ) {
				$payment_method_html = "<tr><td  valign='top' class='viwec-mobile-50' style='{$el_style}{$left_style}'>{$trans_payment_method}</td>";
				$payment_method_html .= "<td  valign='top' class='viwec-mobile-50' style='{$el_style}{$right_style}'>{$payment_method}</td></tr>";
			}
			$html .= $payment_method_html;
		}
		$this->table( $html );
	}

	public function render_html_billing_address( $props ) {
		if ( ! $this->order ) {
			return;
		}
		if ( $this->preview ) {
			$this->render_html_billing_address_via_hook( '', '', '', '', $props );
		} else {
			$args = $this->template_args;
			do_action( 'woocommerce_email_customer_details', $args['order'], $args['sent_to_admin'], $args['plain_text'], $args['email'], $props );
		}
	}

	public function render_html_billing_address_via_hook( $order, $sent_to_admin, $plain_text, $email, $props ) {
		if ( $props['type'] !== 'html/billing_address' ) {
			return;
		}
		$color       = $props['style']['color'] ?? 'inherit';
		$font_weight = $props['style']['font-weight'] ?? 'inherit';

		$billing_address = $this->order->get_formatted_billing_address();
		$billing_address = str_replace( '<br/>', "</td></tr><tr><td  valign='top' style='color: {$color}; font-weight: {$font_weight};'>", $billing_address );
		$billing_email   = $billing_phone = '';
		if ( $phone = $this->order->get_billing_phone() ) {
			$billing_phone = "<tr><td valign='top' ><a href='tel:$phone' style='color: {$color}; font-weight: {$font_weight};'>$phone</td></tr>";
		}

		if ( $this->order->get_billing_email() ) {
			$billing_email = "<tr><td valign='top' ><a style='color:{$color}; font-weight: {$font_weight};' href='mailto:{$this->order->get_billing_email()}'>{$this->order->get_billing_email()}</a></td></tr>";
		}

		$html = "<tr><td  valign='top'  style='color: {$color}; font-weight: {$font_weight};'>{$billing_address}</td></tr>{$billing_phone}{$billing_email}";
		$this->table( $html );
	}

	public function render_html_shipping_address( $props ) {
		if ( ! $this->order ) {
			return;
		}

		if ( $this->preview ) {
			$this->render_html_shipping_address_via_hook( '', '', '', '', $props );
		} else {
			$args = $this->template_args;
			do_action( 'woocommerce_email_customer_details', $args['order'], $args['sent_to_admin'], $args['plain_text'], $args['email'], $props );
		}
	}

	public function render_html_shipping_address_via_hook( $order, $sent_to_admin, $plain_text, $email, $props ) {
		if ( $props['type'] !== 'html/shipping_address' ) {
			return;
		}
		$color       = $props['style']['color'] ?? 'inherit';
		$font_weight = $props['style']['font-weight'] ?? 'inherit';

		$shipping_address = $this->order->get_formatted_shipping_address();
		$shipping_address = empty( $shipping_address ) ? $this->order->get_formatted_billing_address() : $shipping_address;
		$shipping_address = str_replace( '<br/>', "</td></tr><tr><td valign='top' style='color: {$color}; font-weight: {$font_weight};'>", $shipping_address );

		$html = "<tr><td valign='top' style='color: {$color}; font-weight: {$font_weight};'>{$shipping_address}</td></tr>";
		$this->table( $html );
	}

	public function render_html_social( $props ) {
		$align   = $props['style']['text-align'] ?? 'left';
		$socials = [ 'facebook', 'twitter', 'instagram' ];
		$html    = '';
		$end     = end( $socials );

		if ( isset( $props['attrs']['direction'] ) && $props['attrs']['direction'] === 'vertical' ) {
			foreach ( $socials as $social ) {
				$link = esc_url( $props['attrs'][ $social . '_url' ] );
				$img  = esc_url( $props['attrs'][ $social ] );
				if ( ! empty( $img ) && ! empty( $link ) ) {
					$html .= "<tr><td valign='top' ><a href='{$link}'><img style='vertical-align: middle' src='{$img}'></a></td></tr>";
				}
			}
		} else {
			$html = '<tr>';
			foreach ( $socials as $social ) {
				$padding = $end == $social ? 0 : '5px';
				$link    = esc_url( $props['attrs'][ $social . '_url' ] );
				$img     = esc_url( $props['attrs'][ $social ] );
				if ( ! empty( $img ) && ! empty( $link ) ) {
					$html .= "<td valign='top' style='padding-right: {$padding}'><a href='{$link}'><img src='{$img}'></a></td>";
				}
			}
			$html .= '</tr>';
		}

		$html = "<table align='{$align}'>$html</table>";
		echo wp_kses( $html, viwec_allowed_html() );
	}

	public function render_html_button( $props ) {
		$url         = isset( $props['attrs']['href'] ) ? $this->replace_shortcode( $props['attrs']['href'] ) : '';
		$text        = isset( $props['content']['text'] ) ? $this->replace_shortcode( $props['content']['text'] ) : '';
		$text        = str_replace( [ '<p>', '</p>' ], [ '', '' ], $text );
		$align       = $props['style']['text-align'] ?? 'left';
		$style       = isset( $props['childStyle']['a'] ) ? $this->parse_styles( $props['childStyle']['a'] ) : '';
		$text_color  = $props['style']['color'] ?? 'inherit';
		$font_weight = $props['style']['font-weight'] ?? 'normal';
		$width       = $props['childStyle']['a']['width'] ?? '';
		?>
        <table align='<?php echo esc_attr( $align ) ?>' width='<?php echo esc_attr( $width ) ?>'
               class='viwec-responsive' border='0' cellpadding='0' cellspacing='0'
               role='presentation' style='border-collapse:separate;width: <?php echo esc_attr( $width ) ?>;'>
            <tr>
                <td class='viwec-mobile-button-padding' align='center' valign='middle' role='presentation' style='<?php echo esc_attr( $style ) ?>'>
                    <a href='<?php echo esc_url( $url ) ?>' target='_blank'
                       style='color:<?php echo esc_attr( $text_color ) ?> !important;font-weight: <?php echo esc_attr( $font_weight ) ?>;display:inline-block;
                               text-decoration:none;text-transform:none;margin:0;text-align: center;max-width: 100%;'>
                          <span style='color: <?php echo esc_attr( $text_color ) ?>'>
                              <?php echo wp_kses( $text, viwec_allowed_html() ) ?>
                          </span>
                    </a>
                </td>
            </tr>
        </table>
		<?php
	}

	public function render_html_menu( $props ) {
		$color       = $props['style']['color'] ?? 'inherit';
		$font_weight = $props['style']['font-weight'] ?? 'inherit';
		?>
        <table align='center' width='100%' border='0' cellpadding='0' cellspacing='0' style='border-collapse: separate;margin: 0; padding:0'>
			<?php
			if ( isset( $props['content'] ) && is_array( $props['content'] ) ) {
				$count_text = count( array_filter( $props['content'] ) );
				$count_link = count( array_filter( $props['attrs'] ) );
				$col        = min( $count_text, $count_link ) ? 100 / min( $count_text, $count_link ) . '%' : '';

				if ( isset( $props['attrs']['direction'] ) && $props['attrs']['direction'] === 'vertical' ) {
					foreach ( $props['content'] as $key => $value ) {

						$link = isset( $props['attrs'][ $key ] ) ? $this->replace_shortcode( $props['attrs'][ $key ] ) : '';

						if ( empty( $value ) || ! $link ) {
							continue;
						} ?>
                        <tr>
                            <td valign='top'>
                                <a href='<?php echo esc_url( $link ) ?>'
                                   style='color: <?php echo esc_attr( $color ) ?>; font-weight: <?php echo esc_attr( $font_weight ) ?>;font-style:inherit;'>
									<?php echo wp_kses( $value, viwec_allowed_html() ) ?>
                                </a>
                            </td>
                        </tr>
					<?php }
				} else { ?>
                    <tr>
						<?php
						foreach ( $props['content'] as $key => $value ) {

							$link = isset( $props['attrs'][ $key ] ) ? $this->replace_shortcode( $props['attrs'][ $key ] ) : '';

							if ( empty( $value ) || ! $link ) {
								continue;
							}
							?>
                            <td valign='top' width='<?php echo esc_attr( $col ) ?>'>
                                <a href='<?php echo esc_url( $link ) ?>'
                                   style='color: <?php echo esc_attr( $color ) ?>; font-weight: <?php echo esc_attr( $font_weight ) ?>; font-style: inherit'>
									<?php echo wp_kses( $value, viwec_allowed_html() ) ?>
                                </a>
                            </td>
						<?php } ?>
                    </tr>
				<?php }
			} ?>
        </table>
		<?php
	}

	public function render_html_divider( $props ) {
		$style = isset( $props['childStyle']['hr'] ) ? $this->parse_styles( $props['childStyle']['hr'] ) : '';
		?>
        <table width='100%' border='0' cellpadding='0' cellspacing='0'>
            <tr>
                <td valign='top'>
                    <table width='100%' border='0' cellpadding='0' cellspacing='0' style="margin: 10px 0;">
                        <tr>
                            <td valign='top' style="border-width: 0;<?php echo esc_attr( $style ) ?>"></td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
		<?php
	}

	public function render_html_spacer( $props ) {
		$style         = isset( $props['childStyle']['.viwec-spacer'] ) ? $this->parse_styles( $props['childStyle']['.viwec-spacer'] ) : '';
		$mobile_hidden = ! empty( $props['attrs']['mobile-hidden'] ) && $props['attrs']['mobile-hidden'] == 'true' ? 'viwec-mobile-hidden' : '';
		?>
        <table width='100%' border='0' cellpadding='0' cellspacing='0' style='font-size:0 !important;margin:0;' class='<?php echo esc_attr( $mobile_hidden ) ?>'>
            <tr>
                <td valign='top' style='<?php echo esc_attr( $style ) ?>'></td>
            </tr>
        </table>
		<?php
	}

	public function render_html_contact( $props ) {
		$align       = $props['style']['text-align'] ?? 'left';
		$color       = $props['style']['color'] ?? 'inherit';
		$font_size   = $props['style']['font-size'] ?? 'inherit';
		$font_weight = $props['style']['font-weight'] ?? 'inherit';
		$style       = "color: {$color};font-size: {$font_size};font-weight: $font_weight;font-family:{$this->font_family_default};vertical-align:sub;";
		?>
        <table align='<?php echo esc_attr( $align ) ?>'>
			<?php
			if ( ! empty( $props['attrs']['home'] ) && ! empty( $props['content']['home_text'] ) ) {
				$url  = isset( $props['attrs']['home_link'] ) ? $this->replace_shortcode( $props['attrs']['home_link'] ) : '';
				$text = isset( $props['content']['home_text'] ) ? $this->replace_shortcode( $props['content']['home_text'] ) : '';
				?>
                <tr>
                    <td valign='top'><img src='<?php echo esc_url( $props['attrs']['home'] ) ?>' style='padding-right: 3px;'></td>
                    <td valign='top'><a style='<?php echo esc_attr( $style ) ?>' href='<?php echo esc_url( $url ) ?>'>
							<?php echo wp_kses( $text, viwec_allowed_html() ) ?>
                        </a>
                    </td>
                </tr>
				<?php
			}

			if ( ! empty( $props['attrs']['email'] ) && ! empty( $props['attrs']['email_link'] ) ) {
				$email_url = $this->replace_shortcode( $props['attrs']['email_link'] );
				?>
                <tr>
                    <td valign='top'><img src='<?php echo esc_url( $props['attrs']['email'] ) ?>' style='padding-right: 3px;'></td>
                    <td valign='top'>
                        <a style='<?php echo esc_attr( $style ) ?>' href='mailto:<?php echo esc_attr( $email_url ) ?>'>
							<?php echo esc_html( $email_url ) ?>
                        </a>
                    </td>
                </tr>
				<?php
			}

			if ( ! empty( $props['attrs']['phone'] ) && ! empty( $props['content']['phone_text'] ) ) {
				?>
                <tr>
                    <td valign='top'><img src='<?php echo esc_url( $props['attrs']['phone'] ) ?>' style='padding-right: 3px;'></td>
                    <td valign='top'><a style='<?php echo esc_attr( $style ) ?>' href='tel:<?php echo esc_attr( $props['content']['phone_text'] ) ?>'>
							<?php echo wp_kses( $props['content']['phone_text'], viwec_allowed_html() ) ?>
                        </a>
                    </td>
                </tr>
				<?php
			}
			?>
        </table>
		<?php
	}

	public function render_html_wc_hook( $props ) {
		if ( $this->preview ) {
			esc_html_e( 'WooCommerce hook placeholder', 'viwec-email-template-customizer' );
		} else {
			$hook = ! empty( $props['attrs']['data-wc-hook'] ) ? $props['attrs']['data-wc-hook'] : 'woocommerce_email_before_order_table';
			$args = $this->template_args;
			switch ( $hook ) {
				case '':
				case 'woocommerce_email_before_order_table':
					do_action( 'woocommerce_email_before_order_table', $args['order'], $args['sent_to_admin'], $args['plain_text'], $args['email'] );
					break;
				case 'woocommerce_email_after_order_table':
					do_action( 'woocommerce_email_after_order_table', $args['order'], $args['sent_to_admin'], $args['plain_text'], $args['email'] );
					break;
				case 'woocommerce_email_order_meta':
					do_action( 'woocommerce_email_order_meta', $args['order'], $args['sent_to_admin'], $args['plain_text'], $args['email'] );
					break;
			}
		}
	}

	public function render_html_recover_heading( $props ) {
		if ( $this->preview ) {
			echo esc_html__( 'The heading of original email will be transferred here', 'viwec-email-customizer' );
		}
		if ( $this->class_email ) {
			echo wp_kses( $this->class_email->get_heading(), viwec_allowed_html() );
		}
	}

	public function render_html_recover_content() {
		if ( $this->preview ) {
			echo esc_html__( 'The content of original email will be transferred here', 'viwec-email-customizer' );
		}
		if ( $this->other_message_content ) {
			echo wp_kses( $this->other_message_content, viwec_allowed_html() );
		}
	}

	public function table( $content, $style = '', $width = '100%' ) {
		?>
        <table width='<?php echo esc_attr( $width ) ?>' border='0' cellpadding='0' cellspacing='0' align='center'
               style='border-collapse: collapse;<?php echo esc_attr( $style ) ?>'>
			<?php echo wp_kses( $content, viwec_allowed_html() ) ?>
        </table>
		<?php
	}

	public function order_download( $item_id, $item, $order ) {
		$show_downloads = $order->has_downloadable_item() && $order->is_download_permitted();

		if ( ! $show_downloads ) {
			return;
		}

		$pid       = $item->get_data()['product_id'];
		$downloads = $order->get_downloadable_items();

		foreach ( $downloads as $download ) {
			if ( $pid == $download['product_id'] ) {
				$href    = esc_url( $download['download_url'] );
				$display = esc_html( $download['download_name'] );
				$expires = '';
				if ( ! empty( $download['access_expires'] ) ) {
					$datetime     = esc_attr( date( 'Y-m-d', strtotime( $download['access_expires'] ) ) );
					$title        = esc_attr( strtotime( $download['access_expires'] ) );
					$display_time = esc_html( date_i18n( get_option( 'date_format' ), strtotime( $download['access_expires'] ) ) );
					$expires      = "- <time datetime='$datetime' title='$title'>$display_time</time>";
				}
				echo "<p><a href='$href'>$display</a> $expires</p>";
			}
		}
	}

	public function remove_shipping_method( $shipping_display ) {
		if ( $this->order ) {
			return '';
		}

		return $shipping_display;
	}
}

