import React from 'react'
import Image from 'next/image'
import {footerImg} from '../public/images'
const Footer = () => {
  return (
    <div className="footer flex bg-white h-[15vh] justify-center p-0 m-0 align-center" > 
    <Image src={footerImg} width={450} height={120} alt="Ramon.Space Logo" />
</div>
  )
}

export default Footer