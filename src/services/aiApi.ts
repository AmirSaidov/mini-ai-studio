const getErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error ?? "Request failed.";
  } catch {
    return "Request failed.";
  }
};

export const generateText = async (prompt: string): Promise<string> => {
  const response = await fetch("/api/text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const data = (await response.json()) as { text: string };
  return data.text;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const response = await fetch("/api/image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  const data = (await response.json()) as { imageUrl: string };
  return data.imageUrl;
};
