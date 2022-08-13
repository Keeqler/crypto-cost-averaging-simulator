import 'react-loading-skeleton/dist/skeleton.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { SkeletonTheme } from 'react-loading-skeleton'

import './styles/globals.css'

import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <div className='w-full text-neutral-1 antialiased bg-neutral-9'>
      <SkeletonTheme baseColor='#1A2227' highlightColor='#3D4347'>
        <App />
      </SkeletonTheme>
    </div>
  </React.StrictMode>
)
