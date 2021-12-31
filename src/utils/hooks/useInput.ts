import { useState } from "react";

export const useInput = (initialValue: any) => {
    const [value, setValue] = useState(initialValue);

    const handleChange = (event: { target: { value: any; }; }) => {
        setValue(event.target.value);
    };

    return {
        value,
        onChange: handleChange
    };
};