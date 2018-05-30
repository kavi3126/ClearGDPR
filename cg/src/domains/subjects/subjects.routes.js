const express = require('express');
const { verifyJWT } = require('./subjects.helpers');
const { requireSubjectId, transformSubjectId } = require('./subjects.helpers');
const asyncHandler = require('express-async-handler');
const { controllerOnly } = require('./../../utils/middleware');

const router = express.Router();

const SubjectsController = require('./subjects.controller');
const subjectsController = new SubjectsController();

const ProcessorsController = require('./processors.controller');
const processorsController = new ProcessorsController();

module.exports = app => {
  // not using router, because this is a publicly open endpoint (no need to verify JWT)
  // also needs to be registered before other routes under /subject, so don't reorder

  app.use('/subject', router);

  // UNSECURED ENDPOINTS

  router.get(
    '/processors',
    controllerOnly,
    asyncHandler(processorsController.getProcessors.bind(processorsController))
  );

  // JWT SECURED ENDPOINTS.

  router.use(verifyJWT, requireSubjectId, transformSubjectId);

  router.post(
    '/give-consent',
    controllerOnly,
    asyncHandler(async (req, res) => subjectsController.giveConsent(req, res))
  );

  router.post(
    '/erase-data',
    controllerOnly,
    asyncHandler(async (req, res) => subjectsController.eraseData(req, res))
  );

  router.get(
    '/access-data',
    asyncHandler(async (req, res) => subjectsController.requestDataAccess(req, res))
  );

  router.get(
    '/data-status',
    asyncHandler(async (req, res) => subjectsController.getPersonalDataStatus(req, res))
  );
};