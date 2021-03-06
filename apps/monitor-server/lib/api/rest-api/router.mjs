import { Router } from 'express';
import { sessions, users, contacts, systemHealth, statuses } from './routes/index.mjs';

const router = Router();

router.get('/', (req, res) => res.send('Hello'));
router.get('/users', users.readList);
router.get('/contacts', contacts.readList);
router.get('/system_health', systemHealth.read);
router.get('/sessions', sessions.readList);
router.get('/statuses', statuses.readList);

export default router;
