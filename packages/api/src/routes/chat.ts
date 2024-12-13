import { Router } from 'express';
import { handleChatMessage, startChat, getEnhancedInterpretation } from '../controllers/chatController';

const router = Router();

router.post('/start', startChat);
router.post('/message', handleChatMessage);
router.post('/enhanced', getEnhancedInterpretation);

export { router as chatRoutes }; 