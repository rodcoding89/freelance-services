"use client"
import React from "react";

// Définir le type du contexte
interface AppContextType {
  contextData: any; // Remplace "any" par un type plus spécifique si possible
  setContextData: (data: any) => void; // Fonction pour mettre à jour contextData
}

// Créer le contexte avec des valeurs par défaut
const AppContext = React.createContext<AppContextType>({
  contextData: null,
  setContextData: () => {}, // Fonction par défaut
});

// Créer le Provider
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contextData, setContextData] = React.useState<any>(null); // Remplace "any" par un type plus spécifique si possible
  //console.log("sharedData changed:", contextData);
  return (
    <AppContext.Provider value={{ contextData, setContextData }}>
      {children}
    </AppContext.Provider>
  );
};

// Exporter le contexte et le Provider
export { AppContext, AppProvider };