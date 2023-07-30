import React from 'react'
import Image from 'next/image'
const Header = () => {
  return (
    <div className="header flex bg-white justify-center p-0 m-0 align-center" > 
        <Image src="/../public/header.jpg" width={350} height={350} alt="Ramon.Space Logo" />
    </div>
  )
}

export default Header