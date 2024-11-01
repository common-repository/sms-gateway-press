import React from 'react';

export default function MetaBox( { title, children } ) {
  return (
    <div className='postbox smsgp-w-full md:smsgp-w-auto'>
      <div className='postbox-header'>
        <h2 className='smsgp-mx-2 smsgp-my-3'>{ title }</h2>
      </div>
      <div className='inside'>
        { children }
      </div>
    </div>
  );
}
