interface IPayload {
  query: string;
  variables: object;
}

export const api = {
  fetch: async ({ query, variables }: IPayload) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      }),
    };
    return await fetch('https://graphql.anilist.co', options).then(resp => resp.json())
  }
} 