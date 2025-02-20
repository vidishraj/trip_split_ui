// currencyData.tsx
import React from 'react';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CurrencyPoundIcon from '@mui/icons-material/CurrencyPound';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { Currency } from './types';

export const currencies: Currency[] = [
  { label: 'US Dollar', abr: 'usd', icon: <AttachMoneyIcon /> },
  { label: 'Indian Rupees', abr: 'inr', icon: <CurrencyRupeeIcon /> },
  { label: 'Euros', abr: 'eur', icon: <EuroIcon /> },
  { label: 'British Pound', abr: 'gbp', icon: <CurrencyPoundIcon /> },
  { label: 'Australian Dollar', abr: 'aud', icon: <CurrencyExchangeIcon /> },
  { label: 'Thai Baht', abr: 'thb', icon: <FormatBoldIcon /> },
];
