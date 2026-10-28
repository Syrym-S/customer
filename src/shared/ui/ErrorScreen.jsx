import { Box, Button, Stack, Typography } from "@mui/material";
import PropTypes from "prop-types";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

export function ErrorScreen({
  code = null,
  title = "Что-то пошло не так",
  message,
  onBack = null,
}) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        backgroundColor: "#F5F6F8",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 430,
          overflow: "hidden",
          borderRadius: 1,
          backgroundColor: "#fff",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
        }}
      >
        <Box
          sx={{
            height: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1976D2 0%, #1070d0 100%)",
          }}
        >
          {code && (
            <Typography
              sx={{
                fontSize: "clamp(100px, 18vw, 130px)",
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: "-0.08em",
                color: "white",
                userSelect: "none",
              }}
            >
              {code}
            </Typography>
          )}
        </Box>

        <Stack
          spacing={2}
          alignItems="center"
          textAlign="center"
          sx={{
            px: 4,
            py: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#27364D",
              fontSize: {
                xs: 28,
                sm: 32,
              },
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              color: "#6B7280",
              fontSize: 16,
              lineHeight: 1.5,
              maxWidth: 330,
            }}
          >
            {message}
          </Typography>

          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={() => window.location.reload()}
            sx={{
              mt: 1,
              minWidth: 150,
              height: 44,
              borderRadius: "22px",
              textTransform: "none",
              fontSize: 15,
              fontWeight: 600,
              backgroundColor: "#1976D2",
              boxShadow: "none",

              "&:hover": {
                backgroundColor: "#2651dc",
                boxShadow: "0 5px 15px rgba(68, 136, 239, 0.25)",
              },
            }}
          >
            Обновить
          </Button>

          {onBack && (
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={onBack}
              sx={{
                height: 44,
                minWidth: 130,
                borderRadius: "22px",
                textTransform: "none",
                fontSize: 15,
                fontWeight: 600,
                borderColor: "#D1D5DB",
                color: "#4B5563",

                "&:hover": {
                  borderColor: "#9CA3AF",
                  backgroundColor: "#F9FAFB",
                },
              }}
            >
              Назад
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

ErrorScreen.propTypes = {
  code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  title: PropTypes.string,
  message: PropTypes.string,
  onBack: PropTypes.func,
};
