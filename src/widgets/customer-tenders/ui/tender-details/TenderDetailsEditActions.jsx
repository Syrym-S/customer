import { Box, Button, IconButton, Tooltip } from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PropTypes from "prop-types";

import { isCancelledTender, isClosedTender } from "../../model/tender.helpers";
import { tenderPropType } from "../../model/tenders.prop-types";

export function TenderDetailsEditActions({
   tender,
   isEditing,
   onStartEdit,
   onCancelEdit,
}) {
   const isEditDisabled = isClosedTender(tender) || isCancelledTender(tender);
   const editTooltipTitle = isEditDisabled
      ? "Нельзя редактировать закрытый или отменённый аукцион"
      : "Изменить";

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
            <Tooltip title={editTooltipTitle}>
               <span>
                  <IconButton
                     color="primary"
                     aria-label="Изменить"
                     onClick={onStartEdit}
                     disabled={isEditDisabled}
                  >
                     <EditOutlinedIcon fontSize="small" />
                  </IconButton>
               </span>
            </Tooltip>
         )}
      </Box>
   );
}

TenderDetailsEditActions.propTypes = {
   tender: tenderPropType,
   isEditing: PropTypes.bool.isRequired,
   onStartEdit: PropTypes.func.isRequired,
   onCancelEdit: PropTypes.func.isRequired,
};
