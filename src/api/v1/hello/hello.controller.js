// @flow

import * as HttpStatus from 'http-status-codes';
import type { $Request, $Response } from 'express';

/**
 * Get welcome message
 * @param {Object} req express request
 * @param {Object} res express response
 */
function getWelcomeMessage(req: $Request, res: $Response): $Response {
  const { name, id } = req.params;

  return res.status(HttpStatus.OK).json({ message: `Welcome ${name} (id: ${id})! :)` });
}

const helloController = {
  getWelcomeMessage,
};

export default helloController;
