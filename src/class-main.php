<?php

namespace SMS_Gateway_Press;

require_once __DIR__ . '/class-rest-api.php';
require_once __DIR__ . '/class-utils.php';
require_once __DIR__ . '/admin-page/class-dashboard.php';
require_once __DIR__ . '/admin-page/class-wizard.php';
require_once __DIR__ . '/post-type/class-device.php';
require_once __DIR__ . '/post-type/class-sms.php';
require_once __DIR__ . '/class-sms-gateway-press.php';

use SMS_Gateway_Press\Admin_Page\Dashboard as Dashboard_Admin_Page;
use SMS_Gateway_Press\Admin_Page\Wizard as Wizard_Admin_Page;
use SMS_Gateway_Press\Post_Type\Device as Device_Post_Type;
use SMS_Gateway_Press\Post_Type\Sms as Sms_Post_Type;

abstract class Main {

	public const DATETIME_LOCAL_FORMAT = 'Y-m-d\TH:i';
	public const MENU_PAGE_SLUG        = 'sms-gateway-press';

	public static function run(): void {
		Dashboard_Admin_Page::register();
		Wizard_Admin_Page::register();

		Device_Post_Type::register();
		Sms_Post_Type::register();

		Rest_Api::register_endpoints();

		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'on_admin_enqueue_scripts' ) );
		add_action( 'admin_menu', array( __CLASS__, 'on_admin_menu' ) );
	}

	public static function on_admin_enqueue_scripts(): void {
		wp_enqueue_style(
			'sms-gateway-press-admin', // handle
			SMS_GATEWAY_PRESS_URL . '/dist/css/sms-gateway-press-global.css', // src
			array(), // deps
			'1.0.0', // ver
			'all' // media
		);
	}

	public static function on_admin_menu(): void {
		add_menu_page(
			'SMS Gateway Press', // page_title
			'SMS Gateway Press', // menu_title
			'manage_options', // capability
			self::MENU_PAGE_SLUG, // menu_slug
			array( Dashboard_Admin_Page::class, 'render_page' ), // callback
			'none', // icon_url
		);

		add_submenu_page(
			self::MENU_PAGE_SLUG, // parent_slug
			__( 'Devices', 'sms-gateway-press' ), // page_title
			__( 'Devices', 'sms-gateway-press' ), // menu_title
			'manage_options', // capability
			'edit.php?post_type=' . Device_Post_Type::POST_TYPE, // menu_slug
		);

		add_submenu_page(
			self::MENU_PAGE_SLUG, // parent_slug
			__( 'SMS', 'sms-gateway-press' ), // page_title
			__( 'SMS', 'sms-gateway-press' ), // menu_title
			'manage_options', // capability
			'edit.php?post_type=' . Sms_Post_Type::POST_TYPE, // menu_slug
		);
	}
}
