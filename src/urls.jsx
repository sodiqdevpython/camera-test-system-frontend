import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/homePage'
import ChackeCamera from './pages/chackeCamera'
import Update from './pages/update'

export default function Urls() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<HomePage />} />
                <Route path='/:id/camera' element={<ChackeCamera />} />
                <Route path='/:id' element={<Update />} />
            </Routes>
        </BrowserRouter>
    )
}
