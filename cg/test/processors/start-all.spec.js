jest.mock('../../src/utils/blockchain');
jest.mock('../../src/utils/helpers');
jest.mock('../../src/domains/processors/processors.helpers');

const blockchain = require('../../src/utils/blockchain');
const helpers = require('../../src/utils/helpers');
const processorHelpers = require('../../src/domains/processors/processors.helpers');

const { startAll } = require('../../src/domains/processors/processors.listeners');

beforeEach(() => {
  blockchain.listenForConsent.mockClear();
  blockchain.listenForErasureRequest.mockClear();
  helpers.inControllerMode.mockClear();
  processorHelpers.blockUntilContractReady.mockClear();
});

describe('Starting listeners', () => {
  it('should wait for contract when in processor mode', async () => {
    helpers.inControllerMode.mockImplementationOnce(() => false);
    await startAll();
    expect(processorHelpers.blockUntilContractReady).toHaveBeenCalled();
  });

  it('should start listeners when in processor mode', async () => {
    helpers.inControllerMode.mockImplementationOnce(() => false);
    await startAll();
    expect(blockchain.listenForConsent).toHaveBeenCalled();
    expect(blockchain.listenForErasureRequest).toHaveBeenCalled();
  });

  it('should not wait for contract when in controller mode', async () => {
    helpers.inControllerMode.mockImplementationOnce(() => true);
    await startAll();
    expect(processorHelpers.blockUntilContractReady).not.toHaveBeenCalled();
  });

  it('should not start listeners when in controller mode', async () => {
    helpers.inControllerMode.mockImplementationOnce(() => true);
    await startAll();
    expect(blockchain.listenForConsent).not.toHaveBeenCalled();
    expect(blockchain.listenForErasureRequest).not.toHaveBeenCalled();
  });
});