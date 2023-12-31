import React, { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import Link from 'next/link'

const App = () => {
  const { user, error, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/main'); 
    }
  }, [user, router]);


  return (
    isLoading ? <div className='flex justify-center items-center h-[80vh] w-full text-white text-3xl' >Loading...</div> :
    <div className='flex flex-col justify-between items-center h-[80vh] w-full'>
      <p className='text-white font-medItalic text-3xl pt-5 text-center' > AI at terrestrial speeds</p>
      <Link className='text-blacks font-mid text-3xl bg-whites py-3 px-[80px] rounded-xl shadow-boxtest shadow-whites' href="/api/auth/login">Sign In</Link>
      <p className='text-transparent font-italic' > AI at terrestial speeds</p>

    </div>
  );
};

export default App;
