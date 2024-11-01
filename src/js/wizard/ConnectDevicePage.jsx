import React, { useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { Steps } from './Wizard';
import QRCode from 'qrcode';

export default function ConnectDevicePage( { setCurrentStep, device, setDevice } ) {
  const canvasRef = useRef( null );

  useEffect( () => {
    QRCode.toCanvas( canvasRef.current, JSON.stringify( device.qrData ) );
  } );

  return (
    <>
      <h2>{ __( 'Connect the device', 'sms-gateway-press' ) }</h2>
      <div className='smsgp-flex smsgp-items-center'>
        <div className='smsgp-text-left'>
          <p className='smsgp-mb-6'>{ __( 'To connect the device, open the client app and follow these steps:', 'sms-gateway-press' ) }</p>
          <ul className='smsgp-list-decimal'>
            <li>{ __( 'Press the "Edit Credentials" button.', 'sms-gateway-press' ) }</li>
            <li>{ __( 'Press the "Scan QR" button.', 'sms-gateway-press' ) }</li>
            <li>{ __( 'Scan the QR code shown here.', 'sms-gateway-press' ) }</li>
            <li>{ __( 'Press the "Save" button.', 'sms-gateway-press' ) }</li>
            <li>{ __( 'Press the "Connect" button.', 'sms-gateway-press' ) }</li>
          </ul>
        </div>

        <div className='smsgp-flex-grow smsgp-text-center'>
          <canvas ref={ canvasRef }></canvas>
        </div>
      </div>

      <div className='smsgp-flex smsgp-mt-10'>
        <button
          className='smsgp-btn smsgp-btn-link'
          onClick={ () => { setCurrentStep( Steps.installApp ) } }
        >{ __( 'Go Back', 'sms-gateway-press' ) }</button>
      </div>
    </>
  );
}
