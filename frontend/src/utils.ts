export const generateCurl = (testCase: any): string => {
  let curl = `curl --location --request ${testCase.method} '${testCase.url}'`;

  if (testCase.headers) {
    const headers = JSON.parse(testCase.headers);
    for (const key in headers) {
      curl += ` \\\n--header '${key}: ${headers[key]}'`;
    }
  }

  if (testCase.payload) {
    curl += ` \\\n--data-raw '${testCase.payload}'`;
  }

  return curl;
};

export {};