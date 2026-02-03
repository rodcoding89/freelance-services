import { AppContext} from "@/app/context/app-context";
import { TranslationContext } from "@/app/context/translation-context";
import { useContext } from "react";


export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
      throw new Error('useMonContext doit être utilisé dans un MonContextProvider');
    }
    return context;
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useMonContext doit être utilisé dans un MonContextProvider');
  }
  return context;
};
