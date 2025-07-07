import { Button, HeroUIProvider } from '@heroui/react'
import './App.css'
import { useState } from 'react'

function App() {
  const [value, setValue] = useState(0);
  return (
    <HeroUIProvider>
      <div className="text-3xl font-bold text-blue-600 p-6">
        Tailwind is working!
      </div>
      <div>
        Value: {value}
      </div>
      <Button onPress={() => setValue(value + 1)}>
        Add 1
      </Button>
    </HeroUIProvider>
  )
}

export default App
