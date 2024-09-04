import dynamic from 'next/dynamic';

// const AdminDashboard = dynamic(() => import('@/components/admindashboard/AdminDashboard'), {
//   ssr: false,
// })

export const metadata = {
  title: "Kya dekh ra be",
  description: "SIH 2024 Winners",
}


const InteractiveMap = dynamic(() => import('@/components/mapcomponent/InteractiveMap'), {
  ssr: false,
})
export default function Page() {
  return (
    <div>
      <InteractiveMap />
    </div>
  )
}