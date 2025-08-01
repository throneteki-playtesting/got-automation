import { HeroUIProvider, Slider } from '@heroui/react'
import { useState } from 'react';
import CardList from '../pages/cardList';

function App() {
  const [scale, setScale] = useState(1);
  
  return (
    <HeroUIProvider>
      <div className='container mx-auto'>
        <Slider value={scale} onChange={(value) => setScale(value as number)}  minValue={0.5} maxValue={5} step={0.01} label="Size Slider"/>
        <CardList scale={scale} />
      </div>
    </HeroUIProvider>
  )
}

export default App
