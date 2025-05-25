// my-next-app/pages/api/sync-user.ts
import { getSession } from '@auth0/nextjs-auth0';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  const user = session?.user;

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const syncResponse = await axios.post('http://localhost:8080/api/users/sync', {
      email: user.email,
      name: user.name,
      picture: user.picture,
      sub: user.sub,
    });

    res.status(200).json(syncResponse.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to sync user' });
  }
}
