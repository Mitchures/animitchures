import { useState, useEffect } from "react";

interface IPayload {
  query: string;
  variables: object;
  headers?: object;
}

export const useFetch = (payload: IPayload) => {
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const { query, variables, headers } = payload;
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: JSON.stringify({
            query,
            variables
          }),
        };
        const resp = await fetch('https://graphql.anilist.co', options);
        const data = await resp.json();

        setApiData(data);
        setIsLoading(false);
      } catch (error: any) {
        setServerError(error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [payload]);

  return { isLoading, apiData, serverError };
};