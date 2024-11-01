import React from 'react';
import { __ } from '@wordpress/i18n';
import MetaBox from './MetaBox';

export default function PerformanceMetaBox( { sending_average, delivery_average } ) {
  return (
    <MetaBox title={ __( 'Performance (last 24 hours)', 'sms-gateway-press' ) }>
      <table className="smsgp-table smsgp-table-xs">
        <tbody>
          <tr>
            <th>{ __( 'Average sending', 'sms-gateway-press' ) }</th>
            <td>{ sending_average }</td>
          </tr>
          <tr>
            <th>{ __( 'Average delivery', 'sms-gateway-press' ) }</th>
            <td dangerouslySetInnerHTML={{ __html: delivery_average }} />
          </tr>
        </tbody>
      </table>
    </MetaBox>
  );
}
