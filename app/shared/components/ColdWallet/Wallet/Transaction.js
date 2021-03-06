// @flow
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { get, set } from 'dot-prop-immutable';

import { Button, Container, Header, Message, Segment } from 'semantic-ui-react';

import GlobalTransactionViewActions from '../../Global/Transaction/View/Actions';
import GlobalTransactionViewDetail from '../../Global/Transaction/View/Detail';
import GlobalTransactionViewFull from '../../Global/Transaction/View/Full';

import EOSTransaction from '../../../utils/EOS/Transaction';

const { ipcRenderer } = require('electron');

class ColdWalletTransaction extends Component<Props> {
  props: Props;

  componentWillReceiveProps(nextProps) {
    const { transaction } = this.props;
    if (!transaction.signed && nextProps.transaction.signed) {
      this.saveFile(nextProps.transaction);
    }
  }

  saveFile = (tx = false) => {
    const { settings, transaction } = this.props;
    const data = new EOSTransaction(tx || transaction);
    ipcRenderer.send('saveFile', settings.lastFilePath, data.json(), 'signed');
  }

  clearTransaction = () => {
    this.props.actions.clearTransaction();
  }

  signTransaction = () => {
    const {
      transaction
    } = this.props;
    this.props.actions.signTransaction(transaction.data, transaction.contract);
  }

  render() {
    const {
      settings,
      t,
      transaction
    } = this.props;
    const {
      data,
      signed
    } = transaction;
    const { expiration } = data.transaction.transaction;
    const { account, authorization } = settings;
    const auth = get(data, 'transaction.transaction.actions.0.authorization.0', {
      actor: 'undefined',
      permission: 'undefined',
    });
    const matchingAuthorization = (account === auth.actor && authorization === auth.permission)
    const expires = new Date(`${expiration}z`);
    const now = new Date();
    const expired = (now > expires);
    const disabled = (signed);
    return (
      <Segment basic>
        <Segment attached="top">
          <Header size="large">
            {t('coldwallet_transaction_signature_request_title')}
            <Header.Subheader>
              {t('coldwallet_transaction_signature_request_content')}
            </Header.Subheader>
          </Header>
          <GlobalTransactionViewDetail
            expired={expired}
            signed={signed}
            transaction={transaction}
          />
          <Container textAlign="center">
            {(expired)
              ? (
                <Message error>
                  {t('coldwallet_transaction_invalid_expired')}
                </Message>
              )
              : false
            }
            {(!matchingAuthorization)
              ? (
                <Message error>
                  {t('coldwallet_transaction_invalid_authorization', auth)}
                </Message>
              )
              : false
            }
            {(!signed && matchingAuthorization)
              ? (
                <Button
                  color="orange"
                  content={t('collwallet_transaction_sign_confirm')}
                  disabled={disabled}
                  icon="signup"
                  onClick={this.signTransaction}
                  size="large"
                />
              )
              : false
            }
            {(signed)
              ? (
                <Button
                  color="purple"
                  content={t('collwallet_transaction_sign_save_again')}
                  icon="save"
                  onClick={() => this.saveFile(transaction)}
                  size="large"
                />
              )
              : false
            }
            <Button
              color="grey"
              content={t('close')}
              icon="x"
              onClick={this.clearTransaction}
              size="large"
            />
          </Container>
        </Segment>
        <Segment attached>
          <GlobalTransactionViewActions
            actions={data.transaction.transaction.actions}
          />
        </Segment>
        <Segment attached>
          <GlobalTransactionViewFull
            transaction={data}
          />
        </Segment>
      </Segment>
    );
  }
}

export default translate('coldwallet')(ColdWalletTransaction);
