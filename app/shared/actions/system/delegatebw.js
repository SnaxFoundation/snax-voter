import * as types from '../types';
import * as AccountActions from '../accounts';
import eos from '../helpers/eos';

export function delegatebw(delegator, receiver, netAmount, cpuAmount) {
  return (dispatch: () => void, getState) => {
    const {
      connection
    } = getState();

    dispatch({
      payload: { connection },
      type: types.SYSTEM_DELEGATEBW_PENDING
    });

    return eos(connection, true).transaction(tr => {
      tr.delegatebw(delegatebwParams(connection.chainSymbol || 'SNAX', delegator, receiver, netAmount, cpuAmount));
    }, {
      broadcast: connection.broadcast,
      expireInSeconds: connection.expireInSeconds,
      sign: connection.sign
    }).then((tx) => {
      dispatch(AccountActions.getAccount(delegator));
      return dispatch({
        payload: {
          connection,
          tx
        },
        type: types.SYSTEM_DELEGATEBW_SUCCESS
      });
    }).catch((err) => dispatch({
      payload: {
        connection,
        err
      },
      type: types.SYSTEM_DELEGATEBW_FAILURE
    }));
  };
}

export function delegatebwParams(chainSymbol, delegator, receiver, netAmount, cpuAmount, transferTokens) {
  const stakeNetAmount = parseFloat(netAmount) || 0;
  const stakeCpuAmount = parseFloat(cpuAmount) || 0;

  return {
    from: delegator,
    receiver,
    stake_net_quantity: `${stakeNetAmount.toFixed(4)} ${chainSymbol}`,
    stake_cpu_quantity: `${stakeCpuAmount.toFixed(4)} ${chainSymbol}`,
    transfer: transferTokens ? 1 : 0
  };
}

export default {
  delegatebw
};
