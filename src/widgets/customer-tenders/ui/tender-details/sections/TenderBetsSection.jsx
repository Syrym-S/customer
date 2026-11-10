import { useState } from "react";
import i18n from "../../../../../shared/i18n";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import PropTypes from "prop-types";

import { TenderDetailsSection } from "./TenderDetailsSection";
import { betPropType } from "../../../model/tenders.prop-types";
import { formatAmount } from "../../../../../shared/helpers/currency-format.helpers";
import { AppDialog } from "../../../../../shared/ui/AppDialog";

const INITIAL_VISIBLE_COUNT = 3;

function formatMoney(amount, currency = "KZT") {
  const formattedAmount = formatAmount(amount);

  if (!formattedAmount) {
    return i18n.t("common.empty.notSpecifiedN");
  }

  return `${formattedAmount} ${currency}`;
}

export function TenderBetsSection({
  bets,
  tenderStatus,
  isActionLoading = false,
  onAcceptWinner,
}) {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);
  const [confirmBet, setConfirmBet] = useState(null);

  const betsWithIndex = bets
    .map((bet, index) => ({
      bet,
      index,
    }))
    .reverse();

  const hasHiddenItems = bets.length > INITIAL_VISIBLE_COUNT;

  const visibleBets = isExpanded
    ? betsWithIndex
    : betsWithIndex.slice(0, INITIAL_VISIBLE_COUNT);

  const hiddenItemsCount = bets.length - INITIAL_VISIBLE_COUNT;

  function handleToggleExpanded() {
    setIsExpanded((prev) => !prev);
  }

  function handleOpenConfirm(bet, betIndex) {
    setConfirmBet({
      bet,
      betIndex,
    });
  }

  function handleCloseConfirm() {
    setConfirmBet(null);
  }

  async function handleConfirmWinner() {
    if (!confirmBet || isActionLoading) {
      return;
    }

    const isSuccess = await onAcceptWinner?.(
      confirmBet.betIndex,
      confirmBet.bet,
    );

    if (isSuccess !== false) {
      setConfirmBet(null);
    }
  }

  console.log("bets", bets);

  return (
    <>
      <TenderDetailsSection
        icon={<PaidOutlinedIcon />}
        title={t("tenders.bids.title")}
        subtitle={`${bets.length}`}
      >
        {bets.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            {t("tenders.bids.empty")}
          </Typography>
        ) : (
          <Stack
            spacing={1.25}
            sx={{
              maxHeight: isExpanded && bets.length > 6 ? 420 : "none",
              overflowY: isExpanded && bets.length > 6 ? "auto" : "visible",
              pr: isExpanded && bets.length > 6 ? 0.5 : 0,
            }}
          >
            {visibleBets.map(({ bet, index }) => {
              const isCancelledBet = bet.status === "loss";
              const isWinningBet = bet.status === "winning";

              const canAcceptBet =
                bet.status === "new" &&
                tenderStatus !== "closed" &&
                tenderStatus !== "cancelled";

              return (
                <Box
                  key={`${bet.participant_id}-${index}`}
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: isCancelledBet
                      ? "grey.300"
                      : isWinningBet
                        ? "#A5D6A7"
                        : "divider",
                    borderRadius: 2,
                    backgroundColor: isCancelledBet
                      ? "grey.100"
                      : isWinningBet
                        ? "#EDF7ED"
                        : "grey.50",
                    opacity: isCancelledBet ? 0.78 : 1,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        fontWeight={700}
                        sx={{
                          fontSize: 15,
                          textDecoration: isCancelledBet
                            ? "line-through"
                            : "none",
                          color: isCancelledBet
                            ? "text.secondary"
                            : isWinningBet
                              ? "#1E4620"
                              : "text.primary",
                        }}
                      >
                        {formatMoney(bet.amount, bet.currency)}
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: 12,
                          mt: 0.5,
                          color: isCancelledBet
                            ? "text.secondary"
                            : isWinningBet
                              ? "#1E4620"
                              : "text.primary",
                        }}
                      >
                        {bet.company_name ||
                          bet.participant_id ||
                          t("tenders.bids.participantUnknown")}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="flex-end"
                      sx={{
                        ml: "auto",
                        flexWrap: "wrap",
                      }}
                    >
                      {isCancelledBet && (
                        <Chip
                          label={t("tenders.bids.statusCancelled")}
                          variant="outlined"
                          size="small"
                          color="error"
                        />
                      )}

                      {isWinningBet && (
                        <Chip
                          label={t("tenders.bids.statusWinning")}
                          variant="outlined"
                          size="small"
                          color="success"
                        />
                      )}
                      {canAcceptBet && (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={isActionLoading}
                          onClick={() => handleOpenConfirm(bet, index)}
                          sx={{
                            height: 24,
                            px: 1,
                            py: 0,
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1,
                            textTransform: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {t("tenders.bids.chooseWinner")}
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                  {bet.comment && (
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 13,
                        lineHeight: 1.35,
                        color: "text.secondary",
                      }}
                    >
                      {bet.comment}
                    </Typography>
                  )}
                </Box>
              );
            })}

            {hasHiddenItems && (
              <Button
                size="small"
                onClick={handleToggleExpanded}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                }}
              >
                {isExpanded
                  ? t("common.actions.hide")
                  : t("tenders.bids.showAll", { count: hiddenItemsCount })}
              </Button>
            )}
          </Stack>
        )}
      </TenderDetailsSection>

      <AppDialog
        open={Boolean(confirmBet)}
        onClose={handleCloseConfirm}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{t("tenders.bids.chooseWinner")}</DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {t("tenders.bids.confirmWinner")}
            <br />
            {t("tenders.bids.irreversible")}
          </Typography>

          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              backgroundColor: "grey.50",
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {t("common.fields.company")}
            </Typography>

            <Typography fontWeight={600} sx={{ mb: 1 }}>
              {confirmBet?.bet.participant_name ||
                confirmBet?.bet.participant_id ||
                t("tenders.bids.participantUnknown")}
            </Typography>

            <Typography color="text.secondary" sx={{ fontSize: 12 }}>
              {t("tenders.bids.amount")}
            </Typography>

            <Typography fontWeight={700} sx={{ mb: 1 }}>
              {formatMoney(confirmBet?.bet.amount, confirmBet?.bet.currency)}
            </Typography>

            {confirmBet?.bet.comment && (
              <>
                <Typography color="text.secondary" sx={{ fontSize: 12 }}>
                  {t("common.fields.comment")}
                </Typography>

                <Typography sx={{ fontSize: 14 }}>
                  {confirmBet.bet.comment}
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseConfirm}>{t("common.actions.cancel")}</Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmWinner}
            disabled={isActionLoading}
          >
            {isActionLoading ? t("tenders.bids.choosing") : t("tenders.bids.confirmChoice")}
          </Button>
        </DialogActions>
      </AppDialog>
    </>
  );
}

TenderBetsSection.propTypes = {
  bets: PropTypes.arrayOf(betPropType).isRequired,
  onAcceptWinner: PropTypes.func,
  tenderStatus: PropTypes.string,
  isActionLoading: PropTypes.bool,
};
