import { Router } from 'express';
import { chatsAll } from './Chat/FindAll';
import { createChat } from './Chat/CreateChat';
import { createMsg } from './Chat/CreateMessage';

// import { invite } from '../../controllers/SWING_Profile/InvitePartner';

const router: any = Router();

router.use(chatsAll);
router.use(createChat);
router.use(createMsg);
// router.use('/inv', invite);

export const chat = router;
