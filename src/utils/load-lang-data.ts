export default async function loadLangData({locale}:{locale:string}){
    try {
        return (await import(`../../messages/${locale}.json`)).default;
    } catch (error) {
        console.error("error during loading")
        return (await import(`../../messages/en.json`)).default; // Fallback en cas d'erreur
    }
}
