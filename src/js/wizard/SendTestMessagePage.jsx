import React, { useState, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import { Steps } from './Wizard';

export default function SendTestMessagePage( { setCurrentStep, getDeviceStatusInterval, setSms } ) {
  const [ phoneNumber, setPhoneNumber ]   = useState( '' );
  const [ text, setText ]                 = useState( __( 'This is a test message sent by SMS Gateway Press', 'sms-gateway-press' ) );
  const [ formDisabled, setFormDisabled ] = useState( false );

  const charLimit = 160;

  const getSmsInfoIntervalRef = useRef( null );

  function handlePhoneNumberChange( event ) {
    setPhoneNumber( event.target.value );
  };

  function handleTextareaChange( event ) {
    setText( event.target.value );
  };

  function handleSubmit( event ) {
    event.preventDefault();

    if ( true === formDisabled ) {
      return false;
    }

    setFormDisabled( true );

    let requestBody = new FormData();
    requestBody.set( 'action', sms_gateway_press_wizard.action_send_test_message );
    requestBody.set( 'nonce', sms_gateway_press_wizard.nonce_send_test_message );
    requestBody.set( 'phone_number', phoneNumber );
    requestBody.set( 'text', text );

    let options = {
      method: 'POST',
      body: requestBody,
    };

    fetch( sms_gateway_press_wizard.url, options ).then( response => {
      if ( 200 === response.status ) {
        response.json().then( sendTestMessageJson => {
          clearInterval( getDeviceStatusInterval );
          setSms( { id: sendTestMessageJson.data.sms_post_id } );

          getSmsInfoIntervalRef.current = setInterval( () => {
            let requestBody = new FormData();
            requestBody.set( 'action', sms_gateway_press_wizard.action_get_sms_info );
            requestBody.set( 'nonce', sms_gateway_press_wizard.nonce_get_sms_info );
            requestBody.set( 'sms_post_id', sendTestMessageJson.data.sms_post_id );

            let options = {
              method: 'POST',
              body: requestBody,
            };

            fetch( sms_gateway_press_wizard.url, options ).then( response => {
              if ( 200 === response.status ) {
                response.json().then( getSmsInfoJson => {
                  if ( 'sent' === getSmsInfoJson.data.status ) {
                    clearInterval( getSmsInfoIntervalRef.current );
                    setCurrentStep( Steps.finish );
                  }
                } );
              }
            } );
          }, 1000 );
        } );
      }
    } );

    return false;
  };

  return (
    <>
      <h2>{ __( 'Send a test message', 'sms-gateway-press' ) }</h2>
      <form
        className='smsgp-text-left smsgp-inline-block smsgp-m-auto'
        onSubmit={ handleSubmit }
      >
        <label className="smsgp-form-control smsgp-w-full smsgp-max-w-xs">
          <div className="smsgp-label">
            <span className="smsgp-label-text">{ __( 'Phone Number', 'sms-gateway-press' ) }</span>
          </div>
          <input
            type="tel"
            placeholder={ __( 'Phone Number', 'sms-gateway-press' ) }
            className="smsgp-input smsgp-input-bordered smsgp-w-full smsgp-max-w-xs"
            onChange={ handlePhoneNumberChange }
            required
            disabled={ formDisabled }
          />
          <div className="smsgp-label">
            <span className="smsgp-label-text-alt">{ __( 'Target phone number. Should be reachable from the device.', 'sms-gateway-press' ) }</span>
          </div>
        </label>

        <label className="smsgp-form-control">
          <div className="smsgp-label">
            <span className="smsgp-label-text">{ __( 'Text', 'sms-gateway-press' ) }</span>
          </div>
          <textarea
            maxLength={ charLimit }
            className="smsgp-textarea smsgp-textarea-bordered smsgp-h-24"
            onChange={ handleTextareaChange }
            required
            disabled={ formDisabled }
          >{ text }</textarea>
          <div className="smsgp-label">
            <span className="smsgp-label-text-alt"></span>
            <span className="smsgp-label-text-alt">{ text.length + '/' + charLimit }</span>
          </div>
        </label>

        <div className='smsgp-mt-6 smsgp-text-center'>
          <button
            type="submit"
            className='smsgp-btn smsgp-btn-primary'
            disabled={ formDisabled }
          >{ __( 'Send Test Message', 'sms-gateway-press' ) }</button>
        </div>
      </form>
    </>
  );
}
