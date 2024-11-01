import React from 'react';
import { __ } from '@wordpress/i18n';
import { Steps } from './Wizard';

export default function WelcomePage( { setCurrentStep } ) {
  return (
    <>
      <h2>{ __( 'Thank you for using SMS Gateway Press.', 'sms-gateway-press' ) }</h2>
      <p>{ __( 'This wizard will help you get started using our plugin.', 'sms-gateway-press' ) }</p>
      <div className='smsgp-mt-6'>
        <button
          className='smsgp-btn smsgp-btn-primary'
          onClick={ () => { setCurrentStep( Steps.createDevice ) } }
        >{ __( 'Start', 'sms-gateway-press' ) }</button>
      </div>
    </>
  );
}
