"use client"
import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'next/navigation';
import firebase from "@/utils/firebase";
import Cookies from 'js-cookie';
import Icon from './Icon';

interface LoginProps {
    locale:string
}


const Login: React.FC<LoginProps> = ({locale}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loader, setLoader] = useState<boolean>(false);
  const [confirmLoggin, setConfirmLooggin] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoader(true);
    try {
      await signInWithEmailAndPassword(firebase.auth, email, password);
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 12);
      Cookies.set('logged', 'true', { expires: expirationDate });
      setLoader(false);
      setConfirmLooggin(true);
      //router.push('/'+locale+'/clients-list');
    } catch (err:any) {
      setError(err.message);
      setLoader(false);
      setConfirmLooggin(false);
    }
  };

  useEffect(()=>{
    if(Cookies.get('logged')){
      router.push('/'+locale+'/clients-list')
    }else{
      console.log("cookies",Cookies.get('logged'))
    }
    if(confirmLoggin){
      router.push('/'+locale+'/clients-list')
    }
  },[confirmLoggin,locale,router])
  return (
    <div className="flex justify-center items-center h-screen bg-white mt-[100px]">
      <div className="bg-gray-200 p-8 rounded shadow-md w-[50%] min-[250px]">
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
