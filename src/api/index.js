// @flow

import { Router } from 'express';
import currentApiRouter from './v1';

const router = Router();

router.use('/v1', currentApiRouter);
router.use('/', currentApiRouter);

// We could also use a list of version and require all our api version router
// Let's keep this simple for now

export default router;
