import { t } from 'i18next';
import { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../app-context';

interface CreateClientProps {
}

const CreateClient: React.FC<CreateClientProps> = () => {
    const [isPopUp,setIsPopUp] = useState<boolean>(false)
    const {contextData} = useContext(AppContext)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = (data: any) => {
        console.log('Client Data:', data);
        // Handle form submission here
    };
    console.log("main",contextData)
    useEffect(()=>{
        if (contextData && (contextData.state === "hide" || contextData.state === "show")) {
            console.log("inside contextData",contextData)
            setIsPopUp(contextData.value)
        }
    },[contextData])

  return (
    <main className={`transition-transform duration-700 delay-300 ease-in-out ${isPopUp ? 'translate-x-[-25vw]' : 'translate-x-0'} w-[85%] mt-[110px] mx-auto`}>
        <h1 className="text-center text-thirty uppercase">{t("legalNotice")}</h1>
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create Client</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700">
                    Client Full Name
                </label>
                <input
                    type="text"
                    id="clientName"
                    {...register('clientName', { required: 'Client name is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
                {errors.clientName && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientName.message as string}</p>
                )}
                </div>

                <div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Validate
                </button>
                </div>
            </form>
            </div>
    </main>
  );
};

export default CreateClient;
