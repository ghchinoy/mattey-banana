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
  console.log('Gemini API Response:', data);
  
  // Try multiple common response paths for image data
  const part = data.candidates?.[0]?.content?.parts?.[0];
  const base64Image = part?.inlineData?.data || part?.data || part?.text;
  const mimeType = part?.inlineData?.mimeType || 'image/png';

  if (!base64Image) {
    console.error('Incomplete Gemini Response:', data);
    throw new Error('No image data received from Gemini');
  }

  // If the API returned a full data URL or just the base64 string
  return base64Image.startsWith('data:') ? base64Image : `data:${mimeType};base64,${base64Image}`;
}
