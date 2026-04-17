import { useEffect, useState } from 'react'

export const Debouncer = ({
    inputString,
    debounceDelay
}) => {
    const [debouncedString, setDebouncedQuery] = useState(inputString);

    useEffect(() => {
        
        const delayedChange = setTimeout(() => {
            setDebouncedQuery(inputString);
        }, debounceDelay);

        return clearTimeout(delayedChange);

    }, [inputString, debounceDelay])

    return debouncedString;
}