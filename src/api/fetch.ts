interface IPayload {
  query: string;
  variables: object;
  headers?: object;
}

export const api = {
  fetch: async ({ query, variables, headers }: IPayload) => {
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
    return await fetch('https://graphql.anilist.co', options).then(resp => resp.json())
  }
} 