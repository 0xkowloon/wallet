function TransferList({ transfers, approvals, approveTransfer }) {
  return (
    <div>
      <h2>Transfers</h2>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Amount</th>
            <th>To</th>
            <th>Approvals</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer, i) => (
            <tr key={transfer.id}>
              <td>{transfer.id}</td>
              <td>{transfer.amount}</td>
              <td>{transfer.to}</td>
              <td>
                {transfer.approvals}
                <button onClick={() => approveTransfer(transfer.id)} disabled={approvals[i]}>Approve</button>
              </td>
              <td>{transfer.sent ? 'yes' : 'no'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TransferList;
