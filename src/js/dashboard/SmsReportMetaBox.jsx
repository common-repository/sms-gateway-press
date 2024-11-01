import React from 'react';
import { __ } from '@wordpress/i18n';
import MetaBox from './MetaBox';

export default function SmsReportMetaBox( { scheduled, queued, sending, sent, delivered, expired } ) {
  return (
    <MetaBox title={ __( 'SMS activity (last 24 hours)', 'sms-gateway-press' ) }>
      <table className="smsgp-table smsgp-table-xs">
        <tbody>
          <tr>
            <th>{ __( 'Scheduled', 'sms-gateway-press' ) }</th>
            <td>{ scheduled }</td>
          </tr>
          <tr>
            <th>{ __( 'Queued', 'sms-gateway-press' ) }</th>
            <td>{ queued }</td>
          </tr>
          <tr>
            <th>{ __( 'Sending', 'sms-gateway-press' ) }</th>
            <td>{ sending }</td>
          </tr>
          <tr>
            <th>{ __( 'Sent', 'sms-gateway-press' ) }</th>
            <td>{ sent }</td>
          </tr>
          <tr>
            <th>{ __( 'Delivered', 'sms-gateway-press' ) }</th>
            <td>{ delivered }</td>
          </tr>
          <tr>
            <th>{ __( 'Expired', 'sms-gateway-press' ) }</th>
            <td>{ expired }</td>
          </tr>
        </tbody>
      </table>
    </MetaBox>
  );
}
