import { useEffect, useState } from 'react';
import { getWeb3, getWallet } from './utils.js';
import Header from './Header';
import NewTransfer from './NewTransfer';
import TransferList from './TransferList';

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [wallet, setWallet] = useState(undefined);
  const [approvers, setApprovers] = useState([]);
  const [quorum, setQuorum] = useState(undefined);
  const [transfers, setTransfers] = useState([]);
  const [approvals, setApprovals] = useState([]);

  useEffect(() => {
    const init = async () => {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const wallet = await getWallet(web3);
      const approvers = await wallet.methods.getApprovers().call();
      const quorum = await wallet.methods.quorum().call();

      setWeb3(web3);
      setAccounts(accounts);
      setApprovers(approvers);
      setQuorum(quorum);
      setWallet(wallet);
      // NOTE: wallet is not set in the functions yet as setState is async
      // and I don't want to pass it around, so I am calling it directly
      // without calling the function
      const transfers = await wallet.methods.getTransfers().call();
      setTransfers(transfers);
      const approvals = await Promise.all(transfers.map(async (transfer) => {
        return await wallet
          .methods
          .isApprovedBy(transfer.id)
          .call()
      }));
      setApprovals(approvals);
    }
    init();
  }, []);

  const fetchTransfers = async () => {
    const transfers = await wallet.methods.getTransfers().call();
    setTransfers(transfers);
  }

  const fetchApprovals = async () => {
    const approvals = await Promise.all(transfers.map(async (transfer) => {
      return await wallet
        .methods
        .isApprovedBy(transfer.id)
        .call()
    }));
    setApprovals(approvals);
  }

  const createTransfer = async (transfer) => {
    await wallet
      .methods
      .createTransfer(transfer.amount, transfer.to)
      .send({ from: accounts[0] });

    await fetchTransfers();
  }

  const approveTransfer = async (transferId) => {
    await wallet
      .methods
      .approveTransfer(transferId)
      .send({ from: accounts[0] });

    await fetchTransfers();
    await fetchApprovals();
  }

  if (
    typeof web3 === 'undefined' ||
    typeof accounts === 'undefined' ||
    typeof wallet === 'undefined' ||
    approvers.length === 0 ||
    typeof quorum === 'undefined'
  ) {
    return <div>Loading...</div>
  }

  return (
    <div>
      Multisig Dapp
      <Header approvers={approvers} quorum={quorum} />
      <NewTransfer createTransfer={createTransfer} />
      <TransferList transfers={transfers} approvals={approvals} approveTransfer={approveTransfer} />
    </div>
  );
}

export default App;
