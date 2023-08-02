import { Html, Head, Main, NextScript } from "next/document";
import Header from "../components/Header";
import Footer from "../components/Footer";
export default function Document() {
  return (
    <Html lang="en">
      <Head />
 
      <body className="bg-main-background bg-center bg-cover bg-no-repeat w-[100%] h-[100vh] p-0 m-0 flex flex-col justify-stretch">
        <Header />
        <Main />
        <NextScript />
        <Footer />
      </body>
    </Html>
  );
}
