import '@/styles/globals.css'
import {UserProvider} from '@auth0/nextjs-auth0/client';
import ToasterContext from "@/context/TosterContext";
import { Html, Head, Main, NextScript } from "next/document";



export default function App({ Component, pageProps }) {
  return(
    <UserProvider>

      <ToasterContext />
      <Component {...pageProps} />
    </UserProvider>
  )
}
