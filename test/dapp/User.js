import assertRevert, { assertError } from '../helpers/assertRevert'
import { increaseTimeTo, duration } from '../helpers/increaseTime';

const BigNumber = web3.BigNumber

const DAPP = artifacts.require('DAPP')

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const expect = require('chai').expect

contract('User Test', accounts => {
  const [creator, user, anotherUser, operator, mallory] = accounts
  let dapp = null

  beforeEach(async () => {
    dapp = await DAPP.new()
  })

  describe('User', () => {
    describe('Campaigns', async () => {
      beforeEach(async () => {

      })
      it('Sets up two new campaign', async () => {
        let total = await dapp.totalCampaigns()

        await dapp.addManager(user);
        await dapp.createCampaign('User\'s Campaign', '501cid', { from: user });
        await dapp.createCertificate(1, 10, "User Test Certificate", 10e17, {from: user});
        total = await dapp.totalCampaigns()
      })
    })
  })
})

