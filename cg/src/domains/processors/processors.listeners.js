const { listenForErasureRequest, listenForConsent } = require('./../../utils/blockchain');
const { getDataForSubject } = require('./processors.requests');
const { blockUntilContractReady } = require('./processors.helpers');
const { inControllerMode } = require('../../utils/helpers');
const SubjectService = require('./../subjects/subjects.service');
const winston = require('winston');

const subjectService = new SubjectService();

const startErasureRequestListener = () => {
  return listenForErasureRequest(async subjectId => {
    winston.info(`Erasure request received for ${subjectId}`);
    await subjectService.eraseDataAndRevokeConsent(subjectId);
  });
};

const startConsentListener = () => {
  return listenForConsent(async subjectId => {
    // if consent given, get data and store it in our d
    winston.info(`Consent received for ${subjectId}`);
    const response = await getDataForSubject(subjectId).catch(err => {
      return Promise.reject(err);
    });
    await subjectService.initializeUser(subjectId, await response.json());
  });
};

const startAll = async () => {
  if (inControllerMode()) {
    return;
  }

  await blockUntilContractReady();

  winston.info(`Starting listeners in processor mode`);
  await startConsentListener();
  await startErasureRequestListener();
};

module.exports = {
  startAll
};