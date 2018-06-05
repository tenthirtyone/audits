import assertRevert, { assertError } from '../helpers/assertRevert'
import { increaseTimeTo, duration } from '../helpers/increaseTime';

const BigNumber = web3.BigNumber

const DAPP = artifacts.require('DAPP')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('Core Test', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let dapp = null

  beforeEach(async () => {
    dapp = await DAPP.new()
  })

  describe('DAPP', () => {
    describe('Constructor', async () => {
      it('Has a Founder', async () => {
        const founder = await dapp.founderAddress();
        founder.should.be.equal(creator);
      })
      it('Has an Owner', async () => {
        const owner = await dapp.owner();
        owner.should.be.equal(creator);
      })
      it('Can transfer Ownership', async () => {
        await dapp.transferOwnership(mallory);
        const owner = await dapp.owner();
        owner.should.be.equal(mallory);
      })
      it('Can selfDestruct', async() => {
        await dapp.selfDestruct();
        const owner = await dapp.owner();
        owner.should.be.equal('0x0');
      })
      it('Can be paused', async() => {
        await dapp.pause();
        const pause = await dapp.paused();
        pause.should.be.equal(true);
      })
      it('Can be unpaused', async() => {
        await dapp.pause();
        await dapp.unpause();
        const pause = await dapp.paused();
        pause.should.be.equal(false);
      })
      it('Has a Genesis Campaign', async () => {
        const genCampaign = await dapp.getCampaign(0);
        genCampaign[1].should.be.equal('Genesis Campaign')
      })
      it('Has a Genesis Certificate', async () => {
        const genCertificate = await dapp.getCertificate(0, 0);
        genCertificate[3].should.be.equal('Genesis Certificate')
      })
      it('Has a Genesis Token', async () => {
        const genToken = await dapp.getToken(0);
        genToken[3].should.be.equal(creator);
      })
    })
    describe('Managers', async () => {
      it('Adds a manager and creates a campaign', async () => {
        await dapp.addManager(mallory);
        await dapp.createCampaign('Test Campaign', '501cid', {from: mallory});
      })
      it('Removes a manager and fails to create a campaign', async () => {
        await dapp.removeManager(mallory);
        await assertRevert(dapp.createCampaign('Test Campaign', '501cid', { from: mallory }));
      })
    })
    describe('Escrow', async () => {
      it('Has escrow amount', async () => {
        const escrow = await dapp.campaignEscrowAmount()
        escrow.should.be.bignumber.equal(0);
      })
      it('Changes escrow amount', async () => {
        const oldEscrow = await dapp.campaignEscrowAmount()
        oldEscrow.should.be.bignumber.equal(0);

        await dapp.changeEscrowAmount(10000);

        const newEscrow = await dapp.campaignEscrowAmount()
        newEscrow.should.be.bignumber.equal(10000);
      })
    })
    describe('User Land', async () => {
      beforeEach(async () => {
        await dapp.createCampaign('Test Campaign', '501cid');
        await dapp.createCertificate(1, 10, "Test Certificate", 10);
        await dapp.activateCampaign(1);
      })
      it('Creates a campaign', async() => {
        await dapp.createCampaign('Test Campaign', '501cid');
        const balance = await dapp.campaignBalance(1);
        balance.should.be.bignumber.equal(0);
      })
    })
    describe('Fail cases', async () => {
      it('Cannot create a campaign if they are not a manager', async () => {
        await assertRevert(dapp.createCampaign('Test Campaign', '501cid', {from: mallory}));
      })
      it('Fails if it does not include escrow', async () => {
        await dapp.changeEscrowAmount(10000);
        await assertRevert(dapp.createCampaign("Fail Campaign", "501cid"))
      })
      it('Fails to add a certificate if sender is not the campaign owner', async () => {
        await assertRevert(dapp.createCertificate(1, 10, "Test Certificate", 10, {from: mallory}));
      })
      it('Fails to add a certificate if campaign Id = 0', async () => {
        await assertRevert(dapp.createCertificate(0, 10, "Test Certificate", 10));
      })
      it('Fails to transfer Ownership if not the owner', async () => {
        await assertRevert(dapp.transferOwnership(mallory, { from: mallory }));
      })
      it('Fails to selfDestruct if not the owner', async () => {
        await assertRevert(dapp.selfDestruct({ from: mallory }));
      })
      it('Cannot be paused by non-owners', async () => {
        await assertRevert(dapp.pause({ from: mallory }));
      })
      it('Cannot be unpaused by non-owners', async () => {
        await assertRevert(dapp.unpause({ from: mallory }));
      })
      it('Cannot create a campaign if paused', async() => {
        await dapp.pause();
        await assertRevert(dapp.createCampaign('Test Campaign', '501cid'));
      })
      it('Cannot create a certificate if paused', async() => {
        await dapp.pause();
        await assertRevert(dapp.createCertificate(1, 10, "Test Certificate", 10));
      })
      it('Cannot update a certifciate if paused', async() => {
        await dapp.pause();
        await assertRevert(dapp.updateCertificate(1, 0, 5, "Test Certificate2", 5));
      })
      it('Cannot create a token if paused', async() => {
        await dapp.pause();
        await assertRevert( dapp.createToken(1, 0, { value: 10 }));
      })
    })
  })
})

