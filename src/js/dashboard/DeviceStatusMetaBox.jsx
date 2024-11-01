import React from 'react';
import { __ } from '@wordpress/i18n';
import MetaBox from './MetaBox';

function NoDevicesFound() {
  return (
    <tr>
      <td className='smsgp-text-center'>
        <p>{ __( 'No devices found.', 'sms-gateway-press' ) }</p>
        <p>
          <a
            className='smsgp-btn smsgp-btn-primary smsgp-btn-sm'
            href={ sms_gateway_press_dashboard.add_new_device_url }
          >{ __( 'Add new device', 'sms-gateway-press' ) }</a>
        </p>
      </td>
    </tr>
  );
}

export default function DeviceStatusMetaBox( { deviceStatusList } ) {
  return (
    <MetaBox title={ __( 'Device Status', 'sms-gateway-press' ) }>
      <div className="smsgp-overflow-x-auto">
        <table className="smsgp-table smsgp-table-xs">
          <tbody>
            { 0 === deviceStatusList.length && <NoDevicesFound /> }

            {
              deviceStatusList.map( ( item ) => {
                return (
                  <tr key={ item.ID }>
                    <th scope='row'>{ item.post_title }</th>
                    <td dangerouslySetInnerHTML={{ __html: item.badge_html }} />
                  </tr>
                );
              } )
            }
          </tbody>
        </table>
      </div>
    </MetaBox>
  );
}
