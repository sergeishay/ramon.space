import '@/styles/globals.css'
import {UserProvider} from '@auth0/nextjs-auth0/client';
import ToasterContext from "@/context/TosterContext";



export default function App({ Component, pageProps }) {
  return(
    <UserProvider>
      <ToasterContext />
      <Component {...pageProps} />
    </UserProvider>
  )
}
