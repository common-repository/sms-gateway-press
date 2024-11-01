import { Chart } from 'chart.js/auto';
import React, { useRef, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import MetaBox from './MetaBox';

export default function RealTimeSendingMetaBox( { chartData, deviceStatusList } ) {
  const canvasRef = useRef( null );
  const chartRef  = useRef( null );

  function getChartData() {
    const labels   = chartData.map( chartDataItem => chartDataItem.second );
    const datasets = deviceStatusList.map( deviceStatusListItem => {
      return {
        label: deviceStatusListItem.post_title, // device name
        data: chartData.map( chartDataItem => {
          if ( 0 === chartDataItem.sending.length ) {
            return 0;
          }

          for ( let sendingItem of chartDataItem.sending ) {
            if ( deviceStatusListItem.ID == sendingItem.sent_by_device ) {
              return sendingItem.total;
            }
          }
        } ),
      }
    } );

    return {
      labels,
      datasets,
    };
  };

  useEffect( () => {
    if ( null === chartRef.current ) {
      chartRef.current = new Chart(
        canvasRef.current,
        {
          type: 'line',
          data: getChartData(),
          options: {
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                suggestedMax: 10,
                ticks: {
                  precision: 0,
                  stepSize: 1
                },
              },
            },
          },
        }
      );
    } else {
      chartRef.current.data = getChartData();
      chartRef.current.update( 'none' );
    }
  } );

  return (
    <MetaBox title={ __( 'Real Time Sending', 'sms-gateway-press' ) }>
      <canvas className='smsgp-w-full' ref={ canvasRef }></canvas>
    </MetaBox>
  );
}
