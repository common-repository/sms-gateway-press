<?php

namespace SMS_Gateway_Press\Admin_Page;

use SMS_Gateway_Press;
use SMS_Gateway_Press\Post_Type\Device as Device_Post_Type;
use SMS_Gateway_Press\Post_Type\Sms as Sms_Post_Type;
use WP_Post;

abstract class Wizard {

	public const PAGE_SLUG                     = 'sms-gateway-press-wizard';
	public const AJAX_ACTION_CREATE_DEVICE     = 'sms_gateway_press_wizard_create_device';
	public const AJAX_ACTION_CONNECT_DEVICE    = 'sms_gateway_press_wizard_connect_device';
	public const AJAX_ACTION_SEND_TEST_MESSAGE = 'sms_gateway_press_wizard_send_test_message';
	public const AJAX_ACTION_GET_SMS_INFO      = 'sms_gateway_press_wizard_get_sms_info';

	public static function register(): void {
		add_action( 'admin_menu', array( __CLASS__, 'on_admin_menu' ) );
		add_action( 'admin_init', array( __CLASS__, 'on_admin_init' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'on_admin_enqueue_scripts' ) );
	}

	public static function on_admin_menu(): void {
		add_submenu_page(
			null, // parent_slug
			__( 'SMS Gateway Press Wizard', 'sms-gateway-press' ), // page_title
			'', // menu_title
			'manage_options', // capability
			self::PAGE_SLUG, // menu_slug
			array( __CLASS__, 'render_page' )
		);
	}

	public static function on_admin_init(): void {
		add_action(
			'wp_ajax_' . self::AJAX_ACTION_CREATE_DEVICE,
			array( __CLASS__, 'on_wp_ajax_' . self::AJAX_ACTION_CREATE_DEVICE )
		);

		add_action(
			'wp_ajax_' . self::AJAX_ACTION_CONNECT_DEVICE,
			array( __CLASS__, 'on_wp_ajax_' . self::AJAX_ACTION_CONNECT_DEVICE )
		);

		add_action(
			'wp_ajax_' . self::AJAX_ACTION_SEND_TEST_MESSAGE,
			array( __CLASS__, 'on_wp_ajax_' . self::AJAX_ACTION_SEND_TEST_MESSAGE )
		);

		add_action(
			'wp_ajax_' . self::AJAX_ACTION_GET_SMS_INFO,
			array( __CLASS__, 'on_wp_ajax_' . self::AJAX_ACTION_GET_SMS_INFO )
		);
	}

	public static function on_admin_enqueue_scripts( string $hook_suffix ): void {
		if ( 'admin_page_' . self::PAGE_SLUG !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'sms-gateway-press', // handle
			SMS_GATEWAY_PRESS_URL . '/dist/css/sms-gateway-press.css', // src
			array(), // deps
			'1.0.0', // ver
			'all' // media
		);

		$script_handle = 'sms-gateway-press-wizard';

		wp_enqueue_script(
			$script_handle, // handle
			SMS_GATEWAY_PRESS_URL . '/dist/js/wizard.js', // src
			array(), // deps
			'1.0.0', // ver
			true // in_footer
		);

		wp_localize_script(
			$script_handle, // handle
			'sms_gateway_press_wizard', // object_name
			array( // l10n
				'dashboard_url'            => admin_url( 'admin.php?page=sms-gateway-press' ),
				'url'                      => admin_url( 'admin-ajax.php' ),
				'action_create_device'     => self::AJAX_ACTION_CREATE_DEVICE,
				'nonce_create_device'      => wp_create_nonce( self::AJAX_ACTION_CREATE_DEVICE ),
				'action_connect_device'    => self::AJAX_ACTION_CONNECT_DEVICE,
				'nonce_connect_device'     => wp_create_nonce( self::AJAX_ACTION_CONNECT_DEVICE ),
				'action_send_test_message' => self::AJAX_ACTION_SEND_TEST_MESSAGE,
				'nonce_send_test_message'  => wp_create_nonce( self::AJAX_ACTION_SEND_TEST_MESSAGE ),
				'action_get_sms_info'      => self::AJAX_ACTION_GET_SMS_INFO,
				'nonce_get_sms_info'       => wp_create_nonce( self::AJAX_ACTION_GET_SMS_INFO ),
			)
		);
	}

	public static function render_page(): void {
		echo '<div class="wrap"></div>';
	}

	public static function on_wp_ajax_sms_gateway_press_wizard_create_device(): void {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), self::AJAX_ACTION_CREATE_DEVICE ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$device_name = sanitize_text_field( $_POST['device_name'] );

		$new_device_post_id = wp_insert_post(
			array(
				'post_type'   => Device_Post_Type::POST_TYPE,
				'post_title'  => $device_name,
				'post_status' => 'publish',
				'meta_input'  => array(
					Device_Post_Type::META_KEY_TOKEN => bin2hex( random_bytes( 16 ) ),
					Device_Post_Type::META_KEY_CREATED_BY_WIZARD => '1',
				),
			)
		);

		if ( ! is_numeric( $new_device_post_id ) ) {
			wp_send_json_error();
			wp_die();
		}

		wp_send_json_success( array( 'device_post_id' => $new_device_post_id ) );
		wp_die();
	}

	public static function on_wp_ajax_sms_gateway_press_wizard_connect_device(): void {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), self::AJAX_ACTION_CONNECT_DEVICE ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$device_post_id = sanitize_text_field( $_POST['device_post_id'] );

		if ( ! is_numeric( $device_post_id ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$device_post = get_post( $device_post_id );

		if ( ! $device_post instanceof WP_Post
			|| Device_Post_Type::POST_TYPE !== $device_post->post_type
		) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$response_data = array(
			'status'       => Device_Post_Type::get_status( $device_post_id ),
			'status_badge' => Device_Post_Type::get_status_badge( $device_post_id ),
			'qr_data'      => array(
				'url'             => get_site_url(),
				'device_id'       => $device_post_id,
				'device_token'    => get_post_meta( $device_post_id, Device_Post_Type::META_KEY_TOKEN, true ),
				'request_timeout' => ini_get( 'max_execution_time' ) + 20,
			),
		);

		wp_send_json_success( $response_data );
		wp_die();
	}

	public static function on_wp_ajax_sms_gateway_press_wizard_send_test_message(): void {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), self::AJAX_ACTION_SEND_TEST_MESSAGE ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$phone_number = sanitize_text_field( $_POST['phone_number'] );
		$text         = sanitize_text_field( $_POST['text'] );

		$sms_post_id = SMS_Gateway_Press::send( $phone_number, $text );

		if ( ! is_numeric( $sms_post_id ) ) {
			wp_send_json_error( null, 500 );
			wp_die();
		}

		wp_send_json_success( array( 'sms_post_id' => $sms_post_id ) );
		wp_die();
	}

	public static function on_wp_ajax_sms_gateway_press_wizard_get_sms_info(): void {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), self::AJAX_ACTION_GET_SMS_INFO ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$sms_post_id = sanitize_text_field( $_POST['sms_post_id'] );

		if ( ! is_numeric( $sms_post_id ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$sms_post = get_post( $sms_post_id );

		if ( ! $sms_post instanceof WP_Post
			|| Sms_Post_Type::POST_TYPE !== $sms_post->post_type
		) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$sms_info = Sms_Post_Type::get_sms_info( $sms_post_id );

		wp_send_json_success( $sms_info, 200 );
		wp_die();
	}
}
