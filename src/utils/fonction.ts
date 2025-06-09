export const loadCountries = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_ROOT_LINK+'/assets/countries.json');
    const data = await response.json();
    return data;
}