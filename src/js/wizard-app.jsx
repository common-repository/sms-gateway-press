import React from 'react';
import { createRoot } from 'react-dom/client';
import Wizard from './wizard/Wizard';

const wrap = document.querySelector( '.wrap' );
const root = createRoot( wrap );

root.render( <Wizard /> );
