import React from 'react';
import { __ } from '@wordpress/i18n';

export default function FinishPage() {
  return (
    <>
      <h2>{ __( 'Sending Success', 'sms-gateway-press' ) }</h2>
      <p>{ __( 'Congratulations. You have successfully completed the minimum steps to activate this WordPress as your own SMS gateway.', 'sms-gateway-press' ) }</p>
      <p>{ __( 'Note that you can send SMS both manually and through the Rest API.', 'sms-gateway-press' ) }</p>
      <div className='smsgp-mt-4'>
        <a className='smsgp-btn smsgp-btn-primary' href={ sms_gateway_press_wizard.dashboard_url }>{ __( 'Finish', 'sms-gateway-press' ) }</a>
      </div>
    </>
  );
}
