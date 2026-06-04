import {
   Box,
   Button,
   Container,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Drawer,
   IconButton,
   List,
   ListItemButton,
   ListItemText,
   Menu,
   MenuItem,
   Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Header() {
   const [isBurgerOpen, setIsBurgerOpen] = useState(false);
   const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
   const [profileAnchorEl, setProfileAnchorEl] = useState(null);

   const location = useLocation();
   const navigate = useNavigate();

   const isProfileMenuOpen = Boolean(profileAnchorEl);
   const isCustomerPage = location.pathname === '/customer';

   function handleNavigate(path) {
      if (location.pathname === path) return;

      navigate(path);
      setIsBurgerOpen(false);
   }

   function handleOpenLogoutModal() {
      setProfileAnchorEl(null);
      setIsLogoutModalOpen(true);
   }

   function handleConfirmLogout() {
      setIsLogoutModalOpen(false);
      console.log('logout');
   }

   function handleCloseLogoutModal() {
      setIsLogoutModalOpen(false);
   }

   function handleCloseBurger() {
      setIsBurgerOpen(false);
   }

   return (
      <Box
         component='header'
         sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            borderBottom: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
         }}
      >
         <Container maxWidth='xl'>
            <Box
               sx={{
                  height: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
               }}
            >
               <IconButton onClick={() => setIsBurgerOpen(true)}>
                  <MenuIcon />
               </IconButton>

               <Typography fontWeight={500}>Header</Typography>

               <Button
                  variant='outlined'
                  onClick={(event) => setProfileAnchorEl(event.currentTarget)}
               >
                  User
               </Button>
            </Box>
         </Container>

         <Drawer
            open={isBurgerOpen}
            onClose={handleCloseBurger}
            slotProps={{
               paper: {
                  sx: {
                     width: {
                        xs: '100%',
                        sm: 280,
                     },
                  },
               },
            }}
         >
            <Box sx={{ p: 2 }}>
               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                     mb: 2,
                  }}
               >
                  <Typography fontWeight={600}>Menu</Typography>

                  <IconButton
                     onClick={handleCloseBurger}
                     aria-label='Закрыть меню'
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>

               <List>
                  <ListItemButton
                     selected={isCustomerPage}
                     onClick={() => {
                        if (isCustomerPage) {
                           handleCloseBurger();
                           return;
                        }

                        handleNavigate('/customer');
                     }}
                  >
                     <ListItemText
                        primary='Customer'
                        primaryTypographyProps={{
                           sx: {
                              color: isCustomerPage
                                 ? 'primary.main'
                                 : 'text.primary',
                              fontWeight: isCustomerPage ? 600 : 400,
                           },
                        }}
                     />
                  </ListItemButton>
               </List>
            </Box>
         </Drawer>

         <Menu
            anchorEl={profileAnchorEl}
            open={isProfileMenuOpen}
            onClose={() => setProfileAnchorEl(null)}
         >
            <MenuItem onClick={() => handleNavigate('/profile')}>
               Профиль
            </MenuItem>

            <MenuItem>Настройки</MenuItem>

            <MenuItem onClick={handleOpenLogoutModal}>Выход</MenuItem>
         </Menu>

         <Dialog open={isLogoutModalOpen} onClose={handleCloseLogoutModal}>
            <DialogTitle>Выход из аккаунта</DialogTitle>

            <DialogContent>
               <DialogContentText>
                  Вы уверены, что хотите выйти?
               </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={handleCloseLogoutModal}>Отмена</Button>

               <Button
                  color='error'
                  variant='contained'
                  onClick={handleConfirmLogout}
               >
                  Выйти
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
