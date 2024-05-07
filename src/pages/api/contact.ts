import { sendMessage } from '@/services/contact';

const FORM_API_KEY = process.env.CONTACT_FORM_API_KEY as string;

export default async function handle(req: Request) {
  try {
    const json = await req.json();

    const updatedFormData = new FormData();
    updatedFormData.append('access_key', FORM_API_KEY);

    for (const key in json) {
      updatedFormData.append(key, json[key]);
    }

    const response = await sendMessage(updatedFormData);

    return new Response(
      JSON.stringify({ status: 200, message: response?.data?.message }),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: 500, message: 'Something went wrong!' }),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}

export const runtime = 'edge';

export { handle as POST };
