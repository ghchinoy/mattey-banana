export async function generateImage(prompt: string, apiKey: string): Promise<string> {
  // Using Gemini 3 Pro Image (Nano Banana Pro)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to generate image');
  }

  const data = await response.json();
  
  // The Gemini Image API returns the image as a base64 string in the response
  // Assuming the structure based on standard Gemini 1.5 Pro / Image response patterns
  // Note: Adjusting if the specific Nano Banana Pro API differs
  const base64Image = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  const mimeType = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'image/png';

  if (!base64Image) {
    throw new Error('No image data received from Gemini');
  }

  return `data:${mimeType};base64,${base64Image}`;
}
