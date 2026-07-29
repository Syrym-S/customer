import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Divider,
  Pagination,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import { useFactoringsContext } from "../../customer-factorings/model/useFactoringsContext";
import { DashboardFactoringItem } from "./DashboardFactoringItem";
import { FactoringDetailsModal } from "../../customer-factorings/ui/FactoringDetailsModal";

const DASHBOARD_FACTORING_PER_PAGE = 5;

export function DashboardFactoringsSection() {
  const {
    factorings,

    isLoading,
    loadError,

    selectedFactoring,
    isDetailsOpen,
    isDetailsLoading,
    detailsError,

    isAccepting,
    acceptError,

    closeFactoringDetails,

    acceptFactoring,
  } = useFactoringsContext();

  const [page, setPage] = useState(1);

  const pageCount = Math.max(
    1,
    Math.ceil(factorings.length / DASHBOARD_FACTORING_PER_PAGE),
  );

  const paginatedFactorings = useMemo(() => {
    const startIndex = (page - 1) * DASHBOARD_FACTORING_PER_PAGE;
    const endIndex = startIndex + DASHBOARD_FACTORING_PER_PAGE;

    return factorings.slice(startIndex, endIndex);
  }, [factorings, page]);

  function handlePageChange(_, value) {
    setPage(value);
  }

  useEffect(() => {
    setPage(1);
  }, [factorings.length]);

  return (
    <Paper
      variant="outlined"
      sx={{
        height: {
          xs: "auto",
          lg: 500,
        },
        borderRadius: 2,
        p: 2,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            Факторинги
          </Typography>

          <Typography color="text.secondary" fontSize={14}>
            Список Факторингов
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {loadError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {loadError}
        </Alert>
      )}

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          pr: 0.5,
          minHeight: 0,
        }}
      >
        {isLoading && (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            Загрузка факторингов...
          </Typography>
        )}

        {!isLoading && Boolean(factorings.length) && (
          <Stack spacing={1.25}>
            {paginatedFactorings.map((factoring) => (
              <DashboardFactoringItem
                key={factoring.id}
                factoring={factoring}
              />
            ))}
          </Stack>
        )}
      </Box>

      {factorings.length > DASHBOARD_FACTORING_PER_PAGE && (
        <Pagination
          color="primary"
          shape="rounded"
          size="small"
          page={page}
          count={pageCount}
          onChange={handlePageChange}
          sx={{
            mt: 1.5,
            mx: "auto",
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        />
      )}

      <FactoringDetailsModal
        open={isDetailsOpen}
        factoring={selectedFactoring}
        loading={isDetailsLoading}
        error={detailsError}
        accepting={isAccepting}
        acceptError={acceptError}
        onClose={closeFactoringDetails}
        onAccept={acceptFactoring}
      />
    </Paper>
  );
}
