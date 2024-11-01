import React, { useRef } from 'react';
import { __ } from '@wordpress/i18n';
import MetaBox from './MetaBox';

export default function SendSmsMetaBox() {
  const dialogRef = useRef( null );

  const handleClickApiRest = () => {
    const dialog = dialogRef.current;
    dialog.showModal();
  };

  return (
    <>
      <MetaBox title={ __( 'Send SMS', 'sms-gateway-press' ) }>
        <div className='smsgp-flex smsgp-gap-2 smsgp-justify-center'>
          <a className='smsgp-btn' href={ sms_gateway_press_dashboard.add_new_sms_url }>{ __( 'Manual', 'sms-gateway-press' ) }</a>
          <a className='smsgp-btn' href='javascript:;' onClick={ handleClickApiRest }>{ __( 'Rest API', 'sms-gateway-press' ) }</a>
        </div>
      </MetaBox>

      <dialog ref={ dialogRef } className="smsgp-modal">
        <div className="smsgp-modal-box">
          <form method="dialog">
            {/* if there is a button in form, it will close the modal */}
            <button className="smsgp-btn smsgp-btn-sm smsgp-btn-circle smsgp-btn-ghost smsgp-absolute smsgp-right-2 smsgp-top-2">✕</button>
          </form>
          <h3 className="smsgp-font-bold smsgp-text-lg">{ __( 'Send SMS via Rest API' ) }</h3>
          <div className="smsgp-mockup-code">
            <pre data-prefix="$"><code>curl -X POST --user &quot;{ sms_gateway_press_dashboard.current_username }&quot;:&quot;&lt;app_password&gt;&quot; \</code></pre>
            <pre data-prefix=">"><code>{ sms_gateway_press_dashboard.site_url }/wp-json/sms-gateway-press/v1/send \</code></pre>
            <pre data-prefix=">"><code>-d phone_number=&quot;&lt;number&gt;&quot; -d text=&quot;&lt;text&gt;&quot;</code></pre>
          </div>
          <p>{ __( 'You must replace variables with the respective values.', 'sms-gateway-press' ) }</p>
          <p>{ __( 'The app_password variable refers to the application password.', 'sms-gateway-press' ) } <a href={ sms_gateway_press_dashboard.app_password_url } target='_blank'>{ __( 'Create App Password', 'sms-gateway-press' ) }</a></p>
          <p>{ __( 'Only 60 SMS per hour can be sent using the Rest API.', 'sms-gateway-press' ) } <a href="https://www.sms-gateway-press.com/premium" target='_blank'>{ __( 'Get Premium for Unlimited Sending', 'sms-gateway-press' ) }</a></p>
        </div>
      </dialog>
    </>
  );
}
