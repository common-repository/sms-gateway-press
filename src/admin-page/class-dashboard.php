<?php

namespace SMS_Gateway_Press\Admin_Page;

use SMS_Gateway_Press\Main;
use SMS_Gateway_Press\Post_Type\Device as Device_Post_Type;
use SMS_Gateway_Press\Post_Type\Sms as Sms_Post_Type;
use DateTime;

abstract class Dashboard {

	public const PAGE_SLUG   = 'sms-gateway-press';
	public const AJAX_ACTION = 'get_sms_gateway_press_dashboard_data';

	public static function register(): void {
		add_action( 'admin_init', array( __CLASS__, 'on_admin_init' ) );
		add_action( 'admin_menu', array( __CLASS__, 'on_admin_menu' ) );
		add_action( 'admin_enqueue_scripts', array( __CLASS__, 'on_admin_enqueue_scripts' ) );
	}

	public static function on_admin_init(): void {
		global $pagenow;

		if ( 'admin.php' === $pagenow ) {
			$url_parts = wp_parse_url( $_SERVER['REQUEST_URI'] );

			if ( isset( $url_parts['query'] ) ) {
				$query_string_params = array();

				wp_parse_str( $url_parts['query'], $query_string_params );

				if ( is_array( $query_string_params )
					&& isset( $query_string_params['page'] )
					&& self::PAGE_SLUG === $query_string_params['page']
					&& self::wizard_is_required()
				) {
					$wizard_url = admin_url( 'admin.php?page=' . Wizard::PAGE_SLUG );
					wp_safe_redirect( $wizard_url );
					exit;
				}
			}
		}

		add_action( 'wp_ajax_get_sms_gateway_press_dashboard_data', array( __CLASS__, 'on_wp_ajax_get_sms_gateway_press_dashboard_data' ) );
	}

	public static function on_admin_menu(): void {
		add_submenu_page(
			Main::MENU_PAGE_SLUG, // parent_slug
			__( 'Dashboard', 'sms-gateway-press' ), // page_title
			__( 'Dashboard', 'sms-gateway-press' ), // menu_title
			'manage_options', // capability
			Main::MENU_PAGE_SLUG, // menu_slug
		);
	}

	public static function on_admin_enqueue_scripts( string $hook_suffix ): void {
		if ( 'toplevel_page_' . self::PAGE_SLUG !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'sms-gateway-press', // handle
			SMS_GATEWAY_PRESS_URL . '/dist/css/sms-gateway-press.css', // src
			array(), // deps
			'1.0.0', // ver
			'all' // media
		);

		$script_handle = 'sms-gateway-press-dashboard';

		wp_enqueue_script(
			$script_handle, // handle
			SMS_GATEWAY_PRESS_URL . '/dist/js/dashboard.js', // src
			array(), // deps
			'1.0.0', // ver
			true // in_footer
		);

		$current_user = wp_get_current_user();

		wp_localize_script(
			$script_handle, // handle
			'sms_gateway_press_dashboard', // object_name
			array( // l10n
				'url'                => admin_url( 'admin-ajax.php' ),
				'action'             => self::AJAX_ACTION,
				'nonce'              => wp_create_nonce( self::AJAX_ACTION ),
				'add_new_sms_url'    => admin_url( 'post-new.php?post_type=' . Sms_Post_Type::POST_TYPE ),
				'add_new_device_url' => admin_url( 'post-new.php?post_type=' . Device_Post_Type::POST_TYPE ),
				'site_url'           => site_url(),
				'current_username'   => $current_user->user_login,
				'app_password_url'   => admin_url( 'profile.php#application-passwords-section' ),
			)
		);
	}

	public static function render_page(): void {
		add_filter( 'admin_footer_text', array( __CLASS__, 'filter_admin_footer_text' ) );
		add_filter( 'update_footer', array( __CLASS__, 'filter_update_footer' ) );

		echo '<div class="wrap"></div>';
	}

	public static function filter_admin_footer_text(): string {
		return __(
			'<strong>We need your review.</strong> <a href="https://wordpress.org/plugins/sms-gateway-press/#reviews" target="_blank">Click here for vote</a>.',
			'sms-gateway-press'
		);
	}

	public static function filter_update_footer(): string {
		return __(
			'More info in <a href="https://www.sms-gateway-press.com" target="_blank">www.sms-gateway-press.com</a>.',
			'sms-gateway-press'
		);
	}

	public static function on_wp_ajax_get_sms_gateway_press_dashboard_data(): void {
		if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['nonce'] ) ), self::AJAX_ACTION ) ) {
			wp_send_json_error( null, 403 );
			wp_die();
		}

		$is_first_request = sanitize_text_field( $_POST['is_first_request'] );
		$is_first_request = 'true' === $is_first_request ? true : false;

		global $wpdb;

		// Device statuses.
		//

		$device_status_list = array();

		$device_posts = get_posts(
			array(
				'post_type'   => Device_Post_Type::POST_TYPE,
				'numberposts' => -1,
			)
		);

		foreach ( $device_posts as $device_post ) {
			$device_status_list[] = array(
				'ID'         => $device_post->ID,
				'post_title' => $device_post->post_title,
				'badge_html' => Device_Post_Type::get_status_badge( $device_post->ID ),
			);
		}

		// SMS report.
		//

		$datetime_format = 'Y-m-d H:i:s';
		$min_datetime    = new DateTime( '-24 hours' );
		$min_timestamp   = $min_datetime->getTimestamp();
		$now_timestamp   = time();

		// Scheduled.
		$total_scheduled = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						COUNT( p.ID ) AS total
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m_created_at ON m_created_at.post_id = p.ID
					INNER JOIN
						{$wpdb->prefix}postmeta m_send_at ON m_send_at.post_id = p.ID
					WHERE
						m_created_at.meta_key = %s
					AND
						m_send_at.meta_key = %s
					AND
						p.post_type = %s
					AND
						CAST( m_created_at.meta_value AS UNSIGNED ) < CAST( m_send_at.meta_value AS UNSIGNED )
					AND
						p.post_date >= %s
				SQL,
				Sms_Post_Type::META_KEY_CREATED_AT,
				Sms_Post_Type::META_KEY_SEND_AT,
				Sms_Post_Type::POST_TYPE,
				$min_datetime->format( $datetime_format )
			)
		);

		// Queued.
		$total_queued = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						COUNT( p.ID ) AS total
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m
					ON
						m.post_id = p.ID
					WHERE
						m.meta_key = %s
					AND
						FROM_UNIXTIME(m.meta_value) >= FROM_UNIXTIME(%d)
					AND
						FROM_UNIXTIME(m.meta_value) < FROM_UNIXTIME(%d)
				SQL,
				Sms_Post_Type::META_KEY_SEND_AT,
				$min_timestamp,
				$now_timestamp,
			)
		);

		// Sending.
		$total_sending = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						COUNT( p.ID ) AS total
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m
					ON
						m.post_id = p.ID
					WHERE
						m.meta_key = %s
					AND
						FROM_UNIXTIME(m.meta_value) > FROM_UNIXTIME(%d)
				SQL,
				Sms_Post_Type::META_KEY_CONFIRMED_AT,
				$min_timestamp
			)
		);

		// Sent.
		$total_sent = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						COUNT( p.ID ) AS total
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m
					ON
						m.post_id = p.ID
					WHERE
						m.meta_key = %s
					AND
						FROM_UNIXTIME(m.meta_value) > FROM_UNIXTIME(%d)
				SQL,
				Sms_Post_Type::META_KEY_SENT_AT,
				$min_timestamp
			)
		);

		// Delivered.
		$total_delivered = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						COUNT( p.ID ) AS total
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m
					ON
						m.post_id = p.ID
					WHERE
						m.meta_key = %s
					AND
						FROM_UNIXTIME(m.meta_value) > FROM_UNIXTIME(%d)
				SQL,
				Sms_Post_Type::META_KEY_DELIVERED_AT,
				$min_timestamp
			)
		);

		// Expired
		$expired_sms_posts = get_posts(
			array(
				'post_type'   => Sms_Post_Type::POST_TYPE,
				'post_status' => 'any',
				'numberposts' => -1,
				'meta_query'  => array(
					'relation' => 'AND',
					array(
						'key'     => Sms_Post_Type::META_KEY_EXPIRES_AT,
						'compare' => '<',
						'value'   => $now_timestamp,
						'type'    => 'NUMERIC',
					),
					array(
						'key'     => Sms_Post_Type::META_KEY_SENT_AT,
						'compare' => 'NOT EXISTS',
					),
				),
			)
		);

		$total_expired = count( $expired_sms_posts );

		// Performance.
		//

		$average_sending_result = $wpdb->get_results(
			$wpdb->prepare(
				<<<SQL
					SELECT
						AVG( CAST( m_sent_at.meta_value AS DECIMAL( 15, 5 ) ) - CAST( m_confirmed_at.meta_value AS DECIMAL( 15, 5 ) ) ) as average
					FROM
						{$wpdb->prefix}posts p
					INNER JOIN
						{$wpdb->prefix}postmeta m_confirmed_at ON m_confirmed_at.post_id = p.ID
					INNER JOIN
						{$wpdb->prefix}postmeta m_sent_at ON m_sent_at.post_id = p.ID
					WHERE
						m_confirmed_at.meta_key = %s
					AND
						m_sent_at.meta_key = %s
					AND
						p.post_type = %s
				SQL,
				Sms_Post_Type::META_KEY_CONFIRMED_AT,
				Sms_Post_Type::META_KEY_SENT_AT,
				Sms_Post_Type::POST_TYPE,
			)
		);

		$delivery_average_content = '<a href="https://www.sms-gateway-press.com/premium" target="_blank">' . __( 'Get Premium', 'sms-gateway-press' ) . '</a>';

		$performance = array(
			'sending_average'  => round( floatval( $average_sending_result[0]->average ), 4 ) . ' ms',
			'delivery_average' => $delivery_average_content,
		);

		// Chart data.
		//

		$chart_data = array();
		$max        = '1' === $is_first_request ? 15 : 1;

		for ( $i = 1; $i < 15; $i++ ) {
			$j            = $i + 1;
			$min_datetime = new DateTime( "-{$j} seconds" );
			$max_datetime = new DateTime( "-{$i} seconds" );

			$query_result = $wpdb->get_results(
				$wpdb->prepare(
					<<<SQL
						SELECT
							COUNT( sms_post.ID ) AS total,
							sent_by_device.meta_value as sent_by_device,
							device_post.post_title as device
						FROM
							{$wpdb->prefix}posts sms_post
						INNER JOIN
							{$wpdb->prefix}postmeta sent_at ON sms_post.ID = sent_at.post_id
						INNER JOIN
							{$wpdb->prefix}postmeta sent_by_device ON sms_post.ID = sent_by_device.post_id
						INNER JOIN
							{$wpdb->prefix}posts device_post ON device_post.ID = sent_by_device.meta_value
						WHERE
							sent_at.meta_key = %s AND
							sent_by_device.meta_key = %s AND
							sms_post.post_type = %s AND
							CAST( sent_at.meta_value AS UNSIGNED ) >= %d AND
							CAST( sent_at.meta_value AS UNSIGNED ) < %d
						GROUP BY
							sent_by_device, device
					SQL,
					Sms_Post_Type::META_KEY_SENT_AT,
					Sms_Post_Type::META_KEY_SENT_BY_DEVICE,
					Sms_Post_Type::POST_TYPE,
					$min_datetime->getTimestamp(),
					$max_datetime->getTimestamp(),
				)
			);

			$chart_data[] = array(
				'second'  => $max_datetime->format( 'i:s' ),
				'sending' => $query_result,
			);
		}

		// Build and send the response.
		//

		$data = array(
			'is_first_request'   => $is_first_request,
			'device_status_list' => $device_status_list,
			'performance'        => $performance,
			'chart_data'         => array_reverse( $chart_data ),
			'sms_balance'        => array(
				Sms_Post_Type::STATUS_SCHEDULED => $total_scheduled[0]->total,
				Sms_Post_Type::STATUS_QUEUED    => $total_queued[0]->total,
				Sms_Post_Type::STATUS_SENDING   => $total_sending[0]->total,
				Sms_Post_Type::STATUS_SENT      => $total_sent[0]->total,
				Sms_Post_Type::STATUS_DELIVERED => $total_delivered[0]->total,
				Sms_Post_Type::STATUS_EXPIRED   => $total_expired,
			),
		);

		wp_send_json_success( $data );
		wp_die();
	}

	public static function wizard_is_required(): bool {
		$device_posts = get_posts(
			array(
				'post_type'  => Device_Post_Type::POST_TYPE,
				'meta_key'   => Device_Post_Type::META_KEY_CREATED_BY_WIZARD,
				'meta_value' => '1',
			)
		);

		$sms_posts = get_posts(
			array(
				'post_type' => Sms_Post_Type::POST_TYPE,
			)
		);

		if ( empty( $device_posts ) && empty( $sms_posts ) ) {
			return true;
		}

		return false;
	}
}
