import { Box, Button } from "@mui/material";
import PropTypes from "prop-types";

export function TenderDetailsEditActions({
   isEditing,
   onStartEdit,
   onCancelEdit,
}) {
   return (
      <Box
         sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
            mb: 2,
         }}
      >
         {isEditing ? (
            <Button onClick={onCancelEdit}>Отмена</Button>
         ) : (
            <Button variant="outlined" onClick={onStartEdit}>
               Изменить
            </Button>
         )}
      </Box>
   );
}

TenderDetailsEditActions.propTypes = {
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};
