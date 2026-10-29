import { Box } from '@mui/material';
import { useTranslation } from "react-i18next";
import { DetailSection } from '../components/DetailSection';
import { InfoBadge } from '../components/InfoBadge';

import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { formatMoney, formatPercent } from '../../../model/factorings.helpers';

export function FactoringFinanceSection({ factoring }) {
    const { t } = useTranslation();

    return (
        <DetailSection
            icon={<AccountBalanceWalletOutlinedIcon />}
            title={t("factorings.finance.title")}
            subtitle={t("factorings.finance.subtitle")}
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
                    label={t("factorings.finance.debtAmount")}
                    value={formatMoney(
                        factoring.deb_summ,
                        factoring.deb_currency,
                    )}
                    accent
                />

                <InfoBadge
                    label={t("factorings.finance.creditAmount")}
                    value={formatMoney(factoring.cred_summ, factoring.currency)}
                    accent
                />

                <InfoBadge
                    label={t("factorings.finance.factoringRate")}
                    value={formatPercent(factoring.proc_factor)}
                />

                <InfoBadge
                    label={t("factorings.finance.serviceRate")}
                    value={formatPercent(factoring.proc_service)}
                />

                <InfoBadge
                    label={t("factorings.finance.debtCurrency")}
                    value={factoring.deb_currency || 'KZT'}
                />

                <InfoBadge
                    label={t("factorings.finance.factoringCurrency")}
                    value={factoring.currency || 'KZT'}
                />

                <InfoBadge
                    label={t("common.fields.gracePeriod")}
                    value={
                        factoring.grace_period_days
                            ? t("common.units.days", { count: factoring.grace_period_days })
                            : t("common.empty.notSpecifiedN")
                    }
                />
            </Box>
        </DetailSection>
    );
}
