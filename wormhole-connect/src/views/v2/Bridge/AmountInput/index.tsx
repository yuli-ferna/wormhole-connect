import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from 'tss-react/mui';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import useGetTokenBalances from 'hooks/useGetTokenBalances';
import { setAmount } from 'store/transferInput';

import type { RootState } from 'store';

const useStyles = makeStyles()((theme) => ({
  amountContainer: {
    width: '100%',
    maxWidth: '420px',
  },
  amountCardContent: {
    display: 'flex',
    alignItems: 'center',
  },
  amountTitle: {
    color: theme.palette.text.secondary,
    display: 'flex',
    minHeight: '40px',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

/**
 * Renders the input control to set the transaction amount
 */
const AmountInput = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch();
  const [amountValue, setAmountValue] = useState('');

  const { sending: sendingWallet } = useSelector(
    (state: RootState) => state.wallet,
  );

  const {
    supportedSourceTokens,
    fromChain: sourceChain,
    token: sourceToken,
  } = useSelector((state: RootState) => state.transferInput);

  const { balances, isFetching } = useGetTokenBalances(
    sendingWallet?.address || '',
    sourceChain,
    supportedSourceTokens || [],
  );

  const tokenBalance = useMemo(
    () => balances?.[sourceToken]?.balance || '',
    [balances, sourceToken],
  );

  const isInputDisabled = useMemo(
    () => !sourceChain || !sourceToken,
    [sourceChain, sourceToken],
  );

  const balance = useMemo(() => {
    if (isInputDisabled || !sendingWallet.address) {
      return null;
    }

    return (
      <Stack direction="row" alignItems="center">
        <Typography fontSize={14} textAlign="right" sx={{ marginRight: '4px' }}>
          Balance:
        </Typography>
        {isFetching ? (
          <CircularProgress size={14} />
        ) : (
          <Typography fontSize={14} textAlign="right">
            {tokenBalance}
          </Typography>
        )}
      </Stack>
    );
  }, [isInputDisabled, balances, tokenBalance, sendingWallet.address]);

  const maxButton = useMemo(() => {
    return (
      <Button
        sx={{ minWidth: '32px', padding: '4px' }}
        disabled={isInputDisabled || !tokenBalance}
        onClick={() => {
          if (tokenBalance) {
            setAmountValue(tokenBalance);
          }
        }}
      >
        <Typography fontSize={14} textTransform="none">
          Max
        </Typography>
      </Button>
    );
  }, [isInputDisabled, tokenBalance]);

  return (
    <div className={classes.amountContainer}>
      <div className={classes.amountTitle}>
        <Typography variant="body2">Amount:</Typography>
      </div>
      <Card variant="elevation">
        <CardContent className={classes.amountCardContent}>
          <TextField
            fullWidth
            disabled={isInputDisabled}
            inputProps={{
              style: {
                fontSize: 24,
                height: '40px',
                padding: '4px',
              },
            }}
            placeholder="0"
            variant="standard"
            value={amountValue}
            onChange={(e) => {
              setAmountValue(e.target.value);
              dispatch(setAmount(e.target.value));
            }}
            InputProps={{
              disableUnderline: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Stack alignItems="end">
                    {maxButton}
                    {balance}
                  </Stack>
                </InputAdornment>
              ),
              type: 'number',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AmountInput;
