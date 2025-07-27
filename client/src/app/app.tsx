import { HeroUIProvider } from '@heroui/react'
import CardList from '../components/cardList'

function App() {
  
  return (
    <HeroUIProvider>
      <div className='container mx-auto'>
        <CardList />
      </div>
    </HeroUIProvider>
  )
}

export default App
