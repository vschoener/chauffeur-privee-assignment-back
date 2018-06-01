// @flow

import { Router } from 'express';

// Import all Controller (Micro service shouldn't have much right ?)
import helloController from './hello/hello.controller';

const router: Router = Router();

// List all route here

/**
 * @api {get} /v1/hello/:name/:id get welcome message
 * @apiGroup Hello
 *
 * @apiDescription get welcome message
 *
 * @apiParam {String} name the name of a user
 * @apiParam {String} id some identifier
 *
 * @apiSuccess {String} welcome message
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    message: 'Welcome Robert (id: 32)!'
 *  }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 500 INTERNAL_SERVER_ERROR
 *     {
 *       message: 'Invalid request'
 *     }
 *
 */
router.get('/:name/:id', helloController.getWelcomeMessage);

export default router;
