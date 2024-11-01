import React, { useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Steps } from './Wizard';
import QRCode from 'qrcode';

export default function InstallAppPage( { setCurrentStep } ) {
  const canvasRef = useRef( null );
  const qrInit    = useRef( false );

  const downloadAppUrl = 'https://www.sms-gateway-press.com/download-app';

  useEffect( () => {
    if ( true === qrInit.current ) {
      return;
    }

    QRCode.toCanvas( canvasRef.current, downloadAppUrl );

    qrInit.current = true;
  } );

  function handleClick() {
    setCurrentStep( Steps.connectDevice );
  };

  return (
    <>
      <h2>{ __( 'Install the app client', 'sms-gateway-press' ) }</h2>
      <p className='smsgp-w-3/5 smsgp-m-auto smsgp-mb-4'>{ __( 'To connect the new device, you need to download the client app which can be obtained from the link provided in the following QR code.', 'sms-gateway-press' ) }</p>
      <p className='smsgp-w-3/5 smsgp-m-auto smsgp-mb-4'>{ __( 'The app client is an open source project which can be audited if you want.', 'sms-gateway-press' ) }</p>
      <div><canvas ref={ canvasRef }></canvas></div>
      <ul className='smsgp-flex smsgp-gap-2 smsgp-justify-center'>
        <li><a href={ downloadAppUrl } target='_blank'>{ __( 'Get download link', 'sms-gateway-press' ) }</a></li>
        <li><a href='https://github.com/SMS-Gateway-Press/android' target='_blank'>{ __( 'Source Code', 'sms-gateway-press' ) }</a></li>
      </ul>
      <div className='smsgp-mt-8'>
        <button
          className='smsgp-btn smsgp-btn-primary'
          onClick={ handleClick }
        >{ __( 'I have already installed the app', 'sms-gateway-press' ) }</button>
      </div>
    </>
  );
}
