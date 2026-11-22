import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { Skeleton } from '@/components/ui/skeleton'
import Home from '@/pages/public/Home'

const About = lazy(() => import('@/pages/public/About'))
const Contact = lazy(() => import('@/pages/public/Contact'))
const Donate = lazy(() => import('@/pages/public/Donate'))
const DonateClothes = lazy(() => import('@/pages/public/DonateClothes'))
const Faq = lazy(() => import('@/pages/public/Faq'))
const News = lazy(() => import('@/pages/public/News'))
const NewsPost = lazy(() => import('@/pages/public/NewsPost'))
const NotFound = lazy(() => import('@/pages/public/NotFound'))
const Partners = lazy(() => import('@/pages/public/Partners'))
const Programs = lazy(() => import('@/pages/public/Programs'))
const Volunteer = lazy(() => import('@/pages/public/Volunteer'))
// The dashboard is split out so visitors never download it.
const Admin = lazy(() => import('@/pages/admin/routes'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Skeleton className="m-8 h-96" />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="programs" element={<Programs />} />
            <Route path="news" element={<News />} />
            <Route path="news/:slug" element={<NewsPost />} />
            <Route path="faq" element={<Faq />} />
            <Route path="contact" element={<Contact />} />
            <Route path="donate" element={<Donate />} />
            <Route path="donate/clothes" element={<DonateClothes />} />
            <Route path="volunteer" element={<Volunteer />} />
            <Route path="partners" element={<Partners />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="admin/*" element={<Admin />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
