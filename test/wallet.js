const { expectRevert } = require('@openzeppelin/test-helpers');
const Wallet = artifacts.require('Wallet');

contract('Wallet', (accounts) => {
  let wallet;
  beforeEach(async () => {
    wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2);
    await web3.eth.sendTransaction({ from: accounts[0], to: wallet.address, value: 1000 });
  });

  it('should have correct approvers and quorum', async () => {
    const approvers = await wallet.getApprovers();
    const quorum = await wallet.quorum();
    assert(approvers.length === 3);
    assert(approvers[0] === accounts[0]);
    assert(approvers[1] === accounts[1]);
    assert(approvers[2] === accounts[2]);
    assert(quorum.toString() === '2');
  });

  it('should create transfers', async () => {
    const receiver = accounts[5];
    await wallet.createTransfer(100, receiver, { from: accounts[0] });
    const transfers = await wallet.getTransfers();
    assert(transfers.length === 1);
    const transfer = transfers[0];
    assert(transfer.id === '0');
    assert(transfer.amount === '100');
    assert(transfer.to === receiver);
    assert(transfer.approvals === '0');
    assert(transfer.sent === false);
  });

  it('should not create transfers if sender is not approved', async () => {
    await expectRevert(
      wallet.createTransfer(100, accounts[5], { from: accounts[4] }),
      'only approver allowed',
    );
  });

  it('should increment approvals', async () => {
    await wallet.createTransfer(100, accounts[5], { from: accounts[0] });
    await wallet.approveTransfer(0, { from: accounts[0] });
    const transfers = await wallet.getTransfers();
    const transfer = transfers[0];
    assert(transfer.approvals === '1');
    assert(transfer.sent === false);
    const balance = await web3.eth.getBalance(wallet.address);
    assert(balance === '1000');
  });

  it('should send transfer if quorum reached', async () => {
    const sender = accounts[0];
    const approver = accounts[1];
    const receiver = accounts[6];
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(receiver));
    await wallet.createTransfer(100, receiver, { from: sender });
    await wallet.approveTransfer(0, { from: sender });
    await wallet.approveTransfer(0, { from: approver });
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(receiver));
    assert(balanceAfter.sub(balanceBefore).toNumber() === 100);
  });
});
