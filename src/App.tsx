import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './state/AppContext'
import { TabBar } from './components/TabBar'
import { Onboarding } from './screens/Onboarding'
import { Feed } from './screens/Feed'
import { DealDetail } from './screens/DealDetail'
import { PostFlow } from './screens/PostFlow'
import { Coupons } from './screens/Coupons'
import { Profile } from './screens/Profile'
import { MapScreen } from './screens/MapScreen'
import { Auth } from './screens/Auth'

function Shell() {
  const { onboarded } = useApp()
  if (!onboarded) return <Onboarding />
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/deal/:id" element={<DealDetail />} />
        <Route path="/post" element={<PostFlow />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="*" element={<Feed />} />
      </Routes>
      <TabBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Shell />
      </AppProvider>
    </BrowserRouter>
  )
}
