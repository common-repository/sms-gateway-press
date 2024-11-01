import React, { useState, useEffect, useRef } from 'react';
import { __ } from '@wordpress/i18n';
import svglogo from '../../../logo.svg';
import WelcomePage from './WelcomePage';
import CreateDevicePage from './CreateDevicePage';
import InstallAppPage from './InstallAppPage';
import ConnectDevicePage from './ConnectDevicePage';
import SendTestMessagePage from './SendTestMessagePage';
import FinishPage from './FinishPage';

export const Steps = {
  welcome: 'welcome',
  createDevice: 'create-device',
  installApp: 'install-app',
  connectDevice: 'connect-device',
  sendTestMessage: 'send-test-message',
  finish: 'finish',
};

export default function Wizard( { step } ) {
  const [ currentStep, setCurrentStep ] = useState( 'string' === typeof step ? step : Steps.welcome );

  const [ device, setDevice ] = useState( {
    id: null,
    qrData: null,
    status: null,
    statusBadge: null,
  } );

  const [ sms, setSms ] = useState( {
    id: null,
    status: null,
  } );

  const stepClasses = {
    welcome: 'smsgp-step smsgp-step-primary',
    createDevice: 'smsgp-step ',
    installApp: 'smsgp-step ',
    connectDevice: 'smsgp-step ',
    sendTestMessage: 'smsgp-step ',
    finish: 'smsgp-step ',
  };

  if ( Steps.createDevice === currentStep ) {
    stepClasses.createDevice += 'smsgp-step-primary';
  }

  if ( Steps.installApp === currentStep ) {
    stepClasses.createDevice += 'smsgp-step-primary';
    stepClasses.installApp   += 'smsgp-step-primary';
  }

  if ( Steps.connectDevice === currentStep ) {
    stepClasses.createDevice  += 'smsgp-step-primary';
    stepClasses.installApp    += 'smsgp-step-primary';
    stepClasses.connectDevice += 'smsgp-step-primary';
  }

  if ( Steps.sendTestMessage === currentStep ) {
    stepClasses.createDevice    += 'smsgp-step-primary';
    stepClasses.installApp      += 'smsgp-step-primary';
    stepClasses.connectDevice   += 'smsgp-step-primary';
    stepClasses.sendTestMessage += 'smsgp-step-primary';
  }

  if ( Steps.finish === currentStep ) {
    stepClasses.createDevice    += 'smsgp-step-primary';
    stepClasses.installApp      += 'smsgp-step-primary';
    stepClasses.connectDevice   += 'smsgp-step-primary';
    stepClasses.sendTestMessage += 'smsgp-step-primary';
    stepClasses.finish          += 'smsgp-step-primary';
  }

  const intervalRef = useRef( null );

  useEffect( () => {
    if ( 'number' !== typeof device.id ) {
      return;
    }

    if ( 'number' === typeof sms.id ) {
      return;
    }

    if ( 'number' === typeof intervalRef.current ) {
      return;
    }

    intervalRef.current = setInterval( () => {
      const requestBody = new FormData();
      requestBody.set( 'action', sms_gateway_press_wizard.action_connect_device );
      requestBody.set( 'nonce', sms_gateway_press_wizard.nonce_connect_device );
      requestBody.set( 'device_post_id', device.id );

      const options = {
        method: 'POST',
        body: requestBody,
      };

      fetch( sms_gateway_press_wizard.url, options ).then( response => {
        if ( 200 === response.status ) {
          response.json().then( json => {
            setDevice( {
              ...device,
              status: json.data.status,
              statusBadge: json.data.status_badge,
              qrData: json.data.qr_data,
            } );
          } );
        }
      } );
    }, 1000 );
  } );

  if ( 'number' === typeof device.id
    && Steps.installApp !== currentStep
    && null === sms.id
  ) {
    if ( 'disconnected' === device.status && Steps.connectDevice !== currentStep ) {
      setCurrentStep( Steps.connectDevice );
    }

    if ( 'connected' === device.status && Steps.sendTestMessage !== currentStep ) {
      setCurrentStep( Steps.sendTestMessage );
    }
  }

  return (
    <div className='smsgp-flex smsgp-flex-col smsgp-justify-center smsgp-items-center smsgp-mt-16'>
      <div className='smsgp-flex smsgp-mb-4 smsgp-gap-2'>
        <img src={svglogo} width={64} alt="logo" />
        <h1>SMS Gateway Press</h1>
      </div>
      <div className='smsgp-flex smsgp-flex-col smsgp-bg-white smsgp-shadow-lg smsgp-p-8 smsgp-rounded-lg smsgp-min-h-96'>
        <ul className="smsgp-steps">
          <li className={ stepClasses.welcome }>{ __( 'Welcome', 'sms-gateway-press' ) }</li>
          <li className={ stepClasses.createDevice }>{ __( 'Create a device', 'sms-gateway-press' ) }</li>
          <li className={ stepClasses.installApp }>{ __( 'Install the app', 'sms-gateway-press' ) }</li>
          <li className={ stepClasses.connectDevice }>{ __( 'Connect the device', 'sms-gateway-press' ) }</li>
          <li className={ stepClasses.sendTestMessage }>{ __( 'Send a test SMS', 'sms-gateway-press' ) }</li>
          <li className={ stepClasses.finish }>{ __( 'Finish', 'sms-gateway-press' ) }</li>
        </ul>

        {
          'number' === typeof device.id && Steps.installApp !== currentStep && Steps.finish !== currentStep &&
          <div className='smsgp-flex smsgp-justify-center smsgp-gap-2'>
            <span className="smsgp-loading smsgp-loading-ring smsgp-loading-sm smsgp-text-error"></span>
            <p>{ __( 'The device is:', 'sms-gateway-press' ) } <span dangerouslySetInnerHTML={{ __html: device.statusBadge }} /></p>
            <span className="smsgp-loading smsgp-loading-ring smsgp-loading-sm smsgp-text-error"></span>
          </div>
        }

        <div className='smsgp-my-8 smsgp-grow smsgp-text-center'>
          { Steps.welcome === currentStep &&
            <WelcomePage setCurrentStep={ setCurrentStep } />
          }

          { Steps.createDevice === currentStep &&
            <CreateDevicePage
              setCurrentStep={ setCurrentStep }
              device={ device }
              setDevice={ setDevice }
            />
          }

          { Steps.installApp === currentStep &&
            <InstallAppPage
              setCurrentStep={ setCurrentStep }
            />
          }

          { Steps.connectDevice === currentStep &&
            <ConnectDevicePage
              setCurrentStep={ setCurrentStep }
              device={ device }
              setDevice={ setDevice }
            />
          }

          { Steps.sendTestMessage === currentStep &&
            <SendTestMessagePage
              getDeviceStatusInterval={ intervalRef.current }
              setSms={ setSms }
              setCurrentStep={ setCurrentStep }
            />
          }

          { Steps.finish === currentStep &&
            <FinishPage />
          }
        </div>
      </div>
    </div>
  );
}
