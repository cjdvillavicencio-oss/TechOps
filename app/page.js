'use client';

import dynamic from 'next/dynamic';

const Desktop = dynamic(() => import('@/components/desktop/Desktop'), { ssr: false });

function App() {
  return <Desktop />;
}

export default App;
