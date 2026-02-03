"use client"
import { useContext, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import Icon from './Icon';
import { getCookie } from '@/server/services';
import { AppContext } from '@/app/context/app-context';


interface LoginProps {
  locale:string
}


const Login: React.FC<LoginProps> = ({locale}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState<boolean>(false);
  const {setContextData} = useContext(AppContext);
  const [confirmLoggin, setConfirmLooggin] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoader(true);
    try {
      const response = await fetch('/api/login/',{
        method: 'POST', // Garde votre méthode GET pour l'exemple
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) {
        setContextData({toast:{toastVariant:"error",toastMessage:locale ? "Une erreur est survenue lors de la requête." : "An Error occurred during the request",showToast:true,time:new Date().getTime()}})     
      }
      const data = await response.json();
      if (data) {
        if (data.success) {
          setConfirmLooggin(true);
        } else {
          setContextData({toast:{toastVariant:"error",toastMessage:data.message,showToast:true,time:new Date().getTime()}})     
          setError(data.message);
          setLoader(false);
          setConfirmLooggin(false);
        }
      } else {
        setError('Erreur lors de la connexion');
        setLoader(false);
        setConfirmLooggin(false);
      }
    } catch (err:any) {
      console.log(err)
      setContextData({toast:{toastVariant:"error",toastMessage:err.message,showToast:true,time:new Date().getTime()}})     
                
      setError(err.message);
      setLoader(false);
      setConfirmLooggin(false);
    }
  };

  useEffect(()=>{
    const checkCookie = async ()=>{
      const cookie = await getCookie('userAuth')
      if(cookie){
        router.push('/'+locale+'/clients-list')
      }
    }
    if(confirmLoggin){
      router.push('/'+locale+'/clients-list')
    }
    checkCookie()
  },[confirmLoggin,locale,router])
  return (
    <div className="flex justify-center items-center h-screen bg-white mt-[6.25rem]">
      <div className="bg-gray-200 p-8 rounded shadow-md w-[50%] min-[15.625rem]">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-start justify-center gap-2"
              type="submit"
            >
              <span>Sign In</span> {loader && <Icon name='bx bx-loader-alt bx-spin bx-rotate-180' color='#fff' size='1em'/>}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
