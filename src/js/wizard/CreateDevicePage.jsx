import React, { useState } from 'react';
import { __ } from '@wordpress/i18n';
import { Steps } from './Wizard';

export default function CreateDevicePage( { setCurrentStep, device, setDevice } ) {
  const [ deviceName, setDeviceName ]     = useState( '' );
  const [ hasError, setHasError ]         = useState( false );
  const [ errorMessage, setErrorMessage ] = useState( '' );
  const [ formDisabled, setFormDisabled ] = useState( false );

  const handleInputChange = event => {
    setDeviceName( event.target.value );
    setHasError( false );
  };

  const handleSubmit = event => {
    event.preventDefault();

    if ( ! deviceName ) {
      setHasError( true );
      setErrorMessage( __( 'The device name is required.', 'sms-gateway-press' ) );
      return false;
    }

    setFormDisabled( true );

    const requestBody = new FormData();
    requestBody.set( 'action', sms_gateway_press_wizard.action_create_device );
    requestBody.set( 'nonce', sms_gateway_press_wizard.nonce_create_device );
    requestBody.set( 'device_name', deviceName );

    const options = {
      method: 'POST',
      body: requestBody,
    };

    fetch( sms_gateway_press_wizard.url, options ).then( response => {
      if ( 200 === response.status ) {
        response.json().then( json => {
          setDevice(
            {
              ...device,
              id: json.data.device_post_id,
            }
          );

          setCurrentStep( Steps.installApp );
        } );
      }
    } );

    return false;
  };

  return (
    <>
      <h2>{ __( 'Create a device', 'sms-gateway-press' ) }</h2>
      <p className='smsgp-mb-6'>{ __( 'To send SMS, you first need to create and connect an Android device.', 'sms-gateway-press' ) }</p>

      <form onSubmit={ handleSubmit }>
        <label className="smsgp-form-control smsgp-w-full smsgp-max-w-xs smsgp-m-auto">
          <input
            className={ 'smsgp-input smsgp-input-bordered smsgp-w-full smsgp-max-w-xs ' + ( hasError ? 'smsgp-input-error' : '' ) }
            type="text"
            placeholder={ __( 'Enter a device name', 'sms-gateway-press' ) }
            onChange={ handleInputChange }
            disabled={ formDisabled }
          />
          {
            hasError &&
            <div className="smsgp-label">
              <span className="smsgp-label-text-alt smsgp-text-error">{ errorMessage }</span>
            </div>
          }
        </label>
        <div className='smsgp-mt-6'>
          <button
            type="submit"
            className='smsgp-btn smsgp-btn-primary'
            disabled={ formDisabled }
          >{ __( 'Create Device', 'sms-gateway-press' ) }</button>
        </div>
      </form>
    </>
  );
}
