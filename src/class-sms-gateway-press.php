<?php

use SMS_Gateway_Press\Post_Type\Sms;

abstract class SMS_Gateway_Press {

	public static function send(
		string $phone_number,
		string $text,
		int $send_at = null,
		int $expires_at = null,
		string $creation_method = Sms::CREATION_METHOD_SEND_FUNCTION
	): int {
		$send_at    = is_numeric( $send_at ) ? $send_at : time();
		$expires_at = is_numeric( $expires_at ) ? $expires_at : time() + 3600; // 1 hours

		return wp_insert_post(
			array(
				'post_type'   => Sms::POST_TYPE,
				'post_status' => 'publish',
				'meta_input'  => array(
					Sms::META_KEY_PHONE_NUMBER    => $phone_number,
					Sms::META_KEY_TEXT            => $text,
					Sms::META_KEY_CREATED_AT      => time(),
					Sms::META_KEY_SEND_AT         => $send_at,
					Sms::META_KEY_EXPIRES_AT      => $expires_at,
					Sms::META_KEY_CREATION_METHOD => $creation_method,
				),
			)
		);
	}
}
