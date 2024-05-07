const FORM_URL = 'https://api.web3forms.com/submit';

export const sendMessage = async (formData: FormData) => {
  const response = await fetch(FORM_URL, {
    method: 'POST',
    body: formData,
  });
  const status = response?.status;

  if (status >= 400) {
    return {
      status,
      message: response?.statusText,
    };
  }

  const data = await response.json();

  return {
    status,
    data,
  };
};
