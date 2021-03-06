import * as types from '../types';
import * as AccountActions from '../accounts';
import eos from '../helpers/eos';

export function undelegatebw(delegator, receiver, netAmount, cpuAmount) {
  return (dispatch: () => void, getState) => {
    const {
      connection
    } = getState();

    dispatch({
      payload: { connection },
      type: types.SYSTEM_UNDELEGATEBW_PENDING
    });

    return eos(connection, true).transaction(tr => {
      tr.undelegatebw(undelegatebwParams(connection.chainSymbol || 'SNAX', delegator, receiver, netAmount, cpuAmount));
    }).then((tx) => {
      dispatch(AccountActions.getAccount(delegator));
      return dispatch({
        payload: {
          connection,
          tx
        },
        type: types.SYSTEM_UNDELEGATEBW_SUCCESS
      });
    }).catch((err) => dispatch({
      payload: {
        connection,
        err
      },
      type: types.SYSTEM_UNDELEGATEBW_FAILURE
    }));
  };
}

export function undelegatebwParams(chainSymbol, delegator, receiver, netAmount, cpuAmount) {
  const unstakeNetAmount = parseFloat(netAmount) || 0;
  const unstakeCpuAmount = parseFloat(cpuAmount) || 0;

  return {
    from: delegator,
    receiver,
    unstake_net_quantity: `${unstakeNetAmount.toFixed(4)} ${chainSymbol}`,
    unstake_cpu_quantity: `${unstakeCpuAmount.toFixed(4)} ${chainSymbol}`,
    transfer: 0
  };
}

export default {
  undelegatebw,
  undelegatebwParams
};
