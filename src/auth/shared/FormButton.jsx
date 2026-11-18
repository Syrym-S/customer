import { Button } from '@mui/material';

export default function FormButton({ variant = 'contained', sx, ...props }) {
  return (
    <Button
      {...props}
      variant={variant}
      sx={[
        {
          minHeight: 40,
          px: 2.5,
          py: 1,
          borderRadius: '10px',
          textTransform: 'none',
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
          '&.MuiButton-contained:not(.Mui-disabled)': {
            color: '#fff',
            backgroundColor: 'rgb(24, 87, 196)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.22)',
            '&:hover': { backgroundColor: 'rgb(20, 74, 167)' },
          },
          '&.MuiButton-outlined:not(.Mui-disabled)': {
            color: 'rgb(24, 87, 196)',
            borderColor: 'rgb(24, 87, 196)',
            backgroundColor: '#f5f7fa',
            '&:hover': {
              borderColor: 'rgb(24, 87, 196)',
              backgroundColor: 'rgba(24, 87, 196, 0.06)',
            },
          },
          '&.MuiButton-text:not(.Mui-disabled)': {
            color: 'rgb(24, 87, 196)',
            '&:hover': { backgroundColor: 'rgba(24, 87, 196, 0.06)' },
          },
          '&.MuiButton-sizeSmall': {
            minHeight: 32,
            px: 1.5,
            py: 0.5,
            fontSize: '14px',
          },
          '& .MuiButton-startIcon': { mr: 1.5 },
          '&.Mui-focusVisible': {
            outline: '3px solid rgba(24, 87, 196, 0.4)',
            outlineOffset: 2,
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}
