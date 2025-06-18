export const loadCountries = async () => {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_ROOT_LINK+'/assets/countries.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading countries:', error);
        return [];
    }
}

export const loadEnTranslation = async () =>{
    try {
        const messages = (await import(`../../messages/en.json`)).default;
        console.log("messages",messages,"contract",messages.contract)
        return messages.contract;
    } catch (error) {
        console.error('Error loading en translation:', error);
        return null;
    }
}