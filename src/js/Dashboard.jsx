import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { __ } from '@wordpress/i18n';
import DeviceStatusMetaBox from './dashboard/DeviceStatusMetaBox';
import SmsReportMetaBox from './dashboard/SmsReportMetaBox';
import PerformanceMetaBox from './dashboard/PerformanceMetaBox';
import RealTimeSendingMetaBox from './dashboard/RealTimeSendingMetaBox';
import SendSmsMetaBox from './dashboard/SendSmsMetaBox';

function Dashboard() {
  const [ deviceStatusList, setDeviceStatusList ] = useState( [] );
  const [ chartData, setChartData ]               = useState( [] );

  const [ smsReport, setSmsReport ] = useState( {
    scheduled: 0,
    queued: 0,
    sending: 0,
    sent: 0,
    delivered: 0,
    expired: 0,
  } );

  const [ performance, setPerformance ] = useState( {
    sending_average: 0,
    delivery_average: 0,
  } );

  const intervalRef       = useRef( null );
  const isFirstRequestRef = useRef( true );

  if ( null === intervalRef.current ) {
    const requestBody = new FormData();
    requestBody.set( 'action', sms_gateway_press_dashboard.action );
    requestBody.set( 'nonce', sms_gateway_press_dashboard.nonce );
    requestBody.set( 'is_first_request', isFirstRequestRef.current );

    const options = {
      method: 'POST',
      body: requestBody,
    };

    intervalRef.current = setInterval( () => {
      fetch( sms_gateway_press_dashboard.url, options ).then( response => {
        response.json().then( json => {
          setDeviceStatusList( json.data.device_status_list );
          setSmsReport( json.data.sms_balance );
          setPerformance( json.data.performance );
          setChartData( json.data.chart_data );

          isFirstRequestRef.current = false;
          requestBody.set( 'is_first_request', isFirstRequestRef.current );
        } );
      } );
    }, 1000 );
  }

  return (
    <>
      {
        isFirstRequestRef.current &&
        <div className='smsgp-flex smsgp-justify-center smsgp-items-center smsgp-h-screen'>
          <span className="smsgp-loading smsgp-loading-spinner smsgp-loading-lg"></span>
        </div>
      }
      {
        ! isFirstRequestRef.current &&
        <>
          <h1>SMS Gateway Press</h1>
          <div className='smsgp-flex smsgp-flex-wrap 2xl:smsgp-flex-nowrap smsgp-py-4 smsgp-items-start smsgp-gap-4'>
            <div>
              <SendSmsMetaBox />
              <DeviceStatusMetaBox deviceStatusList={ deviceStatusList } />
            </div>

            <SmsReportMetaBox
              scheduled  = { smsReport.scheduled }
              queued     = { smsReport.queued }
              sending    = { smsReport.sending }
              sent       = { smsReport.sent }
              delivered  = { smsReport.delivered }
              expired    = { smsReport.expired }
            />

            <PerformanceMetaBox
              sending_average  = { performance.sending_average }
              delivery_average = { performance.delivery_average }
            />

            <div className='smsgp-flex-grow'>
              <RealTimeSendingMetaBox
                chartData        = { chartData }
                deviceStatusList = { deviceStatusList }
              />
            </div>
          </div>
        </>
      }
    </>
  );
};

const wrap = document.querySelector( '.wrap' );
const root = createRoot( wrap );

root.render( <Dashboard /> );
