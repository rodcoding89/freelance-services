"use client"
import React, { createContext, FC, ReactNode, useMemo } from 'react';

export const TranslationContext = createContext(undefined);

export const TranslationProvider: FC<{ children: ReactNode,locale:string,messages:any }> = ({ children,locale,messages }) => {
    const memoizedTranslations = useMemo(() => messages, [locale]);
    return (
      <TranslationContext.Provider value={memoizedTranslations}>
        {children}
      </TranslationContext.Provider>
    );
};