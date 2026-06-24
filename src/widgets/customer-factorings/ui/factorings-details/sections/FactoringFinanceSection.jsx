import { Box } from '@mui/material';
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { formatMoney, formatPercent } from '../../../model/factorings.helpers';

export function FactoringFinanceSection({ factoring }) {
    return (
        <DetailSection
            icon={<AccountBalanceWalletOutlinedIcon />}
            title='Финансы'
            subtitle='Суммы, валюта и ставка факторинга'
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 1,
                }}
            >
                <InfoBadge
                    label='Дебиторская сумма'
                    value={formatMoney(
                        factoring.deb_summ,
                        factoring.deb_currency,
                    )}
                    accent
                />

                <InfoBadge
                    label='Кредитная сумма'
                    value={formatMoney(factoring.cred_summ, factoring.currency)}
                    accent
                />

                <InfoBadge
                    label='Ставка факторинга'
                    value={formatPercent(factoring.proc_factor)}
                />

                <InfoBadge
                    label='Сервисная ставка'
                    value={formatPercent(factoring.proc_service)}
                />

                <InfoBadge
                    label='Валюта дебиторской суммы'
                    value={factoring.deb_currency || 'KZT'}
                />

                <InfoBadge
                    label='Валюта факторинга'
                    value={factoring.currency || 'KZT'}
                />
            </Box>
        </DetailSection>
    );
}
